// ════════════════════════════════════════════════════════════════
//  js/pdf.js — Visualização e geração de PDF
//  viewDocument, downloadPDF, markReady
// ════════════════════════════════════════════════════════════════

function viewDocument(id) {
  const d = currentDocs.find(d => d.id === id);
  if (!d) return;
  currentDocId = id;
  document.getElementById('doc-view-title').textContent = d.typeInfo?.name || d.type;
  document.getElementById('doc-paper-content').innerHTML = d.html;
  gotoPage('document');
  window.scrollTo(0, 0);
}

function markReady() {
  if (!currentDocId) return;
  const d = currentDocs.find(d => d.id === currentDocId);
  if (d) {
    d.status = 'pronto'; d.signedAt = new Date().toISOString();
    updateDocFS(d);
  }
  renderDocsBadge(); updateDashboard();
  showNotif('Documento marcado como pronto! ✅', '✅');
}

// ════════════════════════════════════════════════════════════════
//  PDF PROFISSIONAL
//
//  FIX Bug 2: substituído tmp.innerText por extração DOM estruturada.
//  Percorre elemento a elemento, preservando hierarquia de títulos e
//  parágrafos. Isso resolve: fusão de parágrafos, perda de separação
//  de cláusulas e desaparecimento de "CONTRATANTE:" / nome na mesma linha.
//
//  FIX Bug 2 (filtro): corrigida a precedência lógica do .filter().
//  Original: t !== 'null' && ... && t !== '' || t === ''
//  Era interpretado como (condições && t !== '') || t === '',
//  fazendo linhas vazias sempre passarem (correto por acidente, mas frágil).
//  Novo: (!isJunk && t !== '') || t === '' — explícito e correto.
//
//  FIX Bug 2 (footer): addPdfFooter agora adiciona o rodapé nas páginas
//  intermediárias ANTES de addPage(), garantindo numeração completa.
// ════════════════════════════════════════════════════════════════

/**
 * Extrai linhas de texto a partir do HTML do documento
 * percorrendo o DOM elemento a elemento, preservando estrutura semântica.
 * @param {string} html
 * @returns {Array<{text: string, type: string}>}
 *   type: 'title' | 'clausula-title' | 'role' | 'body' | 'empty'
 */
function extractDocLines(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // Remove masthead e aviso OAB (serão tratados separadamente no PDF)
  tmp.querySelectorAll('.doc-masthead, .doc-aviso-oab').forEach(el => el.remove());

  const lines = [];

  function pushText(text, type) {
    const t = text.trim();
    if (!t) return;
    // Filtra valores nulos vindos de campos não preenchidos
    if (t === 'null' || t === 'nullCPF: null' || t.includes('nullCPF')) return;
    // Remove "null" embebido em strings como "Nome: null"
    const cleaned = t.replace(/\bnull\b/g, '').trim();
    if (!cleaned) return;
    lines.push({ text: cleaned, type });
  }

  function walkNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.trim();
      if (t) pushText(t, 'body');
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const tag = node.tagName.toLowerCase();
    const cls = node.className || '';

    // Título principal do documento
    if (cls.includes('doc-main-title') || tag === 'h1') {
      pushText(node.textContent, 'title');
      lines.push({ text: '', type: 'empty' });
      return;
    }

    // Subtítulo (data, nº instrumento)
    if (cls.includes('doc-subtitle')) {
      pushText(node.textContent, 'subtitle');
      lines.push({ text: '', type: 'empty' });
      return;
    }

    // Título de cláusula
    if (cls.includes('clausula-title')) {
      lines.push({ text: '', type: 'empty' });
      pushText(node.textContent, 'clausula-title');
      return;
    }

    // Corpo de cláusula — percorre internamente
    if (cls.includes('clausula-body')) {
      node.childNodes.forEach(walkNode);
      lines.push({ text: '', type: 'empty' });
      return;
    }

    // Qualificação das partes — título do bloco
    if (cls.includes('parties-title')) {
      lines.push({ text: '', type: 'empty' });
      pushText(node.textContent, 'clausula-title');
      return;
    }

    // Role da parte (CONTRATANTE, LOCATÁRIO etc.)
    if (cls.includes('party-role')) {
      pushText(node.textContent, 'role');
      return;
    }

    // Bloco de parte — percorre internamente
    if (cls.includes('party')) {
      node.childNodes.forEach(walkNode);
      lines.push({ text: '', type: 'empty' });
      return;
    }

    // Área de assinaturas — percorre internamente
    if (cls.includes('sig-area') || cls.includes('sig-block') || cls.includes('signatures')) {
      lines.push({ text: '', type: 'empty' });
      node.childNodes.forEach(walkNode);
      return;
    }

    // Linha de assinatura
    if (cls.includes('sig-line')) {
      pushText(node.textContent, 'sig');
      return;
    }

    // Parágrafo simples
    if (tag === 'p') {
      pushText(node.textContent, 'body');
      return;
    }

    // strong/b dentro de parágrafos já capturados pelo pai — ignora
    if (tag === 'strong' || tag === 'b') {
      pushText(node.textContent, 'body');
      return;
    }

    // Quebra de linha — insere linha vazia
    if (tag === 'br') {
      lines.push({ text: '', type: 'empty' });
      return;
    }

    // hr — linha separadora
    if (tag === 'hr') {
      lines.push({ text: '─────────────────────────────────────────────────', type: 'hr' });
      return;
    }

    // Elementos container genéricos — percorre filhos
    node.childNodes.forEach(walkNode);
  }

  tmp.childNodes.forEach(walkNode);
  return lines;
}

