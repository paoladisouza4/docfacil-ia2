// ═══════════════════════════════════════════════════════════════
//  DocFácil IA — app.js  |  Versão Completa com Edição + Landing
// ═══════════════════════════════════════════════════════════════

'use strict';

// ════════════════════════════════════════════════════════════════
//  ⚙️  CONFIGURAÇÃO DA IA — já configurado, não precisa alterar!
//  A rota /api/ia funciona automaticamente no Vercel e Netlify.
//  A key do OpenRouter fica segura no servidor, nunca exposta.
// ════════════════════════════════════════════════════════════════
const WORKER_URL = '/api/ia';

// ════ ESTADO GLOBAL ════
let currentUser  = null;
let currentStep  = 1;
let selectedType = '';
let currentDocId = null;
let currentDocs  = [];
let currentCategory = 'contratos';
let iaHistory    = [];
const TOTAL_STEPS = 6;

// ════════════════════════════════════════════════════════════════
//  TIPOS DE DOCUMENTOS — 40+ em 8 categorias
// ════════════════════════════════════════════════════════════════
const DOC_TYPES = {
  contratos: [
    { id:'servico',       emoji:'🛠️', name:'Prestação de Serviços',         desc:'Contratação de serviços profissionais' },
    { id:'trabalho_pj',  emoji:'👔', name:'Trabalho PJ / Autônomo',          desc:'Contrato de trabalho pessoa jurídica' },
    { id:'aluguel_res',  emoji:'🏠', name:'Aluguel Residencial',             desc:'Locação de imóvel residencial' },
    { id:'aluguel_com',  emoji:'🏢', name:'Aluguel Comercial',              desc:'Locação de imóvel comercial' },
    { id:'compravenda',  emoji:'🤝', name:'Compra e Venda',                 desc:'Contrato de compra e venda de bens' },
    { id:'parceria',     emoji:'💼', name:'Parceria Comercial',             desc:'Acordo de parceria entre empresas' },
    { id:'freelancer',   emoji:'💻', name:'Contrato de Freelancer',          desc:'Prestação de serviços freelance' },
    { id:'influenciador',emoji:'📱', name:'Contrato de Influenciador',       desc:'Parceria com influenciador digital' },
    { id:'nda',          emoji:'🔒', name:'Confidencialidade (NDA)',          desc:'Acordo de não-divulgação' },
    { id:'comissao',     emoji:'💰', name:'Contrato de Comissão',            desc:'Acordo de comissão e vendas' },
  ],
  imobiliario: [
    { id:'locacao_simples',   emoji:'🏠', name:'Locação Simples',            desc:'Contrato de locação básico' },
    { id:'locacao_fiador',    emoji:'👥', name:'Locação com Fiador',          desc:'Locação com garantia de fiador' },
    { id:'recibo_aluguel',    emoji:'🧾', name:'Recibo de Aluguel',           desc:'Comprovante de pagamento de aluguel' },
    { id:'vistoria',          emoji:'🔍', name:'Vistoria do Imóvel',          desc:'Termo de vistoria de entrada/saída' },
    { id:'notif_desocupacao', emoji:'📨', name:'Notificação de Desocupação',  desc:'Aviso formal de saída do imóvel' },
    { id:'acordo_inadimpl',   emoji:'⚠️', name:'Acordo de Inadimplência',     desc:'Regularização de débito de aluguel' },
  ],
  trabalho: [
    { id:'curriculo',         emoji:'📋', name:'Currículo Profissional',      desc:'Currículo formatado e profissional' },
    { id:'carta_apres',       emoji:'✉️', name:'Carta de Apresentação',       desc:'Carta de apresentação profissional' },
    { id:'carta_demissao',    emoji:'🚪', name:'Carta de Demissão',           desc:'Pedido formal de demissão' },
    { id:'decl_experiencia',  emoji:'📜', name:'Declaração de Experiência',   desc:'Declaração de tempo de serviço' },
    { id:'estagio',           emoji:'🎓', name:'Termo de Estágio',            desc:'Contrato de estágio curricular' },
    { id:'autonomo',          emoji:'🔧', name:'Acordo de Autônomo',           desc:'Prestação de serviços autônomo' },
  ],
  declaracoes: [
    { id:'decl_residencia',   emoji:'🏡', name:'Declaração de Residência',    desc:'Comprovante de residência declarado' },
    { id:'decl_renda',        emoji:'💵', name:'Declaração de Renda',         desc:'Declaração de renda mensal' },
    { id:'decl_informal',     emoji:'🤲', name:'Trabalho Informal',           desc:'Declaração de trabalho informal' },
    { id:'decl_comparec',     emoji:'✅', name:'Declaração de Comparec.',     desc:'Comprovante de comparecimento' },
    { id:'decl_respons',      emoji:'📝', name:'Declaração de Responsab.',    desc:'Declaração de responsabilidade' },
    { id:'decl_uniao',        emoji:'💍', name:'União Estável',               desc:'Declaração de convivência' },
  ],
  financeiro: [
    { id:'recibo',            emoji:'🧾', name:'Recibo de Pagamento',         desc:'Comprovante formal de pagamento' },
    { id:'quitacao',          emoji:'✔️', name:'Termo de Quitação',           desc:'Declaração de quitação total' },
    { id:'confissao_divida',  emoji:'💳', name:'Confissão de Dívida',         desc:'Reconhecimento formal de dívida' },
    { id:'parcelamento',      emoji:'📅', name:'Acordo de Parcelamento',      desc:'Parcelamento de dívida em aberto' },
    { id:'nota_servico',      emoji:'📑', name:'Nota Simples de Serviço',     desc:'Nota avulsa de prestação' },
  ],
  juridico: [
    { id:'lgpd_termo',        emoji:'🛡️', name:'Termo LGPD',                  desc:'Consentimento conforme Lei 13.709/2018' },
    { id:'politica_priv',     emoji:'🔐', name:'Política de Privacidade',      desc:'Política para site ou aplicativo' },
    { id:'termo_uso',         emoji:'📋', name:'Termo de Uso',                 desc:'Termos de uso de plataforma' },
    { id:'notif_extra',       emoji:'⚖️', name:'Notificação Extrajudicial',   desc:'Notificação formal entre partes' },
    { id:'acordo_amigavel',   emoji:'🤝', name:'Acordo Amigável',             desc:'Resolução amigável de conflito' },
  ],
  empresarial: [
    { id:'abertura_empresa',  emoji:'🏢', name:'Abertura de Empresa',         desc:'Documentação básica de abertura' },
    { id:'contrato_social',   emoji:'📜', name:'Contrato Social',             desc:'Contrato social básico de empresa' },
    { id:'acordo_socios',     emoji:'🤝', name:'Acordo entre Sócios',         desc:'Acordo de quotas e responsabilidades' },
    { id:'termo_invest',      emoji:'💰', name:'Termo de Investimento',       desc:'Acordo de aporte e investimento' },
    { id:'plano_parceria',    emoji:'📊', name:'Plano de Parceria',           desc:'Plano detalhado de parceria' },
  ],
  extras: [
    { id:'gen_curriculo',     emoji:'🤖', name:'Currículo via IA',            desc:'Currículo gerado automaticamente com IA' },
    { id:'gen_carta',         emoji:'🤖', name:'Carta Formal via IA',         desc:'Carta profissional gerada com IA' },
    { id:'gen_proposta',      emoji:'🤖', name:'Proposta Comercial IA',       desc:'Proposta completa gerada com IA' },
    { id:'gen_email',         emoji:'🤖', name:'E-mail Profissional IA',      desc:'E-mail formal gerado com IA' },
    { id:'gen_contrato_ia',   emoji:'🤖', name:'Contrato Inteligente IA',     desc:'Contrato 100% gerado pela IA' },
  ]
};

const CLAUSES = [
  { id:'lgpd',          name:'LGPD — Proteção de Dados',      desc:'Conformidade com Lei 13.709/2018' },
  { id:'exclusividade', name:'Exclusividade',                 desc:'Vedação de serviços a concorrentes' },
  { id:'propriedade',   name:'Propriedade Intelectual',       desc:'Titularidade de obras e criações' },
  { id:'sigilo',        name:'Sigilo e Confidencialidade',    desc:'Obrigação de sigilo das informações' },
  { id:'subcontratacao',name:'Vedação de Subcontratação',     desc:'Proibição de subcontratar sem anuência' },
  { id:'reembolso',     name:'Reembolso de Despesas',         desc:'Cobertura de despesas operacionais' },
  { id:'garantia',      name:'Garantia de Execução',          desc:'Garantia de qualidade e prazo' },
  { id:'forca_maior',   name:'Força Maior',                   desc:'Isenção por eventos imprevisíveis' },
  { id:'antisuborno',   name:'Anticorrupção',                 desc:'Conformidade com Lei 12.846/2013' },
  { id:'resolucao',     name:'Resolução Antecipada',          desc:'Encerramento antecipado por mútuo acordo' },
  { id:'penalidade',    name:'Penalidade por Descumprimento', desc:'Sanções em caso de inadimplemento' },
  { id:'testemunha',    name:'Testemunhas Instrumentárias',   desc:'Inclusão formal de testemunhas' },
];

// ════════════════════════════════════════════════════════════════
//  LANDING PAGE
// ════════════════════════════════════════════════════════════════

function showAuth(tab = 'login') {
  document.getElementById('auth-overlay').style.display = 'flex';
  authTab(tab);
}
function hideAuth() {
  document.getElementById('auth-overlay').style.display = 'none';
}

// ── Menu mobile — abre/fecha + overlay para fechar ao clicar fora ──
function toggleLandNav() {
  const nav     = document.getElementById('land-mobile-nav');
  const overlay = document.getElementById('land-nav-overlay');
  const btn     = document.getElementById('land-hamburger');
  const isOpen  = nav.style.display !== 'none' && nav.style.display !== '';
  if (isOpen) {
    nav.style.display     = 'none';
    overlay.style.display = 'none';
    if (btn) btn.textContent = '☰';
  } else {
    nav.style.display     = 'flex';
    overlay.style.display = 'block';
    if (btn) btn.textContent = '✕';
  }
}
function closeLandNav() {
  const nav     = document.getElementById('land-mobile-nav');
  const overlay = document.getElementById('land-nav-overlay');
  const btn     = document.getElementById('land-hamburger');
  if (nav)     nav.style.display     = 'none';
  if (overlay) overlay.style.display = 'none';
  if (btn)     btn.textContent       = '☰';
}

// ── Modais institucionais ──
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}
function closeModalById(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = 'none'; document.body.style.overflow = ''; }
}
function closeModal(e, overlay) {
  if (e.target === overlay) closeModalById(overlay.id);
}

// ── FAQ accordion ──
function toggleFaq(el) {
  const a = el.querySelector('.inst-faq-a');
  const s = el.querySelector('.inst-faq-q span');
  const open = a.style.display === 'block';
  // Fecha todos
  document.querySelectorAll('.inst-faq-a').forEach(x => x.style.display = 'none');
  document.querySelectorAll('.inst-faq-q span').forEach(x => x.textContent = '+');
  // Abre este se estava fechado
  if (!open) { a.style.display = 'block'; if (s) s.textContent = '−'; }
}

// ── Toggle testemunhas ──
let testemunhasAtivas = false;
function toggleTestemunhas() {
  testemunhasAtivas = !testemunhasAtivas;
  const fields = document.getElementById('test-fields');
  const label  = document.getElementById('test-toggle-label');
  const toggle = document.getElementById('test-toggle');
  if (testemunhasAtivas) {
    fields.style.display  = 'block';
    label.textContent     = 'Incluir no documento';
    toggle.classList.add('active');
  } else {
    fields.style.display  = 'none';
    label.textContent     = 'Não incluir';
    toggle.classList.remove('active');
    // Limpa os campos
    ['test1_nome','test1_doc','test2_nome','test2_doc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
}

// ════════════════════════════════════════════════════════════════
//  FIREBASE AUTH
// ════════════════════════════════════════════════════════════════

function waitForFirebase(cb, tries = 0) {
  if (window._firebase) { cb(window._firebase); return; }
  if (tries > 40) { console.error('Firebase não inicializou'); return; }
  setTimeout(() => waitForFirebase(cb, tries + 1), 150);
}

// Auth state listener
waitForFirebase(({ auth, onAuthStateChanged }) => {
  onAuthStateChanged(auth, user => {
    document.getElementById('loading-screen').style.display = 'none';
    if (user) {
      currentUser = user;
      document.getElementById('landing-screen').style.display = 'none';
      document.getElementById('auth-overlay').style.display = 'none';
      startApp();
    } else {
      document.getElementById('landing-screen').style.display = 'block';
      document.getElementById('app').style.display = 'none';
    }
  });
  document.getElementById('loading-screen').style.display = 'flex';
  document.getElementById('landing-screen').style.display = 'none';
});

function authTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('auth-login').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? '' : 'none';
}

function doLogin() {
  const email  = document.getElementById('login-email').value.trim();
  const pass   = document.getElementById('login-pass').value;
  const errEl  = document.getElementById('auth-error');
  const btn    = document.getElementById('login-btn');

  if (!email || !pass) { showAuthErr(errEl, 'Preencha e-mail e senha.'); return; }
  errEl.style.display = 'none';
  btn.textContent = 'Entrando...'; btn.disabled = true;

  waitForFirebase(({ auth, signInWithEmailAndPassword }) => {
    signInWithEmailAndPassword(auth, email, pass)
      .catch(err => {
        btn.textContent = 'Entrar na conta'; btn.disabled = false;
        showAuthErr(errEl, fbMsg(err.code));
      });
  });
}

function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const errEl = document.getElementById('reg-error');
  const btn   = document.getElementById('reg-btn');

  if (!name || !email || !pass) { showAuthErr(errEl, 'Preencha todos os campos.'); return; }
  if (pass.length < 6) { showAuthErr(errEl, 'Senha mínimo 6 caracteres.'); return; }
  errEl.style.display = 'none';
  btn.textContent = 'Criando conta...'; btn.disabled = true;

  waitForFirebase(({ auth, createUserWithEmailAndPassword, updateProfile }) => {
    createUserWithEmailAndPassword(auth, email, pass)
      .then(cred => updateProfile(cred.user, { displayName: name }))
      .catch(err => {
        btn.textContent = 'Criar conta grátis'; btn.disabled = false;
        showAuthErr(errEl, fbMsg(err.code));
      });
  });
}

function doLogout() {
  waitForFirebase(({ auth, signOut }) => {
    signOut(auth).then(() => {
      currentUser = null; currentDocs = []; iaHistory = [];
      document.getElementById('app').style.display = 'none';
      document.getElementById('landing-screen').style.display = 'block';
    });
  });
}

function showAuthErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }

function fbMsg(code) {
  const m = {
    'auth/user-not-found':       'Usuário não encontrado.',
    'auth/wrong-password':       'Senha incorreta.',
    'auth/invalid-credential':   'E-mail ou senha inválidos.',
    'auth/email-already-in-use': 'E-mail já cadastrado.',
    'auth/invalid-email':        'E-mail inválido.',
    'auth/weak-password':        'Senha muito fraca (mín. 6 caracteres).',
    'auth/too-many-requests':    'Muitas tentativas. Aguarde.',
    'auth/network-request-failed':'Erro de conexão.',
  };
  return m[code] || 'Erro ao autenticar. Tente novamente.';
}

// ════════════════════════════════════════════════════════════════
//  FIRESTORE — salvar / buscar / atualizar / deletar documentos
// ════════════════════════════════════════════════════════════════

async function saveDocFS(docObj) {
  return new Promise(resolve => {
    waitForFirebase(async ({ db, collection, addDoc }) => {
      try {
        const ref = await addDoc(collection(db, 'documents'), {
          ...docObj,
          userId: currentUser.uid,
        });
        docObj.fsId = ref.id;
      } catch (e) {
        saveDocLocal(docObj);
      }
      resolve(docObj);
    });
  });
}

async function updateDocFS(docObj) {
  return new Promise(resolve => {
    waitForFirebase(async ({ db, doc, updateDoc }) => {
      try {
        if (docObj.fsId) {
          const { html: _h, ...dataWithoutHtml } = docObj; // salva tudo menos html gigante separado
          await updateDoc(doc(db, 'documents', docObj.fsId), { ...docObj });
        }
      } catch (e) { /* fallback ok */ }
      resolve();
    });
  });
}

