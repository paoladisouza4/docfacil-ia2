// ════════════════════════════════════════════════════════════════
//  js/ia.js — Assistente de escrita com IA
//  Chat, extras IA e geração de documentos com IA
// ════════════════════════════════════════════════════════════════

const IA_SYSTEM = `Você é o assistente de escrita e preenchimento de documentos do DocFácil, plataforma de modelos de documentos profissionais.
Ajude os usuários a: entender como preencher cada campo dos modelos, explicar o significado de termos nos documentos, sugerir qual modelo usar para cada situação, dar sugestões de redação.
Responda sempre em português brasileiro. Seja claro, prático e objetivo.
IMPORTANTE: Você NÃO presta assessoria ou consultoria jurídica. Se o usuário pedir orientação jurídica específica (ex: posso processar, tenho direito a, o que devo fazer legalmente), responda que não pode dar esse tipo de orientação e recomende consultar um advogado inscrito na OAB.
Você pode explicar o que significam termos e cláusulas nos documentos, mas não pode recomendar ações jurídicas.`;

function iaKeydown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendIA(); } }

async function sendIA() {
  const input = document.getElementById('ia-input');
  const msg   = input.value.trim();
  if (!msg) return;

  addIAMsg(msg, 'user');
  input.value = '';

  const btn = document.getElementById('ia-send-btn');
  btn.disabled = true;
  const typId = addIATyping();
  iaHistory.push({ role:'user', content: msg });

  try {
    const res = await callIA({ system: IA_SYSTEM, messages: iaHistory, max_tokens: 1200 });
    const reply = res.content?.[0]?.text || 'Desculpe, não consegui processar. Tente novamente.';
    iaHistory.push({ role:'assistant', content: reply });
    removeIATyping(typId);
    addIAMsg(reply, 'bot');
  } catch (err) {
    removeIATyping(typId);
    addIAMsg('⚠️ Erro ao conectar com a IA. Tente novamente em instantes.', 'bot');
  }
  btn.disabled = false;
}