function downloadPDF() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  // Currículo tem PDF próprio
  if (d.type === 'curriculo') { downloadPDFCurriculo(d); return; }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });

  const lm = 20; // margem esquerda
  const rm = 190; // margem direita
  const W  = rm - lm; // largura útil
  const pH = 272; // altura máxima antes de virar página
  let y    = 20;

  // ─ Cabeçalho decorativo ─
  pdf.setFillColor(26, 26, 26);
  pdf.rect(lm - 5, 10, W + 10, 0.5, 'F');

  pdf.setFont('times', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(26, 26, 26);
  pdf.text(getDocTitle(d.type).toUpperCase(), 105, y, { align:'center' });
  y += 6;

  pdf.setFont('times', 'italic');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100);
  pdf.text(
    `Instrumento Particular · Nº ${d.id} · ${new Date(d.createdAt).toLocaleDateString('pt-BR')}`,
    105, y, { align:'center' }
  );
  y += 4;

  pdf.setFillColor(201, 169, 110);
  pdf.rect(lm - 5, y, W + 10, 0.8, 'F');
  y += 10;

  // ─ Extrai linhas estruturadas do HTML ─
  const docLines = extractDocLines(d.html);

  let pageNum = 1;

  function checkPage() {
    if (y > pH) {
      // FIX Bug 2 (footer): adiciona footer na página atual ANTES de virar
      _addPageFooter(pdf, pageNum);
      pdf.addPage();
      pageNum++;
      y = 20;
      // Restaura fonte padrão após nova página
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 30, 30);
    }
  }

  for (const line of docLines) {
    checkPage();

    if (line.type === 'empty') {
      y += 3;
      continue;
    }

    if (line.type === 'hr') {
      pdf.setDrawColor(200, 200, 200);
      pdf.line(lm, y, rm, y);
      y += 4;
      continue;
    }

    if (line.type === 'title') {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(26, 26, 26);
      const wrapped = pdf.splitTextToSize(line.text, W);
      for (const l of wrapped) { checkPage(); pdf.text(l, 105, y, { align:'center' }); y += 6; }
      continue;
    }

    if (line.type === 'subtitle') {
      pdf.setFont('times', 'italic');
      pdf.setFontSize(8.5);
      pdf.setTextColor(100, 100, 100);
      const wrapped = pdf.splitTextToSize(line.text, W);
      for (const l of wrapped) { checkPage(); pdf.text(l, 105, y, { align:'center' }); y += 5; }
      continue;
    }

    if (line.type === 'clausula-title') {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(26, 26, 26);
      const wrapped = pdf.splitTextToSize(line.text, W);
      for (const l of wrapped) { checkPage(); pdf.text(l, lm, y); y += 5.5; }
      continue;
    }

    if (line.type === 'role') {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(26, 26, 26);
      const wrapped = pdf.splitTextToSize(line.text, W);
      for (const l of wrapped) { checkPage(); pdf.text(l, lm, y); y += 5.2; }
      continue;
    }

    if (line.type === 'sig') {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      const wrapped = pdf.splitTextToSize(line.text, W / 2);
      for (const l of wrapped) { checkPage(); pdf.text(l, lm, y); y += 4.5; }
      continue;
    }

    // body (parágrafo normal)
    pdf.setFont('times', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);

    // Destaque para labels de role inline ("CONTRATANTE:", "LOCADOR:" etc.)
    if (/^[A-ZÁÉÍÓÚÀÃÕÂÊÔ\s]+:/.test(line.text)) {
      pdf.setFont('times', 'bold');
    }

    const wrapped = pdf.splitTextToSize(line.text, W);
    for (const l of wrapped) {
      checkPage();
      pdf.text(l, lm, y);
      y += 5.2;
    }
  }

  // ─ Rodapé em TODAS as páginas (incluindo a última) ─
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(200, 200, 200);
    pdf.rect(lm - 5, 283, W + 10, 0.3, 'F');

    if (i === totalPages) {
      pdf.setFont('times', 'italic');
      pdf.setFontSize(6.5);
      pdf.setTextColor(150);
      pdf.text(
        'Modelo de referência gerado pelo DocFácil. Não constitui assessoria jurídica. Consulte um advogado para casos específicos.',
        105, 286, { align:'center', maxWidth: W }
      );
    }

    pdf.setFont('times', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(140);
    pdf.text(`Página ${i} de ${totalPages}`, 105, 291, { align:'center' });
    pdf.setTextColor(0);
  }

  pdf.save(`${d.typeInfo?.name || 'Documento'} — ${d.id}.pdf`);
  showNotif('PDF baixado com sucesso! 📥', '📥');
}

/**
 * Adiciona rodapé de página intermediária (número e linha separadora).
 * Chamado ANTES de pdf.addPage() para garantir que o footer
 * seja aplicado na página atual antes de criar a próxima.
 * @param {jsPDF} pdf
 * @param {number} pageNum  - número da página atual (1-based)
 */
function _addPageFooter(pdf, pageNum) {
  const lm = 20, rm = 190, W = rm - lm;
  pdf.setFillColor(200, 200, 200);
  pdf.rect(lm - 5, 283, W + 10, 0.3, 'F');
  pdf.setFont('times', 'italic');
  pdf.setFontSize(7.5);
  pdf.setTextColor(140);
  // O total de páginas não é conhecido ainda — deixa em branco e o
  // loop final sobrescreve com o total correto
  pdf.text(`Página ${pageNum}`, 105, 291, { align:'center' });
  pdf.setTextColor(0);
}

// Mantido por compatibilidade (era chamado no loop antigo)
function addPdfFooter(pdf, num) {
  // Lógica movida para _addPageFooter e para o loop final de numeração
}