async function loadDocsFS() {
  return new Promise(resolve => {
    waitForFirebase(async ({ db, collection, getDocs, query, where }) => {
      try {
        const q   = query(collection(db, 'documents'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ fsId: d.id, ...d.data() }));
        docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        currentDocs = docs;
      } catch (e) {
        currentDocs = getDocsLocal();
      }
      resolve(currentDocs);
    });
  });
}

async function deleteDocFS(fsId, localId) {
  return new Promise(resolve => {
    waitForFirebase(async ({ db, doc, deleteDoc }) => {
      try { if (fsId) await deleteDoc(doc(db, 'documents', fsId)); } catch (e) {}
      currentDocs = currentDocs.filter(d => d.id !== localId);
      resolve();
    });
  });
}

// Local fallback
function saveDocLocal(obj) {
  const docs = getDocsLocal();
  docs.unshift(obj);
  try { localStorage.setItem(`df_${currentUser.uid}`, JSON.stringify(docs)); } catch(e){}
}
function getDocsLocal() {
  try { return JSON.parse(localStorage.getItem(`df_${currentUser.uid}`) || '[]'); } catch { return []; }
}

// ════════════════════════════════════════════════════════════════
//  APP START / NAVEGAÇÃO
// ════════════════════════════════════════════════════════════════

function startApp() {
  document.getElementById('app').style.display = 'block';

  const name = currentUser.displayName || currentUser.email.split('@')[0];
  document.getElementById('sidebar-name').textContent   = name;
  document.getElementById('sidebar-avatar').textContent = name[0].toUpperCase();
  document.getElementById('set-name').value  = name;
  document.getElementById('set-email').value = currentUser.email;

  const h = new Date().getHours();
  const g = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  document.getElementById('dash-greeting').textContent = `${g}, ${name.split(' ')[0]} 👋`;

  buildTypeCards('contratos');
  buildClauseCards();

  const today = new Date().toISOString().split('T')[0];
  const el = document.getElementById('obj_inicio');
  if (el && !el.value) el.value = today;

  loadDocsFS().then(() => { updateDashboard(); renderDocsBadge(); });
}

const PAGE_TITLES = {
  dashboard:'Dashboard', create:'Criar Documento',
  mydocs:'Meus Documentos', ai:'Assistente IA',
  settings:'Configurações', document:'Visualizar Documento',
  edit:'Editar Documento'
};