// ── Função central de chamada à IA (via Worker) ──
async function callIA({ system = '', messages = [], max_tokens = 1500, model = 'claude-sonnet-4-20250514' }) {
  const res = await fetch(WORKER_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens, system, messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erro ${res.status}`);
  }

  return res.json();
}

function sendIASug(msg) { document.getElementById('ia-input').value = msg; sendIA(); }

function addIAMsg(text, from) {
  const msgs = document.getElementById('ia-messages');
  const div  = document.createElement('div');
  div.className = `ia-msg ia-msg-${from}`;
  const fmt = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  div.innerHTML = `
    <div class="ia-msg-avatar">${from === 'bot' ? '🤖' : '👤'}</div>
    <div class="ia-msg-bubble">${fmt}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addIATyping() {
  const msgs = document.getElementById('ia-messages');
  const id   = 'typ-' + Date.now();
  const div  = document.createElement('div');
  div.className = 'ia-msg ia-msg-bot'; div.id = id;
  div.innerHTML = `<div class="ia-msg-avatar">🤖</div><div class="ia-msg-bubble" style="padding:12px 18px;"><div class="ia-typing"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}
function removeIATyping(id) { document.getElementById(id)?.remove(); }

// ════════════════════════════════════════════════════════════════
//  GERAÇÃO VIA IA (Extras)
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
//  MODAL DE DADOS — Extras IA
// ════════════════════════════════════════════════════════════════

const IA_MODAL_FIELDS = {
  gen_curriculo: {
    titulo: '📋 Currículo via IA',
    sub: 'Preencha seus dados e a IA cria seu currículo completo',
    campos: [
      { id:'ia_nome',        label:'Nome completo *',          placeholder:'Ex: João da Silva Santos',   full:true },
      { id:'ia_profissao',   label:'Profissão / Cargo *',      placeholder:'Ex: Desenvolvedor Full Stack' },
      { id:'ia_experiencia', label:'Anos de experiência *',    placeholder:'Ex: 5 anos' },
      { id:'ia_cidade',      label:'Cidade / Estado',          placeholder:'Ex: São Paulo, SP' },
      { id:'ia_email',       label:'E-mail profissional',      placeholder:'Ex: joao@email.com' },
      { id:'ia_telefone',    label:'Telefone / WhatsApp',      placeholder:'Ex: (11) 99999-9999' },
      { id:'ia_habilidades', label:'Principais habilidades *', placeholder:'Ex: JavaScript, React, Node.js, SQL', full:true },
      { id:'ia_formacao',    label:'Formação acadêmica',       placeholder:'Ex: Ciência da Computação — USP (2018)', full:true },
      { id:'ia_objetivo',    label:'Objetivo profissional',    placeholder:'Ex: Busco oportunidade em empresas de tecnologia...', full:true, textarea:true },
    ]
  },
  gen_carta: {
    titulo: '✉️ Carta Formal via IA',
    sub: 'Preencha os dados e a IA redige sua carta profissional',
    campos: [
      { id:'ia_remetente',   label:'Seu nome (remetente) *',   placeholder:'Ex: João da Silva Santos',   full:true },
      { id:'ia_destinatario',label:'Destinatário *',           placeholder:'Ex: Dr. Carlos Mendes',      full:true },
      { id:'ia_empresa',     label:'Empresa / Instituição',    placeholder:'Ex: Empresa ABC Ltda',       full:true },
      { id:'ia_assunto',     label:'Assunto da carta *',       placeholder:'Ex: Solicitação de reunião comercial', full:true },
      { id:'ia_objetivo',    label:'O que você quer comunicar? *', placeholder:'Explique o objetivo da carta...', full:true, textarea:true },
      { id:'ia_cidade',      label:'Cidade / Data',            placeholder:'Ex: São Paulo, abril de 2026' },
    ]
  },
  gen_proposta: {
    titulo: '📊 Proposta Comercial via IA',
    sub: 'Informe os dados e a IA monta sua proposta completa',
    campos: [
      { id:'ia_empresa',     label:'Sua empresa / nome *',     placeholder:'Ex: Silva Tecnologia ME',    full:true },
      { id:'ia_cliente',     label:'Nome do cliente *',        placeholder:'Ex: Empresa XYZ Ltda',       full:true },
      { id:'ia_servico',     label:'Serviço oferecido *',      placeholder:'Ex: Desenvolvimento de sistema web', full:true },
      { id:'ia_valor',       label:'Valor aproximado',         placeholder:'Ex: R$ 5.000,00' },
      { id:'ia_prazo',       label:'Prazo de entrega',         placeholder:'Ex: 30 dias' },
      { id:'ia_descricao',   label:'Descreva o projeto *',     placeholder:'Detalhe o que será entregue, metodologia, diferenciais...', full:true, textarea:true },
    ]
  },
  gen_email: {
    titulo: '📧 E-mail Profissional via IA',
    sub: 'Informe os dados e a IA redige o e-mail perfeito',
    campos: [
      { id:'ia_remetente',   label:'Seu nome *',               placeholder:'Ex: João Silva',             full:true },
      { id:'ia_destinatario',label:'Para quem é o e-mail? *',  placeholder:'Ex: Gerente de RH, Cliente, Fornecedor', full:true },
      { id:'ia_tipo',        label:'Tipo de e-mail *',
        select: ['Apresentação comercial','Proposta de serviço','Agradecimento pós-reunião','Follow-up de proposta','Solicitação de reunião','Cobrança amigável','Outro'] },
      { id:'ia_objetivo',    label:'O que quer comunicar? *',  placeholder:'Ex: Quero apresentar meu serviço de...', full:true, textarea:true },
    ]
  },
  gen_contrato_ia: {
    titulo: '📜 Contrato Inteligente via IA',
    sub: 'Preencha os dados e a IA gera um contrato completo e personalizado',
    campos: [
      { id:'ia_contratante', label:'Nome do Contratante *',    placeholder:'Ex: João da Silva ou Empresa LTDA', full:true },
      { id:'ia_cpf_a',       label:'CPF/CNPJ do Contratante', placeholder:'Ex: 000.000.000-00' },
      { id:'ia_contratado',  label:'Nome do Contratado *',     placeholder:'Ex: Maria Souza ou Empresa ME',     full:true },
      { id:'ia_cpf_b',       label:'CPF/CNPJ do Contratado',  placeholder:'Ex: 000.000.000-00' },
      { id:'ia_servico',     label:'Objeto do contrato *',     placeholder:'Ex: Desenvolvimento de site institucional', full:true },
      { id:'ia_valor',       label:'Valor total (R$) *',       placeholder:'Ex: 3.000,00' },
      { id:'ia_prazo',       label:'Prazo / Vigência *',       placeholder:'Ex: 60 dias ou 6 meses' },
      { id:'ia_pagamento',   label:'Forma de pagamento',       placeholder:'Ex: 50% entrada e 50% na entrega' },
      { id:'ia_cidade',      label:'Cidade da assinatura',     placeholder:'Ex: São Paulo, SP' },
      { id:'ia_detalhes',    label:'Detalhes adicionais',      placeholder:'Inclua qualquer informação extra relevante...', full:true, textarea:true },
    ]
  },
};

function openIAModal() {
  if (!selectedType || !selectedType.startsWith('gen_')) return;
  const config = IA_MODAL_FIELDS[selectedType];
  if (!config) { generateWithAI({}); return; }

  // Monta o modal
  const campos = config.campos.map(c => {
    if (c.select) {
      return `
        <div class="field ${c.full ? 'form-full' : ''}">
          <label>${c.label}</label>
          <select id="${c.id}">
            ${c.select.map(op => `<option value="${op}">${op}</option>`).join('')}
          </select>
        </div>`;
    }
    if (c.textarea) {
      return `
        <div class="field ${c.full ? 'form-full' : ''}">
          <label>${c.label}</label>
          <textarea id="${c.id}" rows="3" placeholder="${c.placeholder}"></textarea>
        </div>`;
    }
    return `
      <div class="field ${c.full ? 'form-full' : ''}">
        <label>${c.label}</label>
        <input id="${c.id}" placeholder="${c.placeholder}"/>
      </div>`;
  }).join('');

  document.getElementById('ia-modal-title').textContent = config.titulo;
  document.getElementById('ia-modal-sub').textContent   = config.sub;
  document.getElementById('ia-modal-campos').innerHTML  = campos;
  document.getElementById('ia-modal-overlay').style.display = 'flex';
}

function closeIAModal() {
  document.getElementById('ia-modal-overlay').style.display = 'none';
}

function confirmarGeracaoIA() {
  const config = IA_MODAL_FIELDS[selectedType];
  if (!config) return;

  // Coleta todos os dados preenchidos
  const dados = {};
  config.campos.forEach(c => {
    const el = document.getElementById(c.id);
    if (el) dados[c.id] = el.value.trim();
  });

  // Valida campos obrigatórios
  const obrigatorios = config.campos.filter(c => c.label.includes('*'));
  const vazio = obrigatorios.find(c => !dados[c.id]);
  if (vazio) {
    showNotif(`Preencha: ${vazio.label.replace(' *','')}`, '⚠️');
    return;
  }

  closeIAModal();
  generateWithAI(dados);
}

async function generateWithAI(dados = {}) {
  const allT     = getAllTypes();
  const typeInfo = allT.find(t => t.id === selectedType) || { name:'Documento', emoji:'🤖' };

  showIALoading(`Gerando "${typeInfo.name}" com IA...`);

  // Prompts personalizados com os dados do cliente
  const prompts = {
    gen_curriculo: `Crie um currículo profissional COMPLETO e PERSONALIZADO em HTML para:
Nome: ${dados.ia_nome}
Profissão: ${dados.ia_profissao}
Experiência: ${dados.ia_experiencia}
Cidade/Estado: ${dados.ia_cidade || 'não informado'}
E-mail: ${dados.ia_email || 'não informado'}
Telefone: ${dados.ia_telefone || 'não informado'}
Habilidades: ${dados.ia_habilidades}
Formação: ${dados.ia_formacao || 'não informado'}
Objetivo: ${dados.ia_objetivo || 'não informado'}

Use HTML com as seguintes classes para formatação: doc-main-title, doc-subtitle, clausula, clausula-title, clausula-body.
Crie seções: Dados Pessoais, Objetivo Profissional, Experiência Profissional (crie 2-3 experiências coerentes com o perfil), Formação Acadêmica, Habilidades e Competências, Idiomas.
Use APENAS os dados fornecidos acima. NÃO invente informações. Retorne SOMENTE o HTML, sem markdown.`,

    gen_carta: `Redija uma carta formal profissional COMPLETA em HTML para:
Remetente: ${dados.ia_remetente}
Destinatário: ${dados.ia_destinatario}
Empresa/Instituição: ${dados.ia_empresa || ''}
Assunto: ${dados.ia_assunto}
Objetivo: ${dados.ia_objetivo}
Local/Data: ${dados.ia_cidade || 'São Paulo, ' + new Date().toLocaleDateString('pt-BR', {month:'long', year:'numeric'})}

Use HTML profissional com formatação elegante. Inclua: cabeçalho, data, destinatário, corpo formal com 3 parágrafos bem desenvolvidos, despedida e assinatura.
Use APENAS os dados fornecidos. Retorne SOMENTE o HTML, sem markdown.`,

    gen_proposta: `Crie uma proposta comercial COMPLETA e PERSONALIZADA em HTML para:
Empresa/Profissional: ${dados.ia_empresa}
Cliente: ${dados.ia_cliente}
Serviço: ${dados.ia_servico}
Valor: ${dados.ia_valor || 'a definir'}
Prazo: ${dados.ia_prazo || 'a definir'}
Descrição do projeto: ${dados.ia_descricao}

Use HTML profissional com seções: Apresentação, Entendimento do Projeto, Escopo de Trabalho, Metodologia, Cronograma, Investimento e Condições de Pagamento, Próximos Passos.
Use APENAS os dados fornecidos. Retorne SOMENTE o HTML, sem markdown.`,

    gen_email: `Redija um e-mail profissional COMPLETO em HTML para:
Remetente: ${dados.ia_remetente}
Destinatário: ${dados.ia_destinatario}
Tipo: ${dados.ia_tipo}
Objetivo: ${dados.ia_objetivo}

Crie um e-mail bem estruturado com assunto sugerido, saudação, corpo com 2-3 parágrafos objetivos e profissionais, e despedida.
Use APENAS os dados fornecidos. Retorne SOMENTE o HTML, sem markdown.`,

    gen_contrato_ia: `Gere um contrato profissional COMPLETO, PERSONALIZADO e juridicamente válido em HTML para:
Contratante: ${dados.ia_contratante} — CPF/CNPJ: ${dados.ia_cpf_a || 'não informado'}
Contratado: ${dados.ia_contratado} — CPF/CNPJ: ${dados.ia_cpf_b || 'não informado'}
Objeto: ${dados.ia_servico}
Valor: R$ ${dados.ia_valor}
Prazo: ${dados.ia_prazo}
Pagamento: ${dados.ia_pagamento || 'à vista'}
Cidade: ${dados.ia_cidade || 'local da assinatura'}
Detalhes: ${dados.ia_detalhes || 'nenhum'}

Use HTML com classes: doc-main-title, doc-subtitle, parties-block, parties-title, party, party-role, clausula, clausula-title, clausula-body.
Inclua 10+ cláusulas completas com linguagem jurídica real brasileira citando o Código Civil.
Use APENAS os dados fornecidos acima. Retorne SOMENTE o HTML, sem markdown.`,
  };

  const prompt = prompts[selectedType] || `Gere um documento profissional do tipo "${typeInfo.name}" em HTML usando os dados: ${JSON.stringify(dados)}. Retorne SOMENTE o HTML, sem markdown.`;

  try {
    const data = await callIA({
      max_tokens: 3000,
      system: 'Você é especialista em documentos profissionais brasileiros. Gere documentos completos em HTML. NUNCA use markdown, NUNCA use ```html, retorne APENAS o HTML puro do conteúdo.',
      messages: [{ role:'user', content: prompt }],
    });

    let html = data.content?.[0]?.text || `<div class="doc-main-title">${typeInfo.name}</div><p>Erro ao gerar. Tente novamente.</p>`;
    // Remove qualquer markdown que ainda passe
    html = html.replace(/^```html\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim();

    hideIALoading();

    const num = `IA-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}`;
    const docObj = {
      id: num, type: selectedType, typeInfo,
      title: typeInfo.name,
      pa: { nome: dados.ia_nome || dados.ia_remetente || dados.ia_contratante || dados.ia_empresa || currentUser.displayName || 'Usuário' },
      pb: { nome: dados.ia_destinatario || dados.ia_cliente || dados.ia_contratado || '—' },
      val: { total: dados.ia_valor || '' },
      obj: { desc: dados.ia_servico || dados.ia_assunto || dados.ia_objetivo || '' },
      jur: {},
      dadosIA: dados,
      html, status:'rascunho',
      createdAt: new Date().toISOString(),
      generatedByAI: true,
    };

    await saveDocFS(docObj);
    currentDocs.unshift(docObj);
    renderDocsBadge();
    updateDashboard();
    viewDocument(num);
    showNotif(`${typeInfo.name} gerado com sucesso! 🤖`, '🤖');

  } catch (err) {
    hideIALoading();
    console.error(err);
    showNotif('Erro ao gerar com IA. Tente novamente.', '❌');
  }
}

function showIALoading(msg) {
  document.getElementById('ia-loading-text').textContent = msg;
  document.getElementById('ia-loading-overlay').style.display = 'flex';
}
function hideIALoading() { document.getElementById('ia-loading-overlay').style.display = 'none'; }

// ════════════════════════════════════════════════════════════════
//  RENDER — Dashboard / Docs
// ════════════════════════════════════════════════════════════════

