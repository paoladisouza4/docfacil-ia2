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
// ════════════════════════════════════════════════════════════════

function downloadPDF() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });

  const tmp = document.createElement('div');
  tmp.innerHTML = d.html;

  // Remove o masthead (evita título duplicado no PDF)
  tmp.querySelectorAll('.doc-masthead').forEach(el => el.remove());

  // Remove o aviso OAB (será adicionado como rodapé)
  tmp.querySelectorAll('.doc-aviso-oab').forEach(el => el.remove());

  // Extrai texto e limpa
  const rawText = tmp.innerText;
  const text = rawText.split('\n')
    .filter(line => {
      const t = line.trim();
      return t !== 'null'
        && t !== 'nullCPF: null'
        && !t.includes('nullCPF')
        && t !== ''
        || t === ''; // mantém linhas vazias para espaçamento
    })
    .join('\n');

  const W = 170; // largura útil
  let y    = 20;
  const pH = 270; // altura máxima por página

  // ─ Cabeçalho decorativo ─
  pdf.setFillColor(26, 26, 26);
  pdf.rect(15, 10, 180, 0.5, 'F');

  pdf.setFont('times', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(26, 26, 26);
  pdf.text(getDocTitle(d.type).toUpperCase(), 105, y, { align:'center' });
  y += 6;

  pdf.setFont('times', 'italic');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100);
  pdf.text(`Instrumento Particular · Nº ${d.id} · ${new Date(d.createdAt).toLocaleDateString('pt-BR')}`, 105, y, { align:'center' });
  y += 4;
  pdf.setFillColor(201, 169, 110);
  pdf.rect(15, y, 180, 0.8, 'F');
  y += 10;

  pdf.setFont('times', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(26, 26, 26);

  const lines = pdf.splitTextToSize(text, W);

  for (const line of lines) {
    if (y > pH) {
      addPdfFooter(pdf, d.id);
      pdf.addPage();
      y = 20;
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(26, 26, 26);
    }
    const tr = line.trim();
    if (!tr) { y += 3; continue; }

    // Negrito para títulos de cláusulas
    if (/^cláusula\s+[IVX]+/i.test(tr)) {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10.5);
      pdf.setTextColor(26, 26, 26);
    } else if (/^CONTRATANTE:|^CONTRATADO:|^LOCADOR:|^LOCATÁRIO:|^VENDEDOR:|^COMPRADOR:|^PARTE A:|^PARTE B:/i.test(tr)) {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10);
    } else {
      pdf.setFont('times', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 30, 30);
    }

    pdf.text(line, 20, y);
    y += 5.2;
  }

  // Numeração e aviso em todas as páginas
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    // Linha separadora
    pdf.setFillColor(200, 200, 200);
    pdf.rect(15, 283, 180, 0.3, 'F');
    // Aviso OAB (última página)
    if (i === totalPages) {
      pdf.setFont('times', 'italic');
      pdf.setFontSize(6.5);
      pdf.setTextColor(150);
      pdf.text('Modelo de referência gerado pelo DocFácil. Nao constitui assessoria juridica. Consulte um advogado para casos especificos.', 105, 286, { align:'center', maxWidth:170 });
    }
    // Número de página
    pdf.setFont('times', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(140);
    pdf.text(`Pagina ${i} de ${totalPages}`, 105, 291, { align:'center' });
    pdf.setTextColor(0);
  }

  pdf.save(`${d.typeInfo?.name || 'Documento'} — ${d.id}.pdf`);
  showNotif('PDF baixado com sucesso! 📥', '📥');
}

function addPdfFooter(pdf, num) {
  // placeholder — footer agora tratado no loop acima
}

// ════════════════════════════════════════════════════════════════
//  ASSISTENTE IA
// ════════════════════════════════════════════════════════════════