function gotoPage(page) {
  document.querySelectorAll('.page').forEach(p  => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el  = document.getElementById('page-' + page);
  if (el)  el.classList.add('active');
  const nav = document.getElementById('nav-' + page);
  if (nav) nav.classList.add('active');

  document.getElementById('header-title').textContent = PAGE_TITLES[page] || '';
  closeSidebar();

  // Fecha modais ao trocar de página
  ['ia-modal-overlay','ia-loading-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.body.style.overflow = '';

  if (page === 'mydocs')    renderDocs();
  if (page === 'dashboard') updateDashboard();
  if (page === 'create')    resetWizard();
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebar-overlay');
  const open = s.classList.toggle('mobile-open');
  o.style.display = open ? 'block' : 'none';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').style.display = 'none';
}

// ════════════════════════════════════════════════════════════════
//  WIZARD — Criar Documento
// ════════════════════════════════════════════════════════════════

function filterCategory(btn, cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildTypeCards(cat);
}

function buildTypeCards(cat) {
  const types = DOC_TYPES[cat] || [];
  const g = document.getElementById('types-grid');
  if (!types.length) { g.innerHTML = '<p style="color:var(--text3);padding:20px;">Nenhum tipo nesta categoria.</p>'; return; }
  g.innerHTML = types.map(t => `
    <div class="type-card" id="tc-${t.id}" onclick="selectType('${t.id}')">
      <div class="type-card-check">✓</div>
      <div class="type-emoji">${t.emoji}</div>
      <div class="type-name">${t.name}</div>
      <div class="type-desc">${t.desc}</div>
    </div>`).join('');
}

function selectType(id) {
  selectedType = id;
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('tc-' + id)?.classList.add('selected');
  document.getElementById('role-a-label').textContent = getRoleA(id);
  document.getElementById('role-b-label').textContent = getRoleB(id);
  adaptWizard(id);
}

// ─── Adapta o wizard ao tipo selecionado ───────────────────────
const WIZARD_REGRAS = {
  curriculo:        { uma_parte:true,  sem_valor:true,  sem_obrig:false, sem_clausulas:true,  sem_juridico:true  },
  carta_apres:      { uma_parte:false, sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  carta_demissao:   { uma_parte:false, sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:false },
  decl_residencia:  { uma_parte:true,  sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  decl_renda:       { uma_parte:true,  sem_valor:false, sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  decl_informal:    { uma_parte:true,  sem_valor:false, sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  decl_comparec:    { uma_parte:false, sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  decl_respons:     { uma_parte:true,  sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  decl_uniao:       { uma_parte:false, sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  recibo:           { uma_parte:false, sem_valor:false, sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  recibo_aluguel:   { uma_parte:false, sem_valor:false, sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  nota_servico:     { uma_parte:false, sem_valor:false, sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  quitacao:         { uma_parte:false, sem_valor:false, sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  vistoria:         { uma_parte:false, sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:true  },
  notif_desocupacao:{ uma_parte:false, sem_valor:true,  sem_obrig:true,  sem_clausulas:false, sem_juridico:false },
  politica_priv:    { uma_parte:true,  sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:false },
  termo_uso:        { uma_parte:true,  sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:false },
  abertura_empresa: { uma_parte:false, sem_valor:false, sem_obrig:true,  sem_clausulas:true,  sem_juridico:false },
  decl_experiencia: { uma_parte:false, sem_valor:true,  sem_obrig:true,  sem_clausulas:true,  sem_juridico:false },
};
const REGRA_DEFAULT = { uma_parte:false, sem_valor:false, sem_obrig:false, sem_clausulas:false, sem_juridico:false };

function adaptWizard(typeId) {
  const r   = WIZARD_REGRAS[typeId] || REGRA_DEFAULT;
  const el  = id => document.getElementById(id);
  const show = id => { const e = el(id); if (e) e.style.display = ''; };
  const hide = id => { const e = el(id); if (e) e.style.display = 'none'; };

  if (r.uma_parte) { hide('secao-parte-b'); hide('secao-testemunhas'); }
  else             { show('secao-parte-b'); show('secao-testemunhas'); }

  if (r.sem_obrig) { hide('campo-obrig-a'); hide('campo-obrig-b'); }
  else             { show('campo-obrig-a'); show('campo-obrig-b'); }

  const steps = [1, 2, 3];
  if (!r.sem_valor)     steps.push(4);
  if (!r.sem_clausulas) steps.push(5);
  if (!r.sem_juridico)  steps.push(6);
  window._stepsAtivos = steps;
  window._temParteB   = !r.uma_parte;

  for (let i = 1; i <= 6; i++) {
    const ws = el('ws-' + i), wc = el('wc-' + i);
    if (ws) ws.style.display = steps.includes(i) ? '' : 'none';
    if (wc) wc.style.display = (steps.includes(i) && steps.includes(i+1)) ? '' : 'none';
  }

  _updateWizardLabels(typeId);
}

const _WIZARD_LABELS = {
  curriculo:       { s2:'Seus dados pessoais',     s2sub:'Informações que aparecerão no currículo',
                     s3:'Experiência e formação',  s3sub:'Descreva sua trajetória profissional',
                     desc:'Descreva sua experiência profissional (empresas, cargos, períodos)...',
                     obrigA:'Objetivo profissional' },
  aluguel_res:     { s2:'Locador e Locatário',     s2sub:'Dados do proprietário e do inquilino',
                     s3:'Imóvel e prazo',           s3sub:'Endereço completo do imóvel e período de locação',
                     desc:'Endereço completo do imóvel: Rua, nº, Bairro, Cidade - UF' },
  aluguel_com:     { s2:'Locador e Locatário',     s2sub:'Dados do proprietário e do locatário comercial',
                     s3:'Imóvel comercial e prazo', s3sub:'Endereço do imóvel e período de locação',
                     desc:'Endereço completo do imóvel comercial: Rua, nº, Bairro, Cidade - UF' },
  locacao_simples: { s2:'Locador e Locatário',     s2sub:'Dados do proprietário e do locatário',
                     s3:'Imóvel e prazo',           s3sub:'Endereço do imóvel e período de locação',
                     desc:'Endereço completo do imóvel: Rua, nº, Bairro, Cidade - UF' },
  locacao_fiador:  { s2:'Locador, Locatário e Fiador', s2sub:'Dados do proprietário, inquilino e fiador',
                     s3:'Imóvel e prazo',           s3sub:'Endereço do imóvel e período de locação',
                     desc:'Endereço completo do imóvel: Rua, nº, Bairro, Cidade - UF' },
  compravenda:     { s2:'Vendedor e Comprador',    s2sub:'Dados de quem vende e de quem compra',
                     s3:'O que está sendo vendido?', s3sub:'Descreva o bem detalhadamente',
                     desc:'Descreva o bem: Ex: Veículo Ford Ka 2020, placa ABC-1234, cor branca, RENAVAM 00000' },
  nda:             { s2:'Parte Divulgante e Receptora', s2sub:'Quem compartilha e quem recebe as informações',
                     s3:'Informações confidenciais', s3sub:'O que será protegido por este acordo',
                     desc:'Descreva as informações: Ex: Dados do projeto XYZ, código-fonte, estratégias comerciais' },
  recibo:          { s2:'Recebedor e Pagante',     s2sub:'Dados de quem recebe e de quem pagou',
                     s3:'Referência do pagamento',  s3sub:'Pelo que está sendo feito este recibo',
                     desc:'Referente a: Ex: Prestação de serviços de pintura realizada em abril de 2026' },
  recibo_aluguel:  { s2:'Locador e Locatário',     s2sub:'Dados de quem recebe o aluguel',
                     s3:'Referência do aluguel',    s3sub:'Mês de referência e imóvel',
                     desc:'Ex: Aluguel de abril de 2026 — imóvel na Rua das Flores, 123' },
  estagio:         { s2:'Empresa e Estagiário',    s2sub:'Dados da empresa concedente e do estagiário',
                     s3:'Atividades do estágio',    s3sub:'Descreva as atividades e a carga horária',
                     desc:'Ex: Estágio no setor de Marketing Digital — criação de conteúdo e análise de métricas' },
  parceria:        { s2:'Parceiro A e Parceiro B', s2sub:'Dados de ambos os parceiros',
                     s3:'Objeto da parceria',       s3sub:'Descreva o negócio e as responsabilidades',
                     desc:'Ex: Parceria para operação de loja de cosméticos em Foz do Iguaçu/PR' },
  confissao_divida:{ s2:'Credor e Devedor',        s2sub:'Dados de quem é credor e de quem confessa a dívida',
                     s3:'Qual é a dívida?',         s3sub:'Descreva a origem e o valor do débito',
                     desc:'Ex: Valor referente a empréstimo pessoal concedido em outubro de 2025' },
  parcelamento:    { s2:'Credor e Devedor',        s2sub:'Dados de quem é credor e de quem vai parcelar',
                     s3:'Dívida a parcelar',        s3sub:'Descreva a origem e o total a parcelar',
                     desc:'Ex: Aluguéis em atraso dos meses de fevereiro, março e abril de 2026' },
  influenciador:   { s2:'Marca e Influenciador',   s2sub:'Dados da marca contratante e do influenciador',
                     s3:'Conteúdo a criar',         s3sub:'Descreva tipo de conteúdo e plataformas',
                     desc:'Ex: 4 posts e 2 Reels por mês no Instagram divulgando o produto X' },
  decl_uniao:      { s2:'Companheiro(a) 1 e 2',   s2sub:'Dados de ambos os conviventes',
                     s3:'Dados da união',           s3sub:'Informações sobre o início da convivência',
                     desc:'Endereço comum do casal: Ex: Rua das Flores, 123, Cidade - UF' },
  contrato_social: { s2:'Sócios da empresa',       s2sub:'Dados dos sócios fundadores',
                     s3:'Dados da empresa',         s3sub:'Nome, objeto social e sede',
                     desc:'Ex: XYZ Serviços Ltda — consultoria em tecnologia da informação' },
  acordo_socios:   { s2:'Sócio A e Sócio B',       s2sub:'Dados dos sócios que firmam o acordo',
                     s3:'Objeto do acordo',         s3sub:'O que está sendo regulamentado entre os sócios',
                     desc:'Ex: Regulamentação das relações societárias da empresa XYZ Ltda' },
  termo_invest:    { s2:'Investidor e Empresa',    s2sub:'Dados de quem aporta e da empresa',
                     s3:'Projeto a financiar',      s3sub:'Descreva o negócio que receberá o investimento',
                     desc:'Ex: Plataforma de e-commerce para o segmento de moda' },
};

function _updateWizardLabels(typeId) {
  const lbl = _WIZARD_LABELS[typeId];
  const qt  = s => document.querySelector(s);
  const s2t = qt('#step-2 .wizard-title'), s2s = qt('#step-2 .wizard-subtitle');
  const s3t = qt('#step-3 .wizard-title'), s3s = qt('#step-3 .wizard-subtitle');
  if (s2t) s2t.textContent = lbl?.s2    || 'Dados das Partes';
  if (s2s) s2s.textContent = lbl?.s2sub || 'Informe os dados de ambas as partes';
  if (s3t) s3t.textContent = lbl?.s3    || 'Objeto e Prazo';
  if (s3s) s3s.textContent = lbl?.s3sub || 'Descreva detalhadamente o objeto';
  const descEl = document.getElementById('obj_desc');
  if (descEl && lbl?.desc) descEl.placeholder = lbl.desc;
  const obrigALbl = qt('#campo-obrig-a label');
  if (obrigALbl) obrigALbl.textContent = lbl?.obrigA || 'Obrigações da Parte A';
}


function buildClauseCards() {
  const g = document.getElementById('clauses-group');
  g.innerHTML = CLAUSES.map(c => `
    <div class="checkbox-item" id="ci-${c.id}" onclick="toggleClause(this,'${c.id}')">
      <input type="checkbox" id="cb-${c.id}"/>
      <div class="check-box" id="chk-${c.id}"></div>
      <div><div class="check-text">${c.name}</div><div class="check-desc">${c.desc}</div></div>
    </div>`).join('');
}

function toggleClause(el, id) {
  el.classList.toggle('checked');
  const box = document.getElementById('chk-' + id);
  const cb  = document.getElementById('cb-'  + id);
  if (el.classList.contains('checked')) { box.textContent = '✓'; cb.checked = true; }
  else { box.textContent = ''; cb.checked = false; }
}

function resetWizard() {
  currentStep = 1;
  selectedType = '';
  window._stepsAtivos = [1,2,3,4,5,6];
  window._temParteB   = true;

  // Restaura tudo que pode ter sido ocultado
  ['secao-parte-b','secao-testemunhas','campo-obrig-a','campo-obrig-b'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = '';
  });

  // Restaura barra de progresso
  for (let i = 1; i <= 6; i++) {
    const ws = document.getElementById('ws-' + i);
    const wc = document.getElementById('wc-' + i);
    if (ws) ws.style.display = '';
    if (wc) wc.style.display = i < 6 ? '' : 'none';
  }

  // Restaura títulos e placeholders padrão
  const qt = s => document.querySelector(s);
  const s2t = qt('#step-2 .wizard-title'), s2s = qt('#step-2 .wizard-subtitle');
  const s3t = qt('#step-3 .wizard-title'), s3s = qt('#step-3 .wizard-subtitle');
  if (s2t) s2t.textContent = 'Dados das Partes';
  if (s2s) s2s.textContent = 'Informe os dados de ambas as partes';
  if (s3t) s3t.textContent = 'Objeto e Prazo';
  if (s3s) s3s.textContent = 'Descreva detalhadamente o que está sendo contratado';
  const descEl = document.getElementById('obj_desc');
  if (descEl) descEl.placeholder = 'Descreva com detalhes o serviço, produto ou imóvel...';

  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.checkbox-item').forEach(c => c.classList.remove('checked'));
  document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(c => c.checked = false);
  document.querySelectorAll('.checkbox-item .check-box').forEach(c => c.textContent = '');

  testemunhasAtivas = false;
  const tf = document.getElementById('test-fields');
  const tl = document.getElementById('test-toggle-label');
  const tt = document.getElementById('test-toggle');
  if (tf) tf.style.display = 'none';
  if (tl) tl.textContent  = 'Não incluir';
  if (tt) tt.classList.remove('active');
  ['test1_nome','test1_doc','test2_nome','test2_doc'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });

  updateWizardUI();
}

function wizardNext() {
  if (currentStep === 1 && !selectedType) { showNotif('Selecione um tipo de documento', '⚠️'); return; }
  if (currentStep === 2) { if (!V('p_a_nome')) { showNotif('Preencha o seu nome', '⚠️'); return; } if (window._temParteB !== false && !V('p_b_nome')) { showNotif('Preencha o nome da outra parte', '⚠️'); return; } }
  if (currentStep === 3 && !V('obj_desc')) { showNotif('Descreva o objeto do contrato', '⚠️'); return; }

  if (currentStep === 1 && selectedType.startsWith('gen_')) { openIAModal(); return; }
  // Usa steps ativos se disponível
  const ativos = window._stepsAtivos || [1,2,3,4,5,6];
  const idx = ativos.indexOf(currentStep);
  if (idx === ativos.length - 1) { generateDocument(); return; }
  currentStep = ativos[idx + 1];
  updateWizardUI();
}
function wizardBack() {
  const ativos = window._stepsAtivos || [1,2,3,4,5,6];
  const idx = ativos.indexOf(currentStep);
  if (idx > 0) { currentStep = ativos[idx - 1]; updateWizardUI(); }
}

function updateWizardUI() {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.style.display = i === currentStep ? '' : 'none';
  }
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const ws = document.getElementById('ws-' + i);
    if (!ws) continue;
    ws.classList.remove('active', 'done');
    if (i === currentStep) ws.classList.add('active');
    if (i < currentStep)  ws.classList.add('done');
    const wc = document.getElementById('wc-' + i);
    if (wc) wc.classList.toggle('done', i < currentStep);
  }
  document.getElementById('btn-back').style.visibility = currentStep > 1 ? 'visible' : 'hidden';
  const ativos = window._stepsAtivos || [1,2,3,4,5,6];
  const pos  = ativos.indexOf(currentStep) + 1;
  const isLast = pos === ativos.length;
  document.getElementById('step-indicator').textContent = `Etapa ${pos} de ${ativos.length}`;
  const btn = document.getElementById('btn-next');
  btn.innerHTML = isLast ? '✨ Gerar Documento' : 'Próximo →';
  btn.style.background = isLast ? 'var(--green)' : 'var(--accent)';
}

function quickCreate(typeId) {
  gotoPage('create');
  setTimeout(() => {
    for (const [cat, types] of Object.entries(DOC_TYPES)) {
      if (types.find(t => t.id === typeId)) {
        const cats = Object.keys(DOC_TYPES);
        const btns = document.querySelectorAll('.cat-tab');
        const idx  = cats.indexOf(cat);
        if (btns[idx]) filterCategory(btns[idx], cat);
        break;
      }
    }
    setTimeout(() => {
      selectType(typeId);
      document.getElementById('tc-' + typeId)?.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 100);
  }, 200);
}

// ════════════════════════════════════════════════════════════════
//  GERAÇÃO DE DOCUMENTOS — Templates completos
// ════════════════════════════════════════════════════════════════

function V(id) { return (document.getElementById(id)?.value || '').trim(); }

function getAllTypes() { return Object.values(DOC_TYPES).flat(); }

function generateDocument() {
  const allT    = getAllTypes();
  const typeInfo = allT.find(t => t.id === selectedType) || { name:'Documento', emoji:'📄' };
  const now     = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const num     = `CTR-${now.getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

  const pa = buildParty('p_a');
  const pb = (window._temParteB !== false) ? buildParty('p_b') : { nome:'', doc:'', nac:'', est:'', prof:'', end:'', tel:'', email:'', rg:'' };
  const t1 = testemunhasAtivas
    ? { nome: V('test1_nome') || '___________________________', doc: V('test1_doc') || '___________________' }
    : { nome: null, doc: null };
  const t2 = testemunhasAtivas
    ? { nome: V('test2_nome') || '___________________________', doc: V('test2_doc') || '___________________' }
    : { nome: null, doc: null };

  // Obrigações padrão específicas por tipo de documento
  const defaultObrigA = {
    aluguel_res: 'entregar o imóvel em perfeitas condições de habitabilidade, manter o uso pacífico e cumprir as obrigações previstas na Lei do Inquilinato',
    aluguel_com: 'entregar o imóvel em perfeitas condições de uso, manter a posse pacífica e cumprir as obrigações previstas na Lei do Inquilinato',
    locacao_simples: 'entregar o imóvel em perfeitas condições, garantir a posse tranquila e cumprir a Lei do Inquilinato',
    locacao_fiador: 'entregar o imóvel em perfeitas condições, garantir a posse tranquila e cumprir a Lei do Inquilinato',
    compravenda: 'entregar o bem livre e desembaraçado de ônus, transferir a propriedade e responder pela evicção e vícios ocultos',
    parceria: 'aportar os recursos, conhecimento e infraestrutura acordados, participar das decisões estratégicas e cumprir as metas estabelecidas',
    plano_parceria: 'aportar os recursos, conhecimento e infraestrutura acordados, participar das decisões estratégicas e cumprir as metas estabelecidas',
    comissao: 'fornecer informações, materiais e suporte necessários às vendas, pagar as comissões nos prazos acordados e manter o COMISSIONADO informado',
    nda: 'fornecer as informações confidenciais necessárias para os fins acordados e zelar pela integridade das informações compartilhadas',
    estagio: 'oferecer atividades compatíveis com a área de formação, designar supervisor responsável e garantir condições adequadas de trabalho',
    contrato_social: 'integralizar as quotas no valor e prazo acordados e participar ativamente da gestão da sociedade',
    acordo_socios: 'integralizar as quotas no valor acordado e participar das decisões conforme este instrumento',
    termo_invest: 'aportar os recursos no valor e prazo acordados e acompanhar a execução do plano de negócios',
  };
  const defaultObrigB = {
    aluguel_res: 'pagar o aluguel e encargos pontualmente, usar o imóvel exclusivamente para fins residenciais, conservá-lo e devolvê-lo nas mesmas condições',
    aluguel_com: 'pagar o aluguel e encargos pontualmente, usar o imóvel exclusivamente para fins comerciais, conservá-lo e devolvê-lo nas mesmas condições',
    locacao_simples: 'pagar o aluguel pontualmente, conservar o imóvel e devolvê-lo nas mesmas condições ao final da locação',
    locacao_fiador: 'pagar o aluguel pontualmente, conservar o imóvel e devolvê-lo nas mesmas condições ao final da locação',
    compravenda: 'efetuar o pagamento no prazo e forma acordados e receber o bem nas condições descritas neste instrumento',
    parceria: 'executar as atividades operacionais acordadas, contribuir com conhecimento e relacionamento e cumprir as metas estabelecidas',
    plano_parceria: 'executar as atividades operacionais acordadas, contribuir com conhecimento e relacionamento e cumprir as metas estabelecidas',
    comissao: 'promover ativamente as vendas, manter relacionamento ético com clientes, prestar contas regularmente e não representar concorrentes',
    nda: 'manter absoluto sigilo sobre as informações recebidas, utilizá-las apenas para os fins acordados e protegê-las com o mesmo cuidado que protege suas próprias informações',
    estagio: 'cumprir a carga horária, zelar pelo sigilo das informações da empresa e cumprir as normas internas',
    contrato_social: 'integralizar as quotas no valor e prazo acordados e participar das atividades da sociedade conforme o objeto social',
    acordo_socios: 'integralizar as quotas no valor acordado e cumprir as obrigações deste instrumento',
    termo_invest: 'utilizar os recursos exclusivamente para as finalidades descritas, prestar contas regularmente e não alienar ativos sem anuência do investidor',
  };

  const obj = {
    desc:        V('obj_desc')        || 'objeto conforme acordado entre as partes',
    inicio:      V('obj_inicio')      ? formatDate(V('obj_inicio')) : dateStr,
    fim:         V('obj_fim')         ? formatDate(V('obj_fim'))    : 'indeterminado',
    vigencia:    V('obj_vigencia')    || '',
    local:       V('obj_local')       || '',
    obrig_a:     V('obj_obrig_a')     || defaultObrigA[selectedType] || 'cumprir integralmente as obrigações assumidas neste instrumento',
    obrig_b:     V('obj_obrig_b')     || defaultObrigB[selectedType] || 'cumprir integralmente as obrigações assumidas neste instrumento',
    entregaveis: V('obj_entregaveis') || '',
  };
  const val = {
    total:    V('val_total')    || '0,00',
    forma:    V('val_forma')    || 'à vista',
    venc:     V('val_venc')     || 'na data acordada',
    banco:    V('val_banco')    || '',
    reajuste: V('val_reajuste') || '',
    multa:    V('val_multa')    || '2%',
    juros:    V('val_juros')    || '1% ao mês',
    cond:     V('val_cond')     || '',
  };
  const jur = {
    foro:       V('jur_foro')       || 'da Comarca do domicílio das partes',
    rescisao:   V('jur_rescisao')   || '30 dias',
    multa_resc: V('jur_multa_resc') || '10% sobre o valor total do contrato',
    resolucao:  V('jur_resolucao')  || 'pelo Poder Judiciário',
    local:      V('jur_local')      || '',
    extra:      V('jur_extra')      || '',
  };

  const selectedClauses = CLAUSES.filter(c => document.getElementById('cb-'+c.id)?.checked);
  const roleA = getRoleA(selectedType);
  const roleB = getRoleB(selectedType);
  const docTitle = getDocTitle(selectedType);
  const vigText  = obj.vigencia
    ? `por prazo ${obj.vigencia === 'indeterminado' ? 'indeterminado' : 'determinado de ' + obj.vigencia}`
    : `de ${obj.inicio} a ${obj.fim}`;

  let clausN = 5;
  const extraClauses = selectedClauses.map(c => buildExtraClause(c, ++clausN, pa, pb)).join('');

  const html = buildDocHTML({ num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN: clausN + 1, typeInfo, type: selectedType });

  const docObj = {
    id: num, type: selectedType, typeInfo,
    title: `${typeInfo.name} — ${pa.nome}`,
    pa, pb, val, obj, jur,
    html,
    status: 'rascunho',
    createdAt: new Date().toISOString(),
    signedAt: null,
  };

  saveDocFS(docObj).then(() => {
    currentDocs.unshift(docObj);
    renderDocsBadge();
    viewDocument(num);
    showNotif('Documento gerado com sucesso! 🎉', '✅');
  });
}

function buildParty(prefix) {
  return {
    nome:  V(`${prefix}_nome`) || (prefix === 'p_a' ? 'CONTRATANTE' : 'CONTRATADO'),
    doc:   V(`${prefix}_doc`)  || '',
    rg:    V(`${prefix}_rg`)   || '',
    nac:   V(`${prefix}_nac`)  || 'Brasileiro(a)',
    est:   V(`${prefix}_est`)  || 'solteiro(a)',
    prof:  V(`${prefix}_prof`) || '',
    end:   V(`${prefix}_end`)  || '',
    tel:   V(`${prefix}_tel`)  || '',
    email: V(`${prefix}_email`)|| '',
  };
}

function buildDocHTML({ num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN, typeInfo, type }) {
  const roman = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];

  const partyLine = (p, role) => {
    let line = `<strong>${p.nome || role}</strong>`;
    if (p.nac && p.nac !== 'undefined') line += `, ${p.nac}`;
    if (p.est && p.est !== 'undefined') line += `, ${p.est}`;
    if (p.prof && p.prof !== 'undefined' && p.prof) line += `, ${p.prof}`;
    if (p.doc && p.doc !== 'undefined' && p.doc) line += `, portador(a) do CPF/CNPJ nº <strong>${p.doc}</strong>`;
    if (p.rg  && p.rg  !== 'undefined' && p.rg)  line += `, RG nº ${p.rg}`;
    if (p.end && p.end !== 'undefined' && p.end)  line += `, residente/domiciliado(a) em ${p.end}`;
    if (p.tel && p.tel !== 'undefined' && p.tel)  line += `, tel.: ${p.tel}`;
    if (p.email && p.email !== 'undefined' && p.email) line += `, e-mail: ${p.email}`;
    return line + '.';
  };

  const aviso = `<div style="margin-top:32px;padding:12px 16px;border:1px dashed #ccc;border-radius:4px;font-size:8.5pt;color:#777;text-align:center;line-height:1.5;">
    ⚠️ Este documento é um modelo de referência gerado pelo DocFácil. Não constitui assessoria ou consultoria jurídica. Para situações específicas, consulte um advogado inscrito na OAB.
  </div>`;

  const cabecalho = `
  <div class="doc-masthead">
    <div class="masthead-logo">DocFácil · Gerador de Modelos de Documentos</div>
    <div class="masthead-num">Nº ${num}</div>
  </div>
  <div class="doc-main-title">${docTitle}</div>`;

  // ── Documentos com templates específicos ──
  const t = type || selectedType;

  // ════ LOCAÇÃO RESIDENCIAL / COMERCIAL / SIMPLES / COM FIADOR ════
  if (['aluguel_res','aluguel_com','locacao_simples','locacao_fiador'].includes(t)) {
    const tipoImovel = t === 'aluguel_com' ? 'comercial' : 'residencial';
    const lei = 'Lei nº 8.245/1991 (Lei do Inquilinato)';
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Locação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">LOCADOR:</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO:</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
      ${t === 'locacao_fiador' ? `<div class="party"><div class="party-role">FIADOR:</div><p>_____________________________, portador(a) do CPF nº _____________________, residente em _____________________________.</p></div>` : ''}
    </div>
    <p>As partes acima qualificadas têm entre si justo e acordado o presente Contrato de Locação, regido pela ${lei} e pelo Código Civil Brasileiro, mediante as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Imóvel Locado</div><div class="clausula-body">
      <p>1.1. O LOCADOR cede ao LOCATÁRIO, para uso exclusivamente <strong>${tipoImovel}</strong>, o imóvel localizado em: <strong>${obj.desc}</strong></p>
      <p>1.2. O imóvel é entregue em perfeitas condições de uso e habitabilidade, conforme Termo de Vistoria a ser anexado e assinado por ambas as partes no ato da entrega das chaves.</p>
      <p>1.3. É expressamente vedada a sublocação, empréstimo ou cessão do imóvel, no todo ou em parte, sem prévia e expressa autorização por escrito do LOCADOR.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Do Prazo</div><div class="clausula-body">
      <p>2.1. A locação terá prazo <strong>${vigText}</strong>, com início em <strong>${obj.inicio}</strong> e término previsto em <strong>${obj.fim}</strong>.</p>
      <p>2.2. Findo o prazo, caso nenhuma das partes manifeste intenção de encerrar o contrato, a locação prosseguirá por prazo indeterminado, podendo ser rescindida mediante aviso prévio de 30 (trinta) dias, nos termos do art. 46 da Lei do Inquilinato.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Do Aluguel e Condições de Pagamento</div><div class="clausula-body">
      <p>3.1. O aluguel mensal é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), a ser pago até o dia <strong>${val.venc}</strong> de cada mês.</p>
      <p>3.2. O pagamento será efetuado mediante: <strong>${val.banco || 'dados bancários a serem fornecidos pelo LOCADOR'}</strong>.</p>
      <p>3.3. O não pagamento no prazo estipulado acarretará multa moratória de <strong>${val.multa}</strong> sobre o valor do aluguel em atraso, acrescida de juros de <strong>${val.juros}</strong> ao mês, calculados pro rata die, além de correção monetária pelo ${val.reajuste || 'IGPM'}, nos termos do art. 17 da Lei do Inquilinato.</p>
      ${val.reajuste ? `<p>3.4. O valor do aluguel será reajustado anualmente pelo índice <strong>${val.reajuste}</strong>, nos termos da legislação vigente.</p>` : '<p>3.4. O valor do aluguel será reajustado anualmente pelo IGPM/FGV, nos termos da legislação vigente.</p>'}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Obrigações do Locador</div><div class="clausula-body">
      <p>4.1. São obrigações do LOCADOR: (a) entregar o imóvel em condições de uso; (b) garantir o uso pacífico do imóvel durante a locação; (c) responder pelos vícios ou defeitos anteriores à locação; (d) pagar os impostos e taxas incidentes sobre o imóvel (IPTU), salvo convenção em contrário.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula V — Das Obrigações do Locatário</div><div class="clausula-body">
      <p>5.1. São obrigações do LOCATÁRIO: (a) pagar o aluguel e os encargos no prazo convencionado; (b) utilizar o imóvel somente para uso ${tipoImovel}; (c) conservar e zelar pelo imóvel, responsabilizando-se pelos danos causados; (d) pagar as contas de consumo (água, luz, gás e demais utilidades); (e) não realizar obras ou modificações sem prévia autorização por escrito do LOCADOR; (f) restituir o imóvel ao final da locação nas mesmas condições em que o recebeu, conforme Termo de Vistoria.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Rescisão</div><div class="clausula-body">
      <p>6.1. O descumprimento de qualquer cláusula deste contrato ensejará sua rescisão imediata, sem prejuízo das penalidades cabíveis.</p>
      <p>6.2. Em caso de rescisão antecipada pelo LOCATÁRIO, será devida multa de <strong>${jur.multa_resc}</strong>, proporcional ao período faltante, nos termos do art. 4º da Lei do Inquilinato.</p>
      <p>6.3. A desocupação do imóvel deverá ser comunicada com antecedência mínima de <strong>${jur.rescisao}</strong>.</p>
    </div></div>

    ${t === 'locacao_fiador' ? `<div class="clausula"><div class="clausula-title">Cláusula VII — Da Fiança</div><div class="clausula-body">
      <p>7.1. O FIADOR acima qualificado, em caráter solidário e como principal pagador, garante o cumprimento de todas as obrigações assumidas pelo LOCATÁRIO neste instrumento, respondendo pelo pagamento do aluguel, encargos, multas e demais obrigações decorrentes deste contrato até a efetiva desocupação e entrega das chaves do imóvel.</p>
    </div></div>` : ''}

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[t === 'locacao_fiador' ? 8 : 7]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este contrato é regido pela ${lei} e pelo Código Civil (Lei nº 10.406/2002). As partes elegem o foro da <strong>${jur.foro || 'Comarca do local do imóvel'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t === 'locacao_fiador' ? `<div class="sig-grid"><div class="sig-item"><div class="sig-line"></div><div class="sig-name">_____________________________</div><div class="sig-role">FIADOR</div><div class="sig-doc">CPF: _____________________</div></div><div class="sig-item"></div></div>` : ''}
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ RECIBO DE PAGAMENTO ════
  if (['recibo','recibo_aluguel'].includes(t)) {
    return `${cabecalho}
    <div class="doc-subtitle">Documento comprobatório de pagamento · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados do Recibo</div>
      <div class="party"><div class="party-role">RECEBEDOR:</div><p>${partyLine(pa,'RECEBEDOR')}</p></div>
      <div class="party"><div class="party-role">PAGANTE:</div><p>${partyLine(pb,'PAGANTE')}</p></div>
    </div>

    <div class="clausula"><div class="clausula-title">Declaração de Recebimento</div><div class="clausula-body">
      <p>Declaro que recebi de <strong>${pb.nome}</strong>, a quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
      <p>Forma de pagamento: <strong>${val.forma}</strong>${val.banco ? ' — ' + val.banco : ''}.</p>
      <p>Período de referência: <strong>${obj.inicio} a ${obj.fim !== 'indeterminado' ? obj.fim : obj.inicio}</strong>.</p>
      <p>Por ser verdade, firmo o presente recibo, dando plena, geral e irrevogável quitação da referida quantia, para que produza seus efeitos legais.</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">RECEBEDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PAGANTE</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>
    ${aviso}`;
  }

  // ════ DECLARAÇÕES ════
  if (['decl_residencia','decl_renda','decl_informal','decl_comparec','decl_respons','decl_uniao'].includes(t)) {
    const declTextos = {
      decl_residencia: `Declaro, para os devidos fins, que resido no endereço: <strong>${obj.desc || obj.local}</strong>, nesta cidade, há aproximadamente <strong>${obj.vigencia || 'tempo indeterminado'}</strong>. Declaro ainda que as informações prestadas são verdadeiras e assumo total responsabilidade civil e criminal por esta declaração.`,
      decl_renda: `Declaro, para os devidos fins, que minha renda ${obj.vigencia === '1 mês' ? 'mensal' : 'aproximada'} é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), proveniente de: <strong>${obj.desc}</strong>. Declaro que as informações são verdadeiras e assumo total responsabilidade por esta declaração.`,
      decl_informal: `Declaro, para os devidos fins, que exerço atividade de trabalho informal como <strong>${pa.prof || obj.desc}</strong>, auferindo renda aproximada de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) mensais. Declaro que as informações são verdadeiras.`,
      decl_comparec: `Declaro, para os devidos fins, que <strong>${pb.nome}</strong>, portador(a) do CPF nº <strong>${pb.doc}</strong>, compareceu a este estabelecimento/local em <strong>${obj.inicio}</strong>, no período de <strong>${obj.desc}</strong>. Esta declaração é fornecida a pedido do(a) interessado(a).`,
      decl_respons: `Declaro, para os devidos fins, que me responsabilizo por: <strong>${obj.desc}</strong>. Assumo toda responsabilidade civil decorrente desta declaração, isentando terceiros de quaisquer ônus.`,
      decl_uniao: `Declaramos, para os devidos fins legais, que vivemos em União Estável desde <strong>${obj.inicio}</strong>, de forma pública, contínua e duradoura, com o objetivo de constituir família, nos termos do art. 1.723 do Código Civil Brasileiro (Lei nº 10.406/2002). Declaramos ainda que não possuímos impedimentos legais para a união e que as informações prestadas são verdadeiras.`,
    };
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Declarante${t === 'decl_uniao' ? 's' : ''}</div>
      <div class="party"><div class="party-role">DECLARANTE${t === 'decl_uniao' ? ' 1' : ''}:</div><p>${partyLine(pa,'DECLARANTE')}</p></div>
      ${t === 'decl_uniao' ? `<div class="party"><div class="party-role">DECLARANTE 2:</div><p>${partyLine(pb,'DECLARANTE 2')}</p></div>` : ''}
    </div>
    <div class="clausula"><div class="clausula-body"><p>${declTextos[t]}</p>${jur.extra ? `<p>${jur.extra}</p>` : ''}</div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">DECLARANTE</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        ${t === 'decl_uniao' ? `<div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">DECLARANTE 2</div><div class="sig-doc">CPF: ${pb.doc}</div></div>` : '<div class="sig-item"></div>'}
      </div>
    </div>
    ${aviso}`;
  }

  // ════ CONFISSÃO DE DÍVIDA / PARCELAMENTO / QUITAÇÃO ════
  if (['confissao_divida','parcelamento','quitacao'].includes(t)) {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CREDOR:</div><p>${partyLine(pa,'CREDOR')}</p></div>
      <div class="party"><div class="party-role">DEVEDOR:</div><p>${partyLine(pb,'DEVEDOR')}</p></div>
    </div>
    <p>As partes acima qualificadas celebram o presente instrumento mediante as seguintes condições:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — ${t === 'quitacao' ? 'Da Quitação' : t === 'confissao_divida' ? 'Da Dívida Confessada' : 'Do Parcelamento'}</div><div class="clausula-body">
      ${t === 'quitacao'
        ? `<p>1.1. O CREDOR declara ter recebido do DEVEDOR a quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
           <p>1.2. Dando plena, geral e irrevogável quitação da referida quantia, nada mais tendo a reclamar a qualquer título, presente ou futuro, em razão da dívida ora quitada.</p>`
        : t === 'confissao_divida'
        ? `<p>1.1. O DEVEDOR reconhece e confessa, por este instrumento, ser devedor ao CREDOR da quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
           <p>1.2. O DEVEDOR compromete-se a quitar o débito até <strong>${obj.fim}</strong>, mediante <strong>${val.forma}</strong>.</p>`
        : `<p>1.1. O DEVEDOR reconhece o débito de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) perante o CREDOR e compromete-se a pagá-lo de forma parcelada.</p>
           <p>1.2. O pagamento será realizado em parcelas de <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante ${val.banco || 'forma a ser acordada'}.</p>`
      }
      <p>${t === 'quitacao' ? '1.3.' : '1.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de <strong>${val.juros}</strong> ao mês, nos termos do art. 395 do Código Civil.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Do Foro</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'da Comarca do domicílio do devedor'}</strong> para dirimir eventuais litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CREDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">DEVEDOR</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ NDA / CONFIDENCIALIDADE ════
  if (t === 'nda') {
    return `${cabecalho}
    <div class="doc-subtitle">Acordo de Não-Divulgação — Non-Disclosure Agreement · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARTE DIVULGANTE:</div><p>${partyLine(pa,'PARTE DIVULGANTE')}</p></div>
      <div class="party"><div class="party-role">PARTE RECEPTORA:</div><p>${partyLine(pb,'PARTE RECEPTORA')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Confidencialidade, comprometendo-se a observar as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Das Informações Confidenciais</div><div class="clausula-body">
      <p>1.1. Consideram-se confidenciais todas as informações relacionadas a: <strong>${obj.desc}</strong>, incluindo, mas não se limitando a: dados técnicos, financeiros, comerciais, estratégicos, segredos de negócio, know-how, projetos, planos, códigos-fonte e quaisquer outros dados revelados por uma parte à outra.</p>
      <p>1.2. As obrigações de confidencialidade não se aplicam a informações que: (a) sejam ou se tornem de domínio público sem culpa da Parte Receptora; (b) já eram de conhecimento da Parte Receptora antes da divulgação; (c) sejam exigidas por determinação judicial ou legal.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
      <p>2.1. A PARTE RECEPTORA compromete-se a: (a) manter as informações confidenciais em sigilo absoluto; (b) não divulgar, reproduzir ou utilizar as informações para fins outros que não os previstos neste acordo; (c) restringir o acesso às informações apenas às pessoas que necessitem conhecê-las para os fins acordados.</p>
      <p>2.2. A vigência das obrigações de sigilo é de <strong>${vigText}</strong>, a contar da data de assinatura deste instrumento.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Das Penalidades</div><div class="clausula-body">
      <p>3.1. O descumprimento das obrigações deste acordo sujeitará a parte infratora ao pagamento de multa de <strong>R$ ${val.total || '10.000,00'}</strong>, sem prejuízo de perdas e danos apurados em juízo e demais sanções legais cabíveis.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Do Foro</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARTE DIVULGANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARTE RECEPTORA</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ FREELANCER / PRESTAÇÃO DE SERVIÇOS / PJ / AUTÔNOMO ════
  if (['servico','freelancer','trabalho_pj','autonomo'].includes(t)) {
    const tipoContrato = t === 'freelancer' ? 'Freelancer' : t === 'trabalho_pj' ? 'Trabalho PJ' : t === 'autonomo' ? 'Autônomo' : 'Prestação de Serviços';
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de ${tipoContrato} · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CONTRATANTE:</div><p>${partyLine(pa,'CONTRATANTE')}</p></div>
      <div class="party"><div class="party-role">CONTRATADO:</div><p>${partyLine(pb,'CONTRATADO')}</p></div>
    </div>
    <p>As partes celebram o presente instrumento mediante as seguintes cláusulas e condições, ficando expressamente acordado que a presente relação é de natureza civil, não gerando qualquer vínculo empregatício entre as partes, nos termos do art. 593 e seguintes do Código Civil:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O CONTRATADO prestará ao CONTRATANTE os seguintes serviços: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Entregáveis: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} Os serviços serão prestados ${vigText}, com início em <strong>${obj.inicio}</strong>${obj.fim !== 'indeterminado' ? ` e término em <strong>${obj.fim}</strong>` : ''}, no local: <strong>${obj.local || 'a ser definido entre as partes'}</strong>.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações do Contratante</div><div class="clausula-body">
      <p>2.1. Compete ao CONTRATANTE: ${obj.obrig_a || 'efetuar o pagamento nos prazos estabelecidos; fornecer as informações e subsídios necessários à execução dos serviços; comunicar ao CONTRATADO eventuais alterações no escopo com antecedência mínima de 5 dias úteis'}.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do Contratado</div><div class="clausula-body">
      <p>3.1. Compete ao CONTRATADO: ${obj.obrig_b || 'executar os serviços com qualidade, diligência e nos prazos acordados; manter o CONTRATANTE informado sobre o andamento dos trabalhos; responsabilizar-se pelos impostos e contribuições decorrentes de sua atividade autônoma'}.</p>
      <p>3.2. O CONTRATADO declara possuir plena capacidade técnica para a prestação dos serviços ora contratados, respondendo por eventuais falhas na execução.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Remuneração</div><div class="clausula-body">
      <p>4.1. Pela prestação dos serviços, o CONTRATANTE pagará ao CONTRATADO o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, com vencimento em <strong>${val.venc}</strong>.</p>
      <p>4.2. O pagamento será realizado mediante: <strong>${val.banco || 'dados bancários a serem informados pelo CONTRATADO'}</strong>.</p>
      ${val.reajuste ? `<p>4.3. O valor será reajustado pelo índice <strong>${val.reajuste}</strong>.</p>` : ''}
      <p>${val.reajuste ? '4.4.' : '4.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de <strong>${val.juros}</strong> ao mês, nos termos do art. 395 do Código Civil.</p>
      ${val.cond ? `<p>Condições especiais: ${val.cond}.</p>` : ''}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula V — Da Rescisão</div><div class="clausula-body">
      <p>5.1. Qualquer das partes poderá rescindir o presente instrumento mediante notificação escrita com antecedência mínima de <strong>${jur.rescisao}</strong>.</p>
      <p>5.2. A rescisão imotivada implicará multa de <strong>${jur.multa_resc}</strong>.</p>
      <p>5.3. Em caso de rescisão por descumprimento, a parte faltosa responderá por perdas e danos.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Ausência de Vínculo Empregatício</div><div class="clausula-body">
      <p>6.1. O presente instrumento não gera vínculo empregatício, societário ou associativo entre as partes. O CONTRATADO exercerá suas atividades com autonomia, podendo prestar serviços a outros clientes, desde que não haja conflito de interesses com o CONTRATANTE.</p>
      <p>6.2. O CONTRATADO é responsável pelo recolhimento de seus próprios tributos, previdência social e demais encargos decorrentes de sua atividade.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este instrumento é regido pelo Código Civil (Lei nº 10.406/2002). Fica eleito o foro de <strong>${jur.foro}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTRATANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">CONTRATADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ INFLUENCIADOR DIGITAL ════
  if (t === 'influenciador') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Parceria Comercial com Influenciador Digital · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CONTRATANTE (MARCA/EMPRESA):</div><p>${partyLine(pa,'CONTRATANTE')}</p></div>
      <div class="party"><div class="party-role">INFLUENCIADOR DIGITAL:</div><p>${partyLine(pb,'INFLUENCIADOR')}</p></div>
    </div>
    <p>As partes celebram o presente instrumento de parceria comercial para criação e divulgação de conteúdo digital, conforme as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto e Escopo da Parceria</div><div class="clausula-body">
      <p>1.1. O INFLUENCIADOR compromete-se a criar e publicar conteúdo digital promovendo: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Entregáveis: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} A parceria vigorará ${vigText}, com início em <strong>${obj.inicio}</strong>.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações do Influenciador</div><div class="clausula-body">
      <p>2.1. O INFLUENCIADOR compromete-se a: (a) criar conteúdo autêntico e alinhado com as diretrizes da marca; (b) identificar o conteúdo patrocinado conforme as normas do CONAR e BACEN; (c) não associar a marca a conteúdos polêmicos, ofensivos ou que violem a legislação; (d) manter as métricas e resultados informados ao CONTRATANTE.</p>
      <p>2.2. O INFLUENCIADOR declara ser titular dos canais/perfis utilizados e possuir audiência verdadeira, respondendo por quaisquer irregularidades neste sentido.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Da Remuneração</div><div class="clausula-body">
      <p>3.1. Pela execução da parceria, o CONTRATANTE pagará ao INFLUENCIADOR o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      ${val.cond ? `<p>3.2. Condições especiais: ${val.cond}.</p>` : ''}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Dos Direitos Autorais</div><div class="clausula-body">
      <p>4.1. O CONTRATANTE terá direito de uso do conteúdo produzido pelo INFLUENCIADOR pelo período de <strong>${vigText}</strong>, podendo ser prorrogado mediante acordo entre as partes e pagamento adicional a ser negociado.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTRATANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">INFLUENCIADOR DIGITAL</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ COMPRA E VENDA ════
  if (t === 'compravenda') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Compra e Venda · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">VENDEDOR:</div><p>${partyLine(pa,'VENDEDOR')}</p></div>
      <div class="party"><div class="party-role">COMPRADOR:</div><p>${partyLine(pb,'COMPRADOR')}</p></div>
    </div>
    <p>As partes celebram o presente Contrato de Compra e Venda, nos termos dos arts. 481 a 532 do Código Civil (Lei nº 10.406/2002), mediante as seguintes cláusulas:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O VENDEDOR vende ao COMPRADOR, em caráter irrevogável e irretratável: <strong>${obj.desc}</strong></p>
      <p>1.2. O bem objeto deste contrato é vendido no estado em que se encontra, sendo de responsabilidade do COMPRADOR verificar suas condições antes da assinatura.</p>
      ${obj.entregaveis ? `<p>1.3. Características adicionais: ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Preço e Forma de Pagamento</div><div class="clausula-body">
      <p>2.1. O preço total da venda é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pago <strong>${val.forma}</strong>.</p>
      <p>2.2. O pagamento será efetuado mediante: <strong>${val.banco || 'dados a serem informados pelo VENDEDOR'}</strong>.</p>
      ${val.cond ? `<p>2.3. Condições especiais: ${val.cond}</p>` : ''}
      <p>${val.cond ? '2.4.' : '2.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de <strong>${val.juros}</strong> ao mês.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Entrega e Transferência</div><div class="clausula-body">
      <p>3.1. O bem será entregue ao COMPRADOR em <strong>${obj.fim !== 'indeterminado' ? obj.fim : obj.inicio}</strong>, no local: <strong>${obj.local || 'a ser acordado entre as partes'}</strong>.</p>
      <p>3.2. A transferência definitiva da propriedade ocorrerá após o pagamento integral do preço. Até lá, o bem permanece em nome do VENDEDOR.</p>
      <p>3.3. As despesas de transferência, registro e tributos incidentes sobre a transação serão de responsabilidade do <strong>COMPRADOR</strong>, salvo acordo em contrário.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Garantias</div><div class="clausula-body">
      <p>4.1. O VENDEDOR garante que o bem está livre e desembaraçado de quaisquer ônus, dívidas, hipotecas ou restrições, respondendo por eventuais vícios ocultos nos termos do art. 441 do Código Civil.</p>
      <p>4.2. O VENDEDOR responde pela evicção, nos termos dos arts. 447 a 457 do Código Civil.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">VENDEDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">COMPRADOR</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ PARCERIA COMERCIAL ════
  if (t === 'parceria' || t === 'plano_parceria') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Parceria Comercial · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARCEIRO A:</div><p>${partyLine(pa,'PARCEIRO A')}</p></div>
      <div class="party"><div class="party-role">PARCEIRO B:</div><p>${partyLine(pb,'PARCEIRO B')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Parceria Comercial, comprometendo-se a atuar de forma colaborativa para os fins descritos neste instrumento:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto da Parceria</div><div class="clausula-body">
      <p>1.1. As partes estabelecem parceria comercial para: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Escopo e metas: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} A parceria vigorará ${vigText}, com início em <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações e Responsabilidades</div><div class="clausula-body">
      <p>2.1. Compete ao PARCEIRO A: ${obj.obrig_a || 'aportar recursos, conhecimento e infraestrutura conforme acordado'}.</p>
      <p>2.2. Compete ao PARCEIRO B: ${obj.obrig_b || 'executar as atividades operacionais e de relacionamento conforme acordado'}.</p>
      <p>2.3. As decisões estratégicas serão tomadas em conjunto, mediante acordo entre as partes.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Remuneração e Divisão de Resultados</div><div class="clausula-body">
      <p>3.1. Os resultados financeiros da parceria serão divididos na proporção de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), conforme <strong>${val.forma}</strong>.</p>
      <p>3.2. Os pagamentos serão realizados mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>, com vencimento <strong>${val.venc || 'conforme apuração dos resultados'}</strong>.</p>
      ${val.cond ? `<p>3.3. Condições especiais: ${val.cond}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Confidencialidade</div><div class="clausula-body">
      <p>4.1. As partes comprometem-se a manter sigilo sobre todas as informações estratégicas, comerciais e financeiras obtidas em razão desta parceria, durante toda a vigência e por 2 (dois) anos após o encerramento.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Rescisão</div><div class="clausula-body">
      <p>5.1. A parceria poderá ser encerrada por qualquer das partes mediante aviso prévio de <strong>${jur.rescisao}</strong>, devendo as obrigações em curso ser finalizadas.</p>
      <p>5.2. O encerramento imotivado implicará multa de <strong>${jur.multa_resc}</strong>.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este instrumento não gera vínculo societário entre as partes. Fica eleito o foro de <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARCEIRO A</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARCEIRO B</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ COMISSÃO / REPRESENTAÇÃO COMERCIAL ════
  if (t === 'comissao') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Representação Comercial e Comissão · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">COMITENTE (Empresa):</div><p>${partyLine(pa,'COMITENTE')}</p></div>
      <div class="party"><div class="party-role">COMISSIONADO (Representante):</div><p>${partyLine(pb,'COMISSIONADO')}</p></div>
    </div>
    <p>As partes celebram o presente Contrato de Representação Comercial, nos termos da Lei nº 4.886/1965 e alterações:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O COMISSIONADO fica autorizado a representar comercialmente o COMITENTE na venda de: <strong>${obj.desc}</strong></p>
      <p>1.2. Área de atuação: <strong>${obj.local || 'todo o território nacional'}</strong>.</p>
      <p>1.3. A representação vigorará ${vigText}, a partir de <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Comissão</div><div class="clausula-body">
      <p>2.1. O COMISSIONADO receberá comissão de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) ou equivalente a <strong>${val.forma}</strong> sobre as vendas realizadas.</p>
      <p>2.2. O pagamento das comissões ocorrerá <strong>${val.venc || 'mensalmente até o 10º dia do mês subsequente'}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.3. As comissões são devidas no momento da efetivação do pagamento pelo cliente final ao COMITENTE.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do Comissionado</div><div class="clausula-body">
      <p>3.1. O COMISSIONADO compromete-se a: (a) promover ativamente as vendas dos produtos/serviços do COMITENTE; (b) manter relacionamento ético com os clientes; (c) prestar contas regularmente ao COMITENTE; (d) não representar empresas concorrentes sem autorização prévia.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Rescisão</div><div class="clausula-body">
      <p>4.1. O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de <strong>${jur.rescisao}</strong>, nos termos do art. 34 da Lei nº 4.886/1965.</p>
      <p>4.2. Em caso de rescisão sem justa causa pelo COMITENTE, será devida indenização ao COMISSIONADO conforme legislação vigente.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Regido pela Lei nº 4.886/1965 e Código Civil. Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">COMITENTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">COMISSIONADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ VISTORIA DO IMÓVEL ════
  if (t === 'vistoria') {
    return `${cabecalho}
    <div class="doc-subtitle">Termo de Vistoria de Imóvel · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação</div>
      <div class="party"><div class="party-role">LOCADOR / PROPRIETÁRIO:</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO / OCUPANTE:</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">1. Identificação do Imóvel</div><div class="clausula-body">
      <p>Imóvel localizado em: <strong>${obj.desc}</strong></p>
      <p>Data da vistoria: <strong>${obj.inicio}</strong> | Tipo: <strong>${obj.local || 'Residencial'}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Estado de Conservação Geral</div><div class="clausula-body">
      <p>As partes declaram que o imóvel foi vistoriado e se encontra nas seguintes condições:</p>
      <p><strong>Paredes e pintura:</strong> _____________________________________________</p>
      <p><strong>Pisos e revestimentos:</strong> _____________________________________________</p>
      <p><strong>Janelas e portas:</strong> _____________________________________________</p>
      <p><strong>Instalações elétricas:</strong> _____________________________________________</p>
      <p><strong>Instalações hidráulicas:</strong> _____________________________________________</p>
      <p><strong>Telhado / Laje:</strong> _____________________________________________</p>
      <p><strong>Área externa / Jardim:</strong> _____________________________________________</p>
      ${obj.entregaveis ? `<p><strong>Observações adicionais:</strong> ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Itens Entregues</div><div class="clausula-body">
      <p>Chaves: _______ cópias | Controle de portão: _______ | Outros: _____________</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Declaração das Partes</div><div class="clausula-body">
      <p>As partes declaram que as informações acima correspondem ao estado real do imóvel na data da vistoria, comprometendo-se o LOCATÁRIO a devolvê-lo nas mesmas condições ao final da locação, salvo desgaste natural pelo uso.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR / PROPRIETÁRIO</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO / OCUPANTE</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ NOTIFICAÇÃO DE DESOCUPAÇÃO ════
  if (t === 'notif_desocupacao') {
    return `${cabecalho}
    <div class="doc-subtitle">Notificação Extrajudicial de Desocupação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação</div>
      <div class="party"><div class="party-role">NOTIFICANTE (Proprietário/Locador):</div><p>${partyLine(pa,'NOTIFICANTE')}</p></div>
      <div class="party"><div class="party-role">NOTIFICADO (Locatário/Ocupante):</div><p>${partyLine(pb,'NOTIFICADO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Da Notificação</div><div class="clausula-body">
      <p>O NOTIFICANTE, por meio do presente instrumento, notifica formalmente o NOTIFICADO para que desocupe o imóvel situado em: <strong>${obj.desc}</strong>, no prazo de <strong>${jur.rescisao || '30 (trinta) dias'}</strong>, contados do recebimento desta notificação.</p>
      <p>Motivo da notificação: <strong>${obj.local || 'encerramento do contrato de locação'}</strong>.</p>
      ${obj.entregaveis ? `<p>Observações: ${obj.entregaveis}</p>` : ''}
      <p>Caso o imóvel não seja desocupado no prazo estipulado, o NOTIFICANTE adotará as medidas judiciais cabíveis, incluindo ação de despejo, com todos os ônus decorrentes ao NOTIFICADO, nos termos da Lei nº 8.245/1991.</p>
      <p>Esta notificação serve como prova formal do aviso prévio legalmente exigido.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">NOTIFICANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">Ciente: ${pb.nome}</div><div class="sig-role">NOTIFICADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO DE INADIMPLÊNCIA ════
  if (t === 'acordo_inadimpl') {
    return `${cabecalho}
    <div class="doc-subtitle">Acordo de Regularização de Débito Locatício · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">LOCADOR (CREDOR):</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO (DEVEDOR):</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Regularização, mediante as seguintes condições:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Débito</div><div class="clausula-body">
      <p>1.1. O LOCATÁRIO reconhece o débito de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
      <p>1.2. As partes concordam que o valor acima representa o total da dívida, incluindo aluguéis, encargos, multas e juros devidos até <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Acordo de Pagamento</div><div class="clausula-body">
      <p>2.1. O LOCATÁRIO compromete-se a quitar o débito <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.2. O LOCATÁRIO compromete-se ainda a manter os aluguéis futuros em dia, sob pena de rescisão imediata deste acordo.</p>
      <p>2.3. O descumprimento deste acordo ensejará a retomada imediata das medidas judiciais pelo LOCADOR, sem necessidade de nova notificação.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Quitação Condicionada</div><div class="clausula-body">
      <p>3.1. O LOCADOR concede ao LOCATÁRIO a quitação condicionada ao cumprimento integral deste acordo. O descumprimento de qualquer parcela tornará o acordo sem efeito, restaurando integralmente o débito original.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ CARTA DE APRESENTAÇÃO ════
  if (t === 'carta_apres') {
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div style="margin-bottom:24px;">
      <p><strong>${pa.nome}</strong>${pa.prof ? ' — ' + pa.prof : ''}</p>
      ${pa.end ? `<p>${pa.end}</p>` : ''}
      ${pa.tel ? `<p>Tel.: ${pa.tel}</p>` : ''}
      ${pa.email ? `<p>E-mail: ${pa.email}</p>` : ''}
    </div>
    <div style="margin-bottom:24px;">
      <p>A/C: <strong>${pb.nome || 'Responsável de Recursos Humanos'}</strong></p>
      ${pb.end ? `<p>${pb.end}</p>` : ''}
    </div>
    <p><strong>Assunto: ${obj.desc || 'Carta de Apresentação Profissional'}</strong></p><br>
    <div class="clausula"><div class="clausula-body">
      <p>Prezado(a) ${pb.nome || 'Senhor(a)'},</p>
      <p>Venho, por meio desta carta, apresentar-me como candidato(a) à oportunidade em sua empresa. Sou <strong>${pa.nome}</strong>, ${pa.prof ? pa.prof + ', ' : ''}com ${obj.local || 'experiência na área'}.</p>
      <p>${obj.obrig_a || 'Ao longo da minha trajetória profissional, desenvolvi competências que acredito serem relevantes para contribuir com os objetivos de sua organização. Tenho interesse genuíno em fazer parte de sua equipe e acredito que meu perfil se alinha aos valores e necessidades da empresa.'}</p>
      <p>${obj.obrig_b || 'Coloco-me à disposição para uma entrevista, quando poderemos conversar mais detalhadamente sobre como posso agregar valor à sua equipe.'}</p>
      <p>Agradeço a atenção dispensada e aguardo um retorno.</p>
    </div></div>
    <div style="margin-top:40px;">
      <p>Atenciosamente,</p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p><strong>${pa.nome}</strong></p>
      ${pa.prof ? `<p>${pa.prof}</p>` : ''}
    </div>
    ${aviso}`;
  }

  // ════ CARTA DE DEMISSÃO ════
  if (t === 'carta_demissao') {
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div style="margin-bottom:24px;">
      <p>De: <strong>${pa.nome}</strong>${pa.prof ? ' — ' + pa.prof : ''}</p>
      <p>Para: <strong>${pb.nome || 'Departamento de Recursos Humanos'}</strong></p>
    </div>
    <p><strong>Assunto: Pedido de Demissão</strong></p><br>
    <div class="clausula"><div class="clausula-body">
      <p>Prezado(a) ${pb.nome || 'Senhor(a)'},</p>
      <p>Venho, por meio desta carta, formalizar meu pedido de demissão do cargo de <strong>${pa.prof || 'cargo que ocupo'}</strong> nesta empresa, a partir desta data.</p>
      <p>${obj.desc || 'Esta decisão foi tomada após cuidadosa reflexão sobre minha trajetória profissional e objetivos de carreira. Agradeço imensamente pela oportunidade de crescimento e aprendizado proporcionados durante meu período na empresa.'}</p>
      <p>Comprometo-me a cumprir o aviso prévio de <strong>${jur.rescisao || '30 (trinta) dias'}</strong>, conforme previsto em contrato e na legislação trabalhista vigente, garantindo a plena transição das minhas responsabilidades.</p>
      <p>Agradeço a todos os colegas e lideranças pela convivência e peço que confirmem o recebimento desta carta.</p>
    </div></div>
    <div style="margin-top:40px;">
      <p>Respeitosamente,</p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p><strong>${pa.nome}</strong></p>
      <p>CPF: ${pa.doc}</p>
      <p>${dateStr}</p>
    </div>
    <div style="margin-top:30px;padding:16px;border:1px solid #ddd;border-radius:4px;">
      <p><strong>Ciente:</strong></p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p>${pb.nome || 'Representante da Empresa'}</p>
      <p>Data: ___/___/______</p>
    </div>
    ${aviso}`;
  }

  // ════ DECLARAÇÃO DE EXPERIÊNCIA ════
  if (t === 'decl_experiencia') {
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados da Empresa Declarante</div>
      <div class="party"><div class="party-role">EMPRESA:</div><p>${partyLine(pa,'EMPRESA')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Declaração de Experiência Profissional</div><div class="clausula-body">
      <p>Declaramos, para os devidos fins, que <strong>${pb.nome}</strong>, portador(a) do CPF nº <strong>${pb.doc}</strong>, prestou serviços a esta empresa no cargo/função de <strong>${pb.prof || obj.desc}</strong>, pelo período de <strong>${obj.inicio}</strong> a <strong>${obj.fim !== 'indeterminado' ? obj.fim : 'atual'}</strong>.</p>
      <p>Durante o período mencionado, o(a) profissional demonstrou: <strong>${obj.obrig_b || 'competência técnica, comprometimento e responsabilidade no exercício de suas funções'}</strong>.</p>
      ${obj.entregaveis ? `<p>Atividades desenvolvidas: ${obj.entregaveis}</p>` : ''}
      <p>Esta declaração é fornecida a pedido do(a) interessado(a) para os fins que se fizerem necessários, sendo verdadeiras todas as informações aqui prestadas.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">Representante Legal</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ESTÁGIO ════
  if (t === 'estagio') {
    return `${cabecalho}
    <div class="doc-subtitle">Termo de Compromisso de Estágio · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">EMPRESA CONCEDENTE:</div><p>${partyLine(pa,'EMPRESA CONCEDENTE')}</p></div>
      <div class="party"><div class="party-role">ESTAGIÁRIO(A):</div><p>${partyLine(pb,'ESTAGIÁRIO')}</p></div>
    </div>
    <p>As partes celebram o presente Termo de Compromisso de Estágio, nos termos da Lei nº 11.788/2008 (Lei do Estágio), mediante as seguintes condições:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Estágio</div><div class="clausula-body">
      <p>1.1. A EMPRESA CONCEDENTE recebe o(a) ESTAGIÁRIO(A) para realização de estágio na área de: <strong>${obj.desc}</strong></p>
      <p>1.2. O estágio terá duração de <strong>${vigText}</strong>, com início em <strong>${obj.inicio}</strong> e término em <strong>${obj.fim}</strong>, conforme art. 11 da Lei nº 11.788/2008.</p>
      <p>1.3. Carga horária: <strong>${obj.local || '6 horas diárias, 30 horas semanais'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Bolsa-Auxílio</div><div class="clausula-body">
      <p>2.1. Será paga ao(à) ESTAGIÁRIO(A) bolsa-auxílio no valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, além de auxílio-transporte conforme legislação vigente.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações</div><div class="clausula-body">
      <p>3.1. A EMPRESA CONCEDENTE compromete-se a: oferecer atividades compatíveis com a área de formação do estagiário; designar supervisor responsável; garantir condições de segurança; conceder recesso de 30 dias a cada 12 meses.</p>
      <p>3.2. O(A) ESTAGIÁRIO(A) compromete-se a: cumprir a carga horária estabelecida; zelar pelo sigilo das informações da empresa; cumprir as normas internas da empresa.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>O presente estágio não gera vínculo empregatício, nos termos do art. 3º da Lei nº 11.788/2008. Foro: <strong>${jur.foro}</strong>.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">EMPRESA CONCEDENTE</div><div class="sig-doc">CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">ESTAGIÁRIO(A)</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ NOTA SIMPLES DE SERVIÇO ════
  if (t === 'nota_servico') {
    return `${cabecalho}
    <div class="doc-subtitle">Nota de Prestação de Serviço · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados</div>
      <div class="party"><div class="party-role">PRESTADOR:</div><p>${partyLine(pa,'PRESTADOR')}</p></div>
      <div class="party"><div class="party-role">TOMADOR:</div><p>${partyLine(pb,'TOMADOR')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Descrição do Serviço</div><div class="clausula-body">
      <p><strong>Serviço prestado:</strong> ${obj.desc}</p>
      <p><strong>Data de execução:</strong> ${obj.inicio}</p>
      ${obj.local ? `<p><strong>Local:</strong> ${obj.local}</p>` : ''}
      ${obj.entregaveis ? `<p><strong>Detalhes:</strong> ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Valor</div><div class="clausula-body">
      <p><strong>Valor total: R$ ${val.total}</strong> (${valorExtenso(val.total)})</p>
      <p>Forma de pagamento: ${val.forma} | Vencimento: ${val.venc}</p>
      ${val.banco ? `<p>Dados para pagamento: ${val.banco}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-body">
      <p>Declaro ter prestado os serviços acima descritos e que as informações são verdadeiras.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PRESTADOR DE SERVIÇO</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">TOMADOR — Ciente</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ LGPD / PRIVACIDADE / TERMOS DE USO ════
  if (['lgpd_termo','politica_priv','termo_uso'].includes(t)) {
    const titulos = {
      lgpd_termo: 'Termo de Consentimento para Tratamento de Dados Pessoais',
      politica_priv: 'Política de Privacidade',
      termo_uso: 'Termos de Uso da Plataforma',
    };
    return `${cabecalho}
    <div class="doc-subtitle">${titulos[t]} · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Responsável pelo Tratamento</div>
      <div class="party"><div class="party-role">CONTROLADOR DOS DADOS:</div><p>${partyLine(pa,'EMPRESA/RESPONSÁVEL')}</p></div>
    </div>
    ${t === 'lgpd_termo' ? `
    <div class="clausula"><div class="clausula-title">1. Finalidade do Tratamento</div><div class="clausula-body">
      <p>O(A) CONTROLADOR(A) acima identificado(a) trata dados pessoais do titular para as seguintes finalidades: <strong>${obj.desc}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Dados Coletados</div><div class="clausula-body">
      <p>Serão coletados os seguintes dados: <strong>${obj.entregaveis || 'nome, e-mail, CPF e demais dados necessários para a prestação do serviço'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Direitos do Titular</div><div class="clausula-body">
      <p>Nos termos da Lei nº 13.709/2018 (LGPD), o titular tem direito a: (a) confirmação de tratamento; (b) acesso aos dados; (c) correção; (d) anonimização ou eliminação; (e) portabilidade; (f) informação sobre compartilhamento; (g) revogação do consentimento a qualquer tempo.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Prazo de Conservação</div><div class="clausula-body">
      <p>Os dados serão mantidos pelo prazo de <strong>${vigText}</strong> ou pelo tempo necessário ao cumprimento das finalidades descritas, exceto quando houver obrigação legal de guarda por prazo superior.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">5. Consentimento</div><div class="clausula-body">
      <p>O titular declara ter lido e compreendido este termo, consentindo livremente com o tratamento de seus dados pessoais conforme descrito acima, nos termos do art. 8º da LGPD.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome || 'TITULAR DOS DADOS'}</div><div class="sig-role">TITULAR</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTROLADOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
      </div>
    </div>` : `
    <div class="clausula"><div class="clausula-title">1. Sobre ${t === 'politica_priv' ? 'a Política de Privacidade' : 'os Termos de Uso'}</div><div class="clausula-body">
      <p>Este documento regula: <strong>${obj.desc}</strong></p>
      <p>Vigência: ${vigText} | Última atualização: ${dateStr}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. ${t === 'politica_priv' ? 'Dados Coletados e Finalidade' : 'Uso da Plataforma'}</div><div class="clausula-body">
      <p>${obj.obrig_a || (t === 'politica_priv' ? 'Coletamos dados necessários para prestação dos serviços, conforme a Lei nº 13.709/2018 (LGPD).' : 'O uso da plataforma implica aceitação integral destes termos.')}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Responsabilidades</div><div class="clausula-body">
      <p>${obj.obrig_b || 'As partes comprometem-se a respeitar a legislação aplicável e as disposições deste documento.'}</p>
      ${obj.entregaveis ? `<p>${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Contato e Atualizações</div><div class="clausula-body">
      <p>Para dúvidas: <strong>${pa.email || 'contato a ser informado'}</strong>. Este documento pode ser atualizado a qualquer momento, com aviso prévio aos usuários.</p>
    </div></div>`}
    ${aviso}`;
  }

  // ════ NOTIFICAÇÃO EXTRAJUDICIAL ════
  if (t === 'notif_extra') {
    return `${cabecalho}
    <div class="doc-subtitle">Notificação Extrajudicial · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação das Partes</div>
      <div class="party"><div class="party-role">NOTIFICANTE:</div><p>${partyLine(pa,'NOTIFICANTE')}</p></div>
      <div class="party"><div class="party-role">NOTIFICADO:</div><p>${partyLine(pb,'NOTIFICADO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Da Notificação</div><div class="clausula-body">
      <p>O(A) NOTIFICANTE, por meio do presente instrumento, notifica formalmente o(a) NOTIFICADO(A) a respeito de: <strong>${obj.desc}</strong></p>
      <p>${obj.obrig_a || 'O NOTIFICADO deverá adotar as providências cabíveis no prazo de <strong>' + (jur.rescisao || '15 dias') + '</strong> a contar do recebimento desta notificação.'}</p>
      ${obj.entregaveis ? `<p>${obj.entregaveis}</p>` : ''}
      <p>O não atendimento desta notificação no prazo estipulado implicará a adoção das medidas legais cabíveis, incluindo as de ordem judicial, com todos os ônus decorrentes ao NOTIFICADO.</p>
      <p>Esta notificação serve como prova do conhecimento formal pelo NOTIFICADO sobre os fatos e exigências aqui descritos.</p>
      ${jur.extra ? `<p>${jur.extra}</p>` : ''}
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">NOTIFICANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">Ciente: ${pb.nome}</div><div class="sig-role">NOTIFICADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO AMIGÁVEL ════
  if (t === 'acordo_amigavel') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento de Acordo Amigável entre Partes · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARTE A:</div><p>${partyLine(pa,'PARTE A')}</p></div>
      <div class="party"><div class="party-role">PARTE B:</div><p>${partyLine(pb,'PARTE B')}</p></div>
    </div>
    <p>As partes, de comum acordo e sem necessidade de intervenção judicial, celebram o presente instrumento de composição amigável:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto do Acordo</div><div class="clausula-body">
      <p>1.1. As partes acordam a resolução amigável relativa a: <strong>${obj.desc}</strong></p>
      <p>1.2. Ficam acordadas as seguintes obrigações: ${obj.obrig_a && obj.obrig_b ? `<br>— PARTE A: ${obj.obrig_a}<br>— PARTE B: ${obj.obrig_b}` : obj.entregaveis || 'conforme negociado entre as partes'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Pagamento</div><div class="clausula-body">
      <p>2.1. Fica acordado o pagamento de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.2. O descumprimento das obrigações acordadas acarretará multa de <strong>${val.multa}</strong> sobre o valor em atraso.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Quitação</div><div class="clausula-body">
      <p>3.1. O cumprimento integral deste acordo implica plena, geral e irrevogável quitação recíproca entre as partes, relativamente ao objeto aqui descrito, nada mais tendo a reclamar uma da outra a qualquer título.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARTE A</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARTE B</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ CONTRATO SOCIAL ════
  if (t === 'contrato_social') {
    return `${cabecalho}
    <div class="doc-subtitle">Contrato Social de Sociedade Limitada · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Sócios</div>
      <div class="party"><div class="party-role">SÓCIO ADMINISTRADOR:</div><p>${partyLine(pa,'SÓCIO ADMINISTRADOR')}</p></div>
      <div class="party"><div class="party-role">SÓCIO:</div><p>${partyLine(pb,'SÓCIO')}</p></div>
    </div>
    <p>Os sócios acima qualificados constituem, por este instrumento, uma Sociedade Limitada, regida pelo Código Civil (arts. 1.052 a 1.087), mediante as seguintes cláusulas:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Da Denominação e Sede</div><div class="clausula-body">
      <p>1.1. A sociedade será denominada <strong>${obj.desc}</strong>, com sede em <strong>${obj.local || 'endereço a ser registrado'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Objeto Social</div><div class="clausula-body">
      <p>2.1. A sociedade tem por objeto: <strong>${obj.obrig_a || obj.entregaveis || 'atividades a serem descritas conforme CNAE'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Do Capital Social</div><div class="clausula-body">
      <p>3.1. O capital social é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), dividido entre os sócios:</p>
      <p>— ${pa.nome}: R$ ____________ (_____%)</p>
      <p>— ${pb.nome}: R$ ____________ (_____%)</p>
      <p>3.2. O capital social está totalmente subscrito e integralizado nesta data.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Administração</div><div class="clausula-body">
      <p>4.1. A sociedade será administrada pelo(a) sócio(a) <strong>${pa.nome}</strong>, que terá poderes para praticar todos os atos de gestão necessários ao funcionamento da empresa.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Distribuição de Lucros</div><div class="clausula-body">
      <p>5.1. Os lucros e resultados serão distribuídos proporcionalmente à participação de cada sócio no capital social, após apuração contábil.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Retirada e Exclusão de Sócios</div><div class="clausula-body">
      <p>6.1. Qualquer sócio poderá retirar-se da sociedade mediante aviso prévio de <strong>${jur.rescisao}</strong>, apurando-se seus haveres na forma da lei.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Regido pelo Código Civil. Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">SÓCIO ADMINISTRADOR</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO ENTRE SÓCIOS ════
  if (t === 'acordo_socios') {
    return `${cabecalho}
    <div class="doc-subtitle">Acordo de Sócios · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Sócios</div>
      <div class="party"><div class="party-role">SÓCIO A:</div><p>${partyLine(pa,'SÓCIO A')}</p></div>
      <div class="party"><div class="party-role">SÓCIO B:</div><p>${partyLine(pb,'SÓCIO B')}</p></div>
    </div>
    <p>Os sócios celebram o presente Acordo para regular direitos e obrigações societárias:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. Este acordo regula: <strong>${obj.desc}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Das Quotas e Participações</div><div class="clausula-body">
      <p>2.1. As quotas sociais são distribuídas: SÓCIO A: _____% | SÓCIO B: _____%.</p>
      <p>2.2. Qualquer transferência de quotas requer aprovação prévia e por escrito do outro sócio.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações dos Sócios</div><div class="clausula-body">
      <p>3.1. SÓCIO A: ${obj.obrig_a || 'responsável pela área de gestão e administração'}.</p>
      <p>3.2. SÓCIO B: ${obj.obrig_b || 'responsável pela área operacional e comercial'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Decisões</div><div class="clausula-body">
      <p>4.1. Decisões estratégicas exigem aprovação de ambos os sócios. Decisões operacionais podem ser tomadas individualmente dentro das respectivas áreas de responsabilidade.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Saída de Sócio</div><div class="clausula-body">
      <p>5.1. Em caso de saída, o sócio retirante deverá oferecer suas quotas primeiramente ao(s) outro(s) sócio(s), pelo valor patrimonial apurado. Prazo de exercício do direito de preferência: ${jur.rescisao}.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">SÓCIO A</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO B</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ TERMO DE INVESTIMENTO ════
  if (t === 'termo_invest') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Investimento · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">INVESTIDOR:</div><p>${partyLine(pa,'INVESTIDOR')}</p></div>
      <div class="party"><div class="party-role">EMPRESA INVESTIDA:</div><p>${partyLine(pb,'EMPRESA')}</p></div>
    </div>
    <p>As partes celebram o presente Termo de Investimento nos seguintes termos:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Investimento</div><div class="clausula-body">
      <p>1.1. O INVESTIDOR aporta na EMPRESA o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), destinado a: <strong>${obj.desc}</strong></p>
      <p>1.2. O aporte será realizado ${val.forma}, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Contrapartida</div><div class="clausula-body">
      <p>2.1. Em contrapartida ao investimento, a EMPRESA oferece: <strong>${obj.obrig_b || 'participação societária / retorno financeiro conforme acordado'}</strong>.</p>
      <p>2.2. A forma de retorno do investimento: ${val.cond || 'conforme negociação entre as partes'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações da Empresa</div><div class="clausula-body">
      <p>3.1. A EMPRESA compromete-se a: (a) utilizar os recursos exclusivamente para as finalidades descritas; (b) prestar contas regularmente ao INVESTIDOR; (c) não alienar ativos estratégicos sem anuência do INVESTIDOR.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Do Prazo</div><div class="clausula-body">
      <p>4.1. Este instrumento vigorará ${vigText}, podendo ser renovado por acordo entre as partes.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">INVESTIDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">EMPRESA INVESTIDA</div><div class="sig-doc">CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ABERTURA DE EMPRESA ════
  if (t === 'abertura_empresa') {
    return `${cabecalho}
    <div class="doc-subtitle">Requerimento de Constituição de Empresa · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Requerente</div>
      <div class="party"><div class="party-role">SÓCIO / TITULAR:</div><p>${partyLine(pa,'REQUERENTE')}</p></div>
      ${pb.nome && pb.nome !== '—' ? `<div class="party"><div class="party-role">SÓCIO 2:</div><p>${partyLine(pb,'SÓCIO 2')}</p></div>` : ''}
    </div>
    <div class="clausula"><div class="clausula-title">1. Dados da Empresa a Constituir</div><div class="clausula-body">
      <p><strong>Nome Empresarial:</strong> ${obj.desc}</p>
      <p><strong>Tipo jurídico:</strong> ${obj.local || 'Sociedade Limitada (LTDA) / MEI / ME'}</p>
      <p><strong>Endereço da sede:</strong> ${pa.end || 'a preencher'}</p>
      <p><strong>Capital social:</strong> R$ ${val.total} (${valorExtenso(val.total)})</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Objeto Social (Atividade)</div><div class="clausula-body">
      <p>${obj.obrig_a || obj.entregaveis || 'Descrição das atividades a serem exercidas — consulte o CNAE correspondente.'}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Administração</div><div class="clausula-body">
      <p>O(A) administrador(a) da empresa será: <strong>${pa.nome}</strong>, responsável pela representação legal e gestão do negócio.</p>
    </div></div>
    <div class="clausula"><div class="clausula-body">
      <p><em>⚠️ Este documento é um modelo de referência para organização das informações. Para constituição legal da empresa, registre o contrato social na Junta Comercial do seu estado ou utilize o Portal do Empreendedor (MEI/ME).</em></p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">REQUERENTE / SÓCIO</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        ${pb.nome && pb.nome !== '—' ? `<div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO 2</div><div class="sig-doc">CPF: ${pb.doc}</div></div>` : '<div class="sig-item"></div>'}
      </div>
    </div>${aviso}`;
  }

  // ════ TEMPLATE GENÉRICO MELHORADO ════
  return `${cabecalho}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa,roleA)}</p></div>
    <div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb,roleB)}</p></div>
  </div>
  <p>As partes acima qualificadas têm entre si justo e acordado o presente instrumento, que se regerá pelas seguintes cláusulas e condições:</p>

  <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
    <p>1.1. O presente instrumento tem por objeto: <strong>${obj.desc}</strong></p>
    ${obj.entregaveis ? `<p>1.2. Escopo: ${obj.entregaveis}</p>` : ''}
    <p>${obj.entregaveis ? '1.3.' : '1.2.'} Prazo: ${vigText}, local: <strong>${obj.local || 'a ser definido'}</strong>.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
    <p>2.1. Compete ao <strong>${roleA}</strong>: ${obj.obrig_a}.</p>
    <p>2.2. Compete ao <strong>${roleB}</strong>: ${obj.obrig_b}.</p>
    <p>2.3. Ambas as partes comprometem-se a agir com boa-fé e transparência.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula III — Do Valor e Pagamento</div><div class="clausula-body">
    <p>3.1. Valor: <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pago <strong>${val.forma}</strong>, vencimento: <strong>${val.venc}</strong>.</p>
    <p>3.2. Pagamento via: <strong>${val.banco || 'a ser informado'}</strong>.</p>
    ${val.reajuste ? `<p>3.3. Reajuste anual: <strong>${val.reajuste}</strong>.</p>` : ''}
    <p>${val.reajuste ? '3.4.' : '3.3.'} Multa por atraso: <strong>${val.multa}</strong> + juros de <strong>${val.juros}</strong>.</p>
    ${val.cond ? `<p>Condições especiais: ${val.cond}.</p>` : ''}
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula IV — Da Vigência e Rescisão</div><div class="clausula-body">
    <p>4.1. Vigência: ${vigText}.</p>
    <p>4.2. Rescisão mediante aviso prévio de <strong>${jur.rescisao}</strong>.</p>
    <p>4.3. Rescisão imotivada: multa de <strong>${jur.multa_resc}</strong>.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula V — Da Responsabilidade</div><div class="clausula-body">
    <p>5.1. As partes respondem pelos danos causados por ação ou omissão culposa ou dolosa, nos termos do art. 186 do Código Civil.</p>
    <p>5.2. Força maior e caso fortuito excluem a responsabilidade, nos termos do art. 393 do Código Civil.</p>
  </div></div>

  ${extraClauses}

  <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
    <p>${finalClauseN}.1. Regido pelo Código Civil (Lei nº 10.406/2002).</p>
    <p>${finalClauseN}.2. Alterações somente por Termo Aditivo escrito.</p>
    ${jur.extra ? `<p>${finalClauseN}.3. ${jur.extra}</p>` : ''}
    <p>Foro: <strong>${jur.foro}</strong>, resolução <strong>${jur.resolucao}</strong>.</p>
  </div></div>

  <div class="signatures-block">
    <div class="signatures-title">${jur.local || 'Local/data da assinatura'}, ${dateStr}</div>
    <div class="sig-grid">
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">${roleA}</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">${roleB}</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
    </div>
    <div class="witnesses-block">
      <div class="witnesses-title">Testemunhas</div>
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
    </div>
  </div>
  ${aviso}`;
}

// ════════════════════════════════════════════════════════════════
//  EDIÇÃO DE DOCUMENTO
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
//  EDIÇÃO INLINE — Estilo Word
// ════════════════════════════════════════════════════════════════

function editCurrentDoc() {
  if (!currentDocId) return;
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  // Monta HTML com campos editáveis inline
  const editableHtml = makeEditableHTML(d.html, d);
  document.getElementById('edit-inline-content').innerHTML = editableHtml;

  // Foca no primeiro campo editável
  const first = document.querySelector('.edit-field');
  if (first) setTimeout(() => first.focus(), 300);

  gotoPage('edit');
}

function makeEditableHTML(html, d) {
  // Abordagem: torna o documento inteiro editável via contenteditable
  // Cada parágrafo e título vira editável diretamente
  let result = html;

  // Marca campos específicos com data-field para salvar de volta nos dados
  const fieldMap = [
    { val: d.pa?.nome,   field: 'pa_nome'   },
    { val: d.pa?.doc,    field: 'pa_doc'    },
    { val: d.pa?.prof,   field: 'pa_prof'   },
    { val: d.pa?.end,    field: 'pa_end'    },
    { val: d.pa?.tel,    field: 'pa_tel'    },
    { val: d.pa?.email,  field: 'pa_email'  },
    { val: d.pb?.nome,   field: 'pb_nome'   },
    { val: d.pb?.doc,    field: 'pb_doc'    },
    { val: d.pb?.prof,   field: 'pb_prof'   },
    { val: d.pb?.end,    field: 'pb_end'    },
    { val: d.pb?.tel,    field: 'pb_tel'    },
    { val: d.pb?.email,  field: 'pb_email'  },
    { val: d.val?.total, field: 'val_total' },
    { val: d.val?.forma, field: 'val_forma' },
    { val: d.val?.venc,  field: 'val_venc'  },
    { val: d.val?.banco, field: 'val_banco' },
    { val: d.val?.multa, field: 'val_multa' },
    { val: d.val?.juros, field: 'val_juros' },
    { val: d.obj?.desc,  field: 'obj_desc'  },
    { val: d.obj?.local, field: 'obj_local' },
    { val: d.obj?.obrig_a, field: 'obj_obrig_a' },
    { val: d.obj?.obrig_b, field: 'obj_obrig_b' },
    { val: d.obj?.entregaveis, field: 'obj_entregaveis' },
    { val: d.jur?.foro,       field: 'jur_foro'   },
    { val: d.jur?.local,      field: 'jur_local'  },
    { val: d.jur?.rescisao,   field: 'jur_rescisao' },
    { val: d.jur?.multa_resc, field: 'jur_multa_resc' },
    { val: d.jur?.extra,      field: 'jur_extra'  },
  ];

  // Substitui cada valor por span editável
  fieldMap.forEach(({ val, field }) => {
    if (!val || val === 'undefined' || val === '—' || val === 'null') return;
    const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(escaped, 'g');
      result = result.replace(regex,
        `<span class="edit-field" contenteditable="true" data-field="${field}" onblur="onFieldEdit(this)" oninput="markDirty()" title="Clique para editar">${val}</span>`
      );
    } catch(e) { /* skip invalid regex */ }
  });

  // Torna cláusulas e parágrafos também editáveis (texto livre)
  // Substitui <p> normais (sem edit-field) por versão editável
  result = result.replace(
    /<p>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/g,
    (match, inner) => {
      if (inner.includes('edit-field') || inner.includes('sig-') || inner.length < 3) return match;
      return `<p class="edit-para" contenteditable="true" oninput="markDirty()" title="Clique para editar o parágrafo">${inner}</p>`;
    }
  );

  return result;
}

function onFieldEdit(el) {
  // Marca documento como modificado
  el.dataset.modified = 'true';
}

function markDirty() {
  // Visual indicator that doc has unsaved changes
  const btn = document.querySelector('#page-edit .btn-sm');
  if (btn && !btn.textContent.includes('*')) btn.textContent = '💾 Salvar*';
}

function saveEdit() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  // Coleta campos com data-field (dados estruturados)
  const fields = document.querySelectorAll('#edit-inline-content .edit-field');
  const updated = {};
  fields.forEach(el => {
    if (el.dataset.field) updated[el.dataset.field] = el.textContent.trim();
  });

  // Atualiza dados estruturados
  if (updated.pa_nome)      d.pa  = { ...d.pa,  nome:      updated.pa_nome      };
  if (updated.pa_doc)       d.pa  = { ...d.pa,  doc:       updated.pa_doc       };
  if (updated.pa_prof)      d.pa  = { ...d.pa,  prof:      updated.pa_prof      };
  if (updated.pa_end)       d.pa  = { ...d.pa,  end:       updated.pa_end       };
  if (updated.pa_tel)       d.pa  = { ...d.pa,  tel:       updated.pa_tel       };
  if (updated.pa_email)     d.pa  = { ...d.pa,  email:     updated.pa_email     };
  if (updated.pb_nome)      d.pb  = { ...d.pb,  nome:      updated.pb_nome      };
  if (updated.pb_doc)       d.pb  = { ...d.pb,  doc:       updated.pb_doc       };
  if (updated.pb_prof)      d.pb  = { ...d.pb,  prof:      updated.pb_prof      };
  if (updated.pb_end)       d.pb  = { ...d.pb,  end:       updated.pb_end       };
  if (updated.pb_tel)       d.pb  = { ...d.pb,  tel:       updated.pb_tel       };
  if (updated.pb_email)     d.pb  = { ...d.pb,  email:     updated.pb_email     };
  if (updated.val_total)    d.val = { ...d.val, total:     updated.val_total    };
  if (updated.val_forma)    d.val = { ...d.val, forma:     updated.val_forma    };
  if (updated.val_venc)     d.val = { ...d.val, venc:      updated.val_venc     };
  if (updated.val_banco)    d.val = { ...d.val, banco:     updated.val_banco    };
  if (updated.val_multa)    d.val = { ...d.val, multa:     updated.val_multa    };
  if (updated.val_juros)    d.val = { ...d.val, juros:     updated.val_juros    };
  if (updated.obj_desc)     d.obj = { ...d.obj, desc:      updated.obj_desc     };
  if (updated.obj_local)    d.obj = { ...d.obj, local:     updated.obj_local    };
  if (updated.obj_obrig_a)  d.obj = { ...d.obj, obrig_a:   updated.obj_obrig_a  };
  if (updated.obj_obrig_b)  d.obj = { ...d.obj, obrig_b:   updated.obj_obrig_b  };
  if (updated.obj_entregaveis) d.obj = { ...d.obj, entregaveis: updated.obj_entregaveis };
  if (updated.jur_foro)     d.jur = { ...d.jur, foro:      updated.jur_foro     };
  if (updated.jur_local)    d.jur = { ...d.jur, local:     updated.jur_local    };
  if (updated.jur_rescisao) d.jur = { ...d.jur, rescisao:  updated.jur_rescisao };
  if (updated.jur_multa_resc) d.jur = { ...d.jur, multa_resc: updated.jur_multa_resc };
  if (updated.jur_extra)    d.jur = { ...d.jur, extra:     updated.jur_extra    };
  d.editedAt = new Date().toISOString();

  // Para docs de IA — salva o HTML editado diretamente (remove spans mas mantém texto)
  if (d.generatedByAI) {
    const tmp = document.createElement('div');
    tmp.innerHTML = document.getElementById('edit-inline-content').innerHTML;
    tmp.querySelectorAll('.edit-field, .edit-para').forEach(el => {
      const text = el.textContent;
      const tag  = el.tagName.toLowerCase() === 'span' ? null : el.tagName.toLowerCase();
      if (tag) {
        const newEl = document.createElement(tag);
        newEl.innerHTML = el.innerHTML.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
        el.replaceWith(newEl);
      } else {
        el.replaceWith(document.createTextNode(text));
      }
    });
    d.html = tmp.innerHTML;
  } else {
    // Para templates — regenera com dados atualizados
    const now     = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
    const roleA   = getRoleA(d.type);
    const roleB   = getRoleB(d.type);
    const vigText = d.obj.vigencia
      ? `por prazo ${d.obj.vigencia === 'indeterminado' ? 'indeterminado' : 'determinado de ' + d.obj.vigencia}`
      : `de ${d.obj.inicio || dateStr} a ${d.obj.fim || 'indeterminado'}`;
    d.html = buildDocHTML({
      num: d.id, docTitle: getDocTitle(d.type), dateStr,
      pa: d.pa, pb: d.pb,
      t1: { nome: null, doc: null },
      t2: { nome: null, doc: null },
      obj: d.obj, val: d.val, jur: d.jur,
      roleA, roleB, vigText,
      extraClauses: '', finalClauseN: 6, typeInfo: d.typeInfo, type: d.type,
    });
  }

  updateDocFS(d).then(() => {
    showNotif('Documento atualizado! ✏️', '✏️');
    viewDocument(d.id);
  });
}

function saveEditAndDownload() {
  saveEdit();
  setTimeout(() => downloadPDF(), 600);
}

function cancelEdit() { gotoPage('document'); viewDocument(currentDocId); }

// ════════════════════════════════════════════════════════════════
//  VISUALIZAR DOCUMENTO
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


// ─── PDF profissional para CURRÍCULO ──────────────────────────
function downloadPDFCurriculo(d) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
  const pa  = d.pa  || {};
  const obj = d.obj || {};
  const lm = 20, rm = 190, W = rm - lm;
  let y = 22;

  // Nome
  pdf.setFont('helvetica','bold');
  pdf.setFontSize(22);
  pdf.setTextColor(26,26,26);
  pdf.text(pa.nome || 'Nome do Candidato', lm, y);
  y += 8;

  // Cargo/área
  if (pa.prof) {
    pdf.setFont('helvetica','normal');
    pdf.setFontSize(11);
    pdf.setTextColor(120,120,120);
    pdf.text(pa.prof, lm, y);
    y += 6;
  }

  // Linha dourada
  pdf.setFillColor(201,169,110);
  pdf.rect(lm, y, W, 0.8, 'F');
  y += 5;

  // Contatos
  const contatos = [pa.tel, pa.email, pa.end].filter(Boolean);
  if (contatos.length) {
    pdf.setFont('helvetica','normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100,100,100);
    pdf.text(contatos.join('   |   '), lm, y);
    y += 6;
  }

  // Linha cinza
  pdf.setDrawColor(220,220,220);
  pdf.line(lm, y, rm, y);
  y += 5;

  function secao(titulo, texto) {
    if (!texto || texto.trim() === '') return;
    pdf.setFont('helvetica','bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(201,169,110);
    pdf.text(titulo.toUpperCase(), lm, y);
    y += 1;
    pdf.setFillColor(201,169,110);
    pdf.rect(lm, y, 25, 0.3, 'F');
    y += 5;
    pdf.setFont('helvetica','normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(50,50,50);
    const linhas = pdf.splitTextToSize(texto, W);
    linhas.forEach(l => {
      if (y > 272) { pdf.addPage(); y = 20; }
      pdf.text(l, lm, y);
      y += 4.5;
    });
    y += 4;
  }

  secao('Objetivo Profissional', obj.obrig_a || '');
  secao('Experiência Profissional', obj.desc  || '');
  secao('Formação e Competências',  obj.entregaveis || '');
  if (obj.local && !obj.local.includes('São Paulo - SP')) {
    secao('LinkedIn / Portfólio', obj.local);
  }

  // Rodapé
  const n = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    pdf.setPage(i);
    pdf.setFillColor(235,235,235);
    pdf.rect(lm, 285, W, 0.3, 'F');
    pdf.setFont('helvetica','italic');
    pdf.setFontSize(7);
    pdf.setTextColor(160);
    pdf.text('Gerado pelo DocFácil', lm, 289);
    pdf.text(`${i} / ${n}`, rm, 289, { align:'right' });
  }

  pdf.save(`Curriculo_${(pa.nome||'').replace(/\s+/g,'_')}.pdf`);
  showNotif('Currículo baixado! 📄', '📄');
}

function downloadPDF() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  // Currículo tem PDF próprio
  if (d.type === 'curriculo') { downloadPDFCurriculo(d); return; }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });

  const tmp = document.createElement('div');
  tmp.innerHTML = d.html;
  const text = tmp.innerText;

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

  // Página final
  addPdfFooter(pdf, d.id);

  // Número em todas as páginas
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('times', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(140);
    pdf.text(`Página ${i} de ${totalPages}`, 105, 290, { align:'center' });
  }

  pdf.save(`${d.typeInfo?.name || 'Documento'} — ${d.id}.pdf`);
  showNotif('PDF baixado com sucesso! 📥', '📥');
}

function addPdfFooter(pdf, num) {
  pdf.setFillColor(26, 26, 26);
  pdf.rect(15, 282, 180, 0.3, 'F');
}

// ════════════════════════════════════════════════════════════════
//  ASSISTENTE IA
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

function renderDocsBadge() {
  document.getElementById('docs-badge').textContent = currentDocs.length;
}

function updateDashboard() {
  const signed  = currentDocs.filter(d => d.status === 'pronto').length;
  const pending = currentDocs.filter(d => d.status === 'pendente').length;
  const drafts  = currentDocs.filter(d => d.status === 'rascunho').length;
  document.getElementById('stat-total').textContent   = currentDocs.length;
  document.getElementById('stat-signed').textContent  = signed;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-drafts').textContent  = drafts;

  const recentEl = document.getElementById('recent-docs');
  if (!currentDocs.length) {
    recentEl.innerHTML = `<div class="empty-state" style="padding:30px 0;"><div style="font-size:28px">📂</div><div style="font-size:13px;color:var(--text3);margin-top:8px;">Nenhum documento ainda</div></div>`;
    return;
  }
  recentEl.innerHTML = currentDocs.slice(0, 5).map(d => `
    <div class="doc-item" onclick="viewDocument('${d.id}')">
      <div class="doc-icon" style="background:var(--accent-dim);">${d.typeInfo?.emoji || '📄'}</div>
      <div class="doc-info">
        <div class="doc-name">${d.typeInfo?.name || d.type}</div>
        <div class="doc-meta">${d.pa?.nome || '—'} · ${new Date(d.createdAt).toLocaleDateString('pt-BR')}</div>
      </div>
      <span class="badge ${d.status}">${d.status}</span>
    </div>`).join('');
}

function renderDocs(filter = '', statusFilter = '') {
  let list = [...currentDocs];
  if (filter) {
    const f = filter.toLowerCase();
    list = list.filter(d =>
      d.title?.toLowerCase().includes(f) ||
      d.typeInfo?.name?.toLowerCase().includes(f) ||
      d.pa?.nome?.toLowerCase().includes(f)
    );
  }
  if (statusFilter) list = list.filter(d => d.status === statusFilter);

  const grid = document.getElementById('docs-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">📂</div><h3>Nenhum documento</h3><p>Crie seu primeiro documento clicando em "+ Novo".</p></div>`;
    return;
  }
  grid.innerHTML = list.map(d => `
    <div class="doc-card" onclick="viewDocument('${d.id}')">
      <div class="doc-card-header">
        <div class="doc-card-icon">${d.typeInfo?.emoji || '📄'}</div>
        <span class="badge ${d.status}">${d.status}</span>
      </div>
      <div>
        <div class="doc-card-title">${d.typeInfo?.name || d.type}</div>
        <div class="doc-card-type">${d.pa?.nome || ''} ${d.pb?.nome && d.pb.nome !== '—' ? '× ' + d.pb.nome : ''}</div>
      </div>
      <div class="doc-card-meta">
        <span>${new Date(d.createdAt).toLocaleDateString('pt-BR')}</span>
        ${d.val?.total ? `<span>R$ ${d.val.total}</span>` : ''}
      </div>
      <div class="doc-card-actions" onclick="event.stopPropagation()">
        <button class="btn-ghost" onclick="viewDocument('${d.id}')">👁 Ver</button>
        <button class="btn-ghost" onclick="editDoc('${d.id}')">✏️ Editar</button>
        <button class="btn-ghost" onclick="downloadDocPDF('${d.id}')">⬇ PDF</button>
        <button class="btn-ghost" onclick="deleteDoc('${d.id}',event)" style="color:var(--red);">🗑</button>
      </div>
    </div>`).join('');
}

function filterDocs(val) {
  const status = document.querySelector('.docs-toolbar select')?.value || '';
  renderDocs(val, status);
}
function filterByStatus(val) {
  const search = document.querySelector('.search-input')?.value || '';
  renderDocs(search, val);
}

function editDoc(id) { viewDocument(id); setTimeout(() => editCurrentDoc(), 100); }

function downloadDocPDF(id) { viewDocument(id); setTimeout(downloadPDF, 300); }

async function deleteDoc(id, e) {
  e?.stopPropagation();
  if (!confirm('Excluir este documento permanentemente?')) return;
  const d = currentDocs.find(d => d.id === id);
  await deleteDocFS(d?.fsId, id);
  renderDocs(); renderDocsBadge(); updateDashboard();
  showNotif('Documento excluído.', '🗑');
}

// ════════════════════════════════════════════════════════════════
//  CONFIGURAÇÕES
// ════════════════════════════════════════════════════════════════

function saveSettings() {
  const name = document.getElementById('set-name').value.trim();
  if (!name) { showNotif('Digite seu nome', '⚠️'); return; }
  waitForFirebase(({ auth, updateProfile }) => {
    updateProfile(auth.currentUser, { displayName: name }).then(() => {
      document.getElementById('sidebar-name').textContent   = name;
      document.getElementById('sidebar-avatar').textContent = name[0].toUpperCase();
      showNotif('Salvo! ✓', '✅');
    });
  });
}

// ════════════════════════════════════════════════════════════════
//  HELPERS GERAIS
// ════════════════════════════════════════════════════════════════

function buildExtraClause(clause, num, pa, pb) {
  const R = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII'];
  const bodies = {
    lgpd:`<p>${num}.1. As partes comprometem-se a tratar dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018), sendo vedado o compartilhamento com terceiros sem autorização expressa do titular.</p><p>${num}.2. Os dados coletados serão utilizados exclusivamente para as finalidades deste instrumento, devendo ser eliminados após o término da relação contratual, salvo obrigação legal.</p>`,
    exclusividade:`<p>${num}.1. Durante a vigência, o <strong>${pb.nome}</strong> compromete-se a não prestar serviços idênticos a concorrentes diretos do <strong>${pa.nome}</strong>, salvo autorização expressa e por escrito.</p><p>${num}.2. A violação sujeitará a parte infratora ao pagamento de multa compensatória, além de perdas e danos apuráveis.</p>`,
    propriedade:`<p>${num}.1. Todos os produtos, obras, criações e resultados intelectuais decorrentes deste instrumento serão de titularidade exclusiva do <strong>${pa.nome}</strong>, nos termos da Lei nº 9.610/1998.</p><p>${num}.2. O <strong>${pb.nome}</strong> cede e transfere irrevogavelmente todos os direitos patrimoniais sobre as criações desenvolvidas.</p>`,
    sigilo:`<p>${num}.1. As partes obrigam-se a manter absoluto sigilo sobre informações confidenciais obtidas em razão deste instrumento, incluindo dados financeiros, estratégias comerciais e informações técnicas.</p><p>${num}.2. A obrigação de sigilo persiste por 5 (cinco) anos após o término deste instrumento.</p>`,
    subcontratacao:`<p>${num}.1. É vedado ao <strong>${pb.nome}</strong> subcontratar, no todo ou em parte, o objeto deste instrumento sem prévia e expressa anuência por escrito do <strong>${pa.nome}</strong>.</p>`,
    reembolso:`<p>${num}.1. Despesas operacionais previamente aprovadas pelo <strong>${pa.nome}</strong> serão reembolsadas mediante comprovantes fiscais, no prazo de 15 (quinze) dias úteis após a apresentação.</p>`,
    garantia:`<p>${num}.1. O <strong>${pb.nome}</strong> garante a qualidade dos serviços/produtos por 90 (noventa) dias, comprometendo-se a corrigir vícios ou defeitos sem custo adicional para o <strong>${pa.nome}</strong>.</p>`,
    forca_maior:`<p>${num}.1. As partes não serão responsabilizadas por descumprimento decorrente de caso fortuito ou força maior, nos termos do art. 393 do Código Civil.</p><p>${num}.2. A parte afetada deve comunicar o evento no prazo de 48 (quarenta e oito) horas, com documentação comprobatória disponível.</p>`,
    antisuborno:`<p>${num}.1. As partes declaram conhecer e estar em conformidade com a Lei Anticorrupção (Lei nº 12.846/2013), comprometendo-se a não praticar atos de corrupção, suborno ou conduta que viole a legislação vigente.</p>`,
    resolucao:`<p>${num}.1. As partes poderão, de comum acordo, resolver antecipadamente este instrumento, mediante notificação escrita com antecedência mínima de 15 (quinze) dias, sem penalidades, desde que obrigações pendentes estejam regularizadas.</p>`,
    penalidade:`<p>${num}.1. O descumprimento de qualquer obrigação sujeitará a parte infratora ao pagamento de multa de 10% (dez por cento) sobre o valor total do contrato, sem prejuízo das perdas e danos apuráveis.</p>`,
    testemunha:`<p>${num}.1. Este instrumento é firmado na presença de 2 (duas) testemunhas instrumentárias, que dão fé da identidade das partes e da validade das assinaturas.</p>`,
  };
  return `<div class="clausula"><div class="clausula-title">Cláusula ${R[num] || num} — ${clause.name}</div><div class="clausula-body">${bodies[clause.id] || `<p>${num}.1. ${clause.desc}.</p>`}</div></div>`;
}

function getDocTitle(type) {
  const t = {
    servico:'Contrato de Prestação de Serviços', trabalho_pj:'Contrato de Trabalho PJ / Autônomo',
    aluguel_res:'Contrato de Locação Residencial', aluguel_com:'Contrato de Locação Comercial',
    compravenda:'Contrato de Compra e Venda', parceria:'Contrato de Parceria Comercial',
    freelancer:'Contrato de Prestação de Serviços Freelancer',
    influenciador:'Contrato de Parceria com Influenciador Digital',
    nda:'Acordo de Confidencialidade e Não-Divulgação (NDA)',
    comissao:'Contrato de Representação Comercial e Comissão',
    locacao_simples:'Contrato de Locação de Imóvel', locacao_fiador:'Contrato de Locação com Fiador',
    recibo_aluguel:'Recibo de Pagamento de Aluguel', vistoria:'Termo de Vistoria de Imóvel',
    notif_desocupacao:'Notificação de Desocupação de Imóvel', acordo_inadimpl:'Acordo de Regularização de Inadimplência',
    curriculo:'Currículo Profissional', carta_apres:'Carta de Apresentação Profissional',
    carta_demissao:'Carta de Pedido de Demissão',
    decl_experiencia:'Declaração de Experiência e Tempo de Serviço',
    estagio:'Termo de Compromisso de Estágio', autonomo:'Acordo de Prestação de Serviços Autônomos',
    decl_residencia:'Declaração de Residência', decl_renda:'Declaração de Renda Mensal',
    decl_informal:'Declaração de Trabalho Informal', decl_comparec:'Declaração de Comparecimento',
    decl_respons:'Declaração de Responsabilidade', decl_uniao:'Declaração de União Estável',
    recibo:'Recibo de Pagamento', quitacao:'Termo de Quitação de Débito',
    confissao_divida:'Confissão de Dívida', parcelamento:'Acordo de Parcelamento de Dívida',
    nota_servico:'Nota Simples de Prestação de Serviço',
    lgpd_termo:'Termo de Consentimento e Tratamento de Dados (LGPD)',
    politica_priv:'Política de Privacidade', termo_uso:'Termos de Uso',
    notif_extra:'Notificação Extrajudicial', acordo_amigavel:'Acordo Amigável entre Partes',
    abertura_empresa:'Requerimento de Abertura de Empresa',
    contrato_social:'Contrato Social', acordo_socios:'Acordo entre Sócios',
    termo_invest:'Termo de Investimento', plano_parceria:'Plano de Parceria Comercial',
  };
  return t[type] || 'Documento Profissional';
}

function getRoleA(type) {
  const r = {
    aluguel_res:'LOCADOR', aluguel_com:'LOCADOR', locacao_simples:'LOCADOR', locacao_fiador:'LOCADOR',
    compravenda:'VENDEDOR', trabalho_pj:'CONTRATANTE', freelancer:'CONTRATANTE',
    influenciador:'CONTRATANTE', nda:'PARTE DIVULGANTE', comissao:'COMITENTE',
    recibo:'PAGANTE', recibo_aluguel:'LOCADOR', quitacao:'CREDOR',
    confissao_divida:'CREDOR', parcelamento:'CREDOR', autonomo:'CONTRATANTE',
    estagio:'EMPRESA CONCEDENTE', acordo_socios:'SÓCIO A', parceria:'PARCEIRO A',
    plano_parceria:'PARTE A', notif_extra:'NOTIFICANTE', acordo_amigavel:'PARTE A',
    termo_invest:'INVESTIDOR', contrato_social:'SÓCIO ADMINISTRADOR',
  };
  return r[type] || 'CONTRATANTE';
}

function getRoleB(type) {
  const r = {
    aluguel_res:'LOCATÁRIO', aluguel_com:'LOCATÁRIO', locacao_simples:'LOCATÁRIO', locacao_fiador:'LOCATÁRIO',
    compravenda:'COMPRADOR', trabalho_pj:'CONTRATADO', freelancer:'FREELANCER',
    influenciador:'INFLUENCIADOR', nda:'PARTE RECEPTORA', comissao:'COMISSIONADO',
    recibo:'BENEFICIÁRIO', recibo_aluguel:'LOCATÁRIO', quitacao:'DEVEDOR',
    confissao_divida:'DEVEDOR', parcelamento:'DEVEDOR', autonomo:'PRESTADOR',
    estagio:'ESTAGIÁRIO', acordo_socios:'SÓCIO B', parceria:'PARCEIRO B',
    plano_parceria:'PARTE B', notif_extra:'NOTIFICADO', acordo_amigavel:'PARTE B',
    termo_invest:'EMPRESA INVESTIDA', contrato_social:'SÓCIO',
  };
  return r[type] || 'CONTRATADO';
}

function valorExtenso(val) {
  if (!val) return 'valor a ser definido';
  const n = parseFloat(val.replace(/\./g,'').replace(',','.'));
  if (isNaN(n) || n === 0) return 'valor a ser definido';

  const unidades  = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const dezenas   = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const centenas  = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];

  function porExtenso(num) {
    if (num === 0)   return '';
    if (num === 100) return 'cem';
    if (num < 20)    return unidades[num];
    if (num < 100) {
      const d = Math.floor(num / 10);
      const u = num % 10;
      return dezenas[d] + (u ? ' e ' + unidades[u] : '');
    }
    const c  = Math.floor(num / 100);
    const resto = num % 100;
    return centenas[c] + (resto ? ' e ' + porExtenso(resto) : '');
  }

  const inteiro = Math.floor(n);
  const centavos = Math.round((n - inteiro) * 100);

  let textoInteiro = '';
  if (inteiro === 0) {
    textoInteiro = 'zero';
  } else if (inteiro < 1000) {
    textoInteiro = porExtenso(inteiro) + (inteiro === 1 ? ' real' : ' reais');
  } else if (inteiro < 1000000) {
    const mil   = Math.floor(inteiro / 1000);
    const resto = inteiro % 1000;
    textoInteiro = (mil === 1 ? 'mil' : porExtenso(mil) + ' mil')
      + (resto ? ' e ' + porExtenso(resto) : '')
      + (inteiro === 1000 ? ' reais' : ' reais');
  } else {
    const mi    = Math.floor(inteiro / 1000000);
    const resto = inteiro % 1000000;
    textoInteiro = porExtenso(mi) + (mi === 1 ? ' milhão' : ' milhões')
      + (resto ? ' e ' + porExtenso(resto) : '')
      + ' de reais';
  }

  if (centavos === 0) return textoInteiro;
  const textoCent = porExtenso(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
  return inteiro === 0 ? textoCent : textoInteiro + ' e ' + textoCent;
}

function formatDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${parseInt(day)} de ${months[parseInt(m)-1]} de ${y}`;
}

function formatCurrency(input) {
  let v = input.value.replace(/\D/g,'');
  v = (parseInt(v || '0') / 100).toFixed(2);
  v = v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = v;
}

function showNotif(msg, icon = '✅') {
  const n = document.getElementById('notif');
  document.getElementById('notif-icon').textContent = icon;
  document.getElementById('notif-text').textContent  = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}
