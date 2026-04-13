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
  // Testemunhas gerenciadas no Step 2 com toggle dedicado
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

  // Fecha todos os modais/overlays ao trocar de página
  ['ia-modal-overlay','ia-loading-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  document.body.style.overflow = '';

  // Oculta wizard-nav quando não está na página de criação
  const wizNav = document.querySelector('.wizard-nav');
  if (wizNav) wizNav.style.display = page === 'create' ? 'flex' : 'none';

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
  // Aplica regras e config do wizard por tipo
  applyWizardRules(id);
  updateStep3Hints(id);
  // Injeta formulário específico se disponível
  injectCustomForms(id);
}

function injectCustomForms(typeId) {
  if (!window.DocFormularios?.temFormEspecifico(typeId)) return;
  // Renderiza step 2 customizado
  window.DocFormularios.renderStep(typeId, 2, 'step-2-custom-content');
  // Renderiza step 3 customizado se existir
  const cfg = window.DocFormularios.getCfg(typeId);
  if (cfg?.step3) {
    window.DocFormularios.renderStep(typeId, 3, 'step-3-custom-content');
  }
}

function updateStep2Title(id) {
  const titulos2 = {
    aluguel_res: 'Locador e Locatário', aluguel_com: 'Locador e Locatário',
    locacao_simples: 'Locador e Locatário', locacao_fiador: 'Locador, Locatário e Fiador',
    compravenda: 'Vendedor e Comprador', parceria: 'Parceiros',
    plano_parceria: 'Parceiros', comissao: 'Comitente e Comissionado',
    nda: 'Partes do Acordo', estagio: 'Empresa e Estagiário',
    contrato_social: 'Sócios', acordo_socios: 'Sócios',
    termo_invest: 'Investidor e Empresa', recibo: 'Recebedor e Pagante',
    recibo_aluguel: 'Locador e Locatário', quitacao: 'Credor e Devedor',
    confissao_divida: 'Credor e Devedor', parcelamento: 'Credor e Devedor',
    notif_extra: 'Notificante e Notificado', acordo_amigavel: 'Partes do Acordo',
    influenciador: 'Marca e Influenciador',
  };
  const sub = document.querySelector('#step-2 .wizard-subtitle');
  if (sub) sub.textContent = 'Informe os dados de: ' + (titulos2[id] || 'ambas as partes');
}

function updateStep3Hints(id) {
  const hints = {
    aluguel_res:  { desc: 'Ex: Apartamento 2 quartos, Rua das Flores 123, Apto 45, Bairro Centro - Cidade/UF, CEP 00000-000', obrigA: 'Ex: Entregar o imóvel limpo e em boas condições, realizar reparos necessários antes da entrega', obrigB: 'Ex: Pagar o aluguel até o dia acordado, conservar o imóvel e devolvê-lo nas mesmas condições' },
    aluguel_com:  { desc: 'Ex: Sala comercial 80m², Av. Brasil 500, Sala 12, Centro Empresarial - Cidade/UF', obrigA: 'Ex: Entregar o imóvel em condições de uso comercial, garantir acesso e funcionamento', obrigB: 'Ex: Pagar o aluguel e taxas condominiais, usar o imóvel apenas para fins comerciais' },
    locacao_simples: { desc: 'Ex: Casa 3 quartos, Rua das Palmeiras 45, Jardim América - Cidade/UF', obrigA: 'Ex: Entregar o imóvel em boas condições e garantir a posse tranquila', obrigB: 'Ex: Pagar o aluguel pontualmente e conservar o imóvel' },
    compravenda:  { desc: 'Ex: Veículo Fiat Uno 2018, placa ABC-1234, cor branca, RENAVAM 00000000000. OU: Lote 15, Quadra 8, Jardim das Flores - Cidade/UF', obrigA: 'Ex: Entregar o bem livre de dívidas, transferir a propriedade e fornecer todos os documentos', obrigB: 'Ex: Efetuar o pagamento conforme acordado e receber o bem nas condições descritas' },
    servico:      { desc: 'Ex: Desenvolvimento de site institucional com até 10 páginas, painel administrativo e integração com redes sociais', obrigA: 'Ex: Efetuar os pagamentos nos prazos acordados e fornecer as informações e materiais necessários', obrigB: 'Ex: Executar os serviços com qualidade e nos prazos acordados, manter o contratante informado do andamento' },
    freelancer:   { desc: 'Ex: Criação de identidade visual completa (logo, paleta de cores, tipografia e manual de marca)', obrigA: 'Ex: Pagar os honorários no prazo, fornecer briefing completo e aprovar ou solicitar revisões em até 5 dias úteis', obrigB: 'Ex: Entregar os arquivos nos formatos acordados, realizar até 3 rodadas de revisão e manter sigilo sobre o projeto' },
    trabalho_pj:  { desc: 'Ex: Prestação de serviços de consultoria em gestão financeira, incluindo análise de balanços e relatórios mensais', obrigA: 'Ex: Efetuar o pagamento da nota fiscal no prazo, fornecer acesso às informações e sistemas necessários', obrigB: 'Ex: Emitir nota fiscal, cumprir os prazos, manter sigilo e pagar seus próprios impostos e contribuições' },
    autonomo:     { desc: 'Ex: Serviços de eletricidade residencial, incluindo instalação de tomadas, interruptores e quadro de distribuição', obrigA: 'Ex: Efetuar o pagamento após conclusão dos serviços e fornecer os materiais necessários', obrigB: 'Ex: Executar os serviços com qualidade, usar EPI adequado e responsabilizar-se pelos materiais em sua posse' },
    parceria:     { desc: 'Ex: Parceria para operação de loja de cosméticos na cidade de Foz do Iguaçu/PR, com divisão de responsabilidades comerciais e operacionais', obrigA: 'Ex: Fornecer o capital inicial, espaço físico e gestão administrativa da parceria', obrigB: 'Ex: Realizar as vendas, atender os clientes e executar as operações diárias do negócio' },
    plano_parceria: { desc: 'Ex: Parceria para desenvolvimento e comercialização de software de gestão para pequenas empresas', obrigA: 'Ex: Desenvolver o produto, fornecer suporte técnico e realizar atualizações', obrigB: 'Ex: Realizar a prospecção de clientes, vendas e relacionamento comercial' },
    influenciador: { desc: 'Ex: Criação e publicação de 4 posts no Instagram e 2 Reels por mês divulgando a marca X, com uso de hashtags e marcação do perfil oficial', obrigA: 'Ex: Fornecer os produtos, briefing criativo e aprovar os conteúdos antes da publicação', obrigB: 'Ex: Criar conteúdo autêntico, publicar nas datas acordadas e informar as métricas mensalmente' },
    nda:          { desc: 'Ex: Informações sobre o projeto de desenvolvimento do aplicativo XYZ, incluindo código-fonte, base de clientes, estratégias de marketing e dados financeiros', obrigA: 'Ex: Compartilhar as informações necessárias para a avaliação do projeto de parceria', obrigB: 'Ex: Manter sigilo absoluto sobre todas as informações recebidas e utilizá-las apenas para avaliação da parceria' },
    comissao:     { desc: 'Ex: Venda de planos de internet corporativa da empresa XYZ Telecom na região sul do Brasil', obrigA: 'Ex: Fornecer materiais de vendas, treinamento e pagar as comissões no prazo', obrigB: 'Ex: Prospectar clientes ativamente, apresentar os produtos com precisão e não representar concorrentes' },
    estagio:      { desc: 'Ex: Estágio no setor de Marketing Digital, com atividades de criação de conteúdo, gestão de redes sociais e análise de métricas', obrigA: 'Ex: Designar supervisor, oferecer atividades compatíveis com a área de formação e conceder recesso remunerado', obrigB: 'Ex: Cumprir o horário, realizar as atividades com dedicação e manter sigilo sobre informações da empresa' },
    recibo:       { desc: 'Ex: Pagamento referente à prestação de serviços de pintura residencial realizados em novembro de 2026', obrigA: '', obrigB: '' },
    recibo_aluguel: { desc: 'Ex: Aluguel referente ao mês de novembro de 2026 do imóvel situado na Rua das Flores, 123 - Apto 45', obrigA: '', obrigB: '' },
    confissao_divida: { desc: 'Ex: Valor referente a empréstimo pessoal concedido em outubro de 2026, acrescido de juros acordados', obrigA: '', obrigB: '' },
    parcelamento: { desc: 'Ex: Saldo devedor de aluguel dos meses de setembro, outubro e novembro de 2026', obrigA: '', obrigB: '' },
    quitacao:     { desc: 'Ex: Pagamento integral do contrato de prestação de serviços firmado em janeiro de 2026', obrigA: '', obrigB: '' },
    contrato_social: { desc: 'Ex: Nome da empresa: XYZ Comércio e Serviços Ltda | Atividade: comércio varejista de artigos de vestuário', obrigA: 'Ex: Integralizar R$ X correspondente a X% do capital social e assumir a função de administrador', obrigB: 'Ex: Integralizar R$ X correspondente a X% do capital social e participar das decisões societárias' },
    acordo_socios: { desc: 'Ex: Regulamentação das relações societárias da empresa XYZ Ltda, CNPJ 00.000.000/0001-00', obrigA: 'Ex: Responder pela gestão administrativa e financeira da empresa', obrigB: 'Ex: Responder pela área comercial e de relacionamento com clientes' },
    termo_invest:  { desc: 'Ex: Desenvolvimento e lançamento de plataforma de e-commerce para o segmento de moda, com previsão de 1.000 clientes em 6 meses', obrigA: 'Ex: Aportar os recursos em 2 parcelas e acompanhar mensalmente os relatórios de desempenho', obrigB: 'Ex: Apresentar relatório mensal de uso dos recursos, metas atingidas e projeções para o período seguinte' },
    vistoria:     { desc: 'Ex: Imóvel residencial - Casa 3 quartos, Rua das Flores 123, Jardim América - Cidade/UF | Incluir: estado de paredes, pisos, janelas, instalações elétricas e hidráulicas', obrigA: '', obrigB: '' },
    notif_desocupacao: { desc: 'Ex: Imóvel situado na Rua das Palmeiras 45, Jardim América - Cidade/UF, CEP 00000-000', obrigA: 'Ex: Aguardar a desocupação no prazo e realizar vistoria final na entrega das chaves', obrigB: '' },
    acordo_inadimpl: { desc: 'Ex: Aluguéis em atraso dos meses de setembro e outubro de 2026 do imóvel na Rua das Flores 123', obrigA: '', obrigB: '' },
    notif_extra:  { desc: 'Ex: Cobrança de valores em atraso no montante de R$ X referentes a serviços prestados e não pagos', obrigA: 'Ex: Aguardar a regularização da situação no prazo estipulado e dar quitação após o cumprimento', obrigB: 'Ex: Regularizar a situação descrita nesta notificação no prazo estabelecido e comunicar o cumprimento' },
    acordo_amigavel: { desc: 'Ex: Resolução amigável de divergência sobre o contrato de prestação de serviços firmado em janeiro de 2026', obrigA: 'Ex: Aceitar as condições acordadas e dar quitação após o cumprimento integral', obrigB: 'Ex: Cumprir as obrigações acordadas no prazo estabelecido e comunicar eventuais dificuldades' },
    lgpd_termo:   { desc: 'Ex: Tratamento de dados pessoais (nome, e-mail, CPF e telefone) para fins de cadastro e prestação de serviços', obrigA: '', obrigB: '' },
    politica_priv: { desc: 'Ex: Política de privacidade do site/aplicativo XYZ, incluindo dados coletados, finalidade e direitos dos usuários', obrigA: '', obrigB: '' },
    termo_uso:    { desc: 'Ex: Termos de uso da plataforma XYZ para acesso e utilização dos serviços de gestão financeira', obrigA: '', obrigB: '' },
    abertura_empresa: { desc: 'Ex: Nome da empresa: XYZ Serviços Ltda | Atividade: consultoria em tecnologia da informação | Capital: R$ 10.000,00', obrigA: '', obrigB: '' },
    curriculo:    { desc: 'N/A — Currículo não usa este campo', obrigA: '', obrigB: '' },
    carta_apres:  { desc: 'Ex: Assunto da carta de apresentação ou vaga/oportunidade de interesse', obrigA: 'Ex: Principais competências e experiências relevantes para a vaga', obrigB: 'Ex: Empresa ou pessoa para quem está se apresentando' },
    carta_demissao: { desc: 'Ex: Pedido de demissão do cargo de Analista de Marketing', obrigA: '', obrigB: '' },
    decl_experiencia: { desc: 'Ex: Cargo/função exercida: Gerente de Vendas | Período: janeiro de 2022 a outubro de 2026', obrigA: 'Ex: Principais atividades realizadas: gestão de equipe, prospecção de clientes, elaboração de relatórios', obrigB: '' },
  };

  const hint = hints[id];
  if (!hint) return;

  const descEl = document.getElementById('obj_desc');
  const obrigAEl = document.getElementById('obj_obrig_a');
  const obrigBEl = document.getElementById('obj_obrig_b');

  if (descEl)   descEl.placeholder   = hint.desc   || 'Descreva detalhadamente o objeto deste documento...';
  if (obrigAEl) obrigAEl.placeholder = hint.obrigA || 'O que a Parte A deve fazer ou fornecer...';
  if (obrigBEl) obrigBEl.placeholder = hint.obrigB || 'O que a Parte B deve executar ou entregar...';
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
  currentStep = 1; selectedType = '';
  // Reset steps ativos para padrão completo
  window._activeSteps = [1,2,3,4,5,6];
  window._docTemParteB = true;
  // Mostra tudo de volta
  const pb = document.getElementById('parte-b-section');
  const ts = document.getElementById('testemunhas-section');
  const pf = document.getElementById('prazo-fields');
  if (pb) pb.style.display = '';
  if (ts) ts.style.display = '';
  if (pf) pf.style.display = '';
  ['obj_obrig_a','obj_obrig_b','obj_entregaveis'].forEach(id => {
    const el = document.getElementById(id)?.closest('.field');
    if (el) el.style.display = '';
  });
  // Reseta barra de progresso
  for (let i = 1; i <= 6; i++) {
    const ws = document.getElementById('ws-' + i);
    const wc = document.getElementById('wc-' + i);
    if (ws) ws.style.display = '';
    if (wc) wc.style.display = i < 6 ? '' : 'none';
  }
  updateWizardUI();
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.checkbox-item').forEach(c => c.classList.remove('checked'));
  document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(c => c.checked = false);
  document.querySelectorAll('.checkbox-item .check-box').forEach(c => c.textContent = '');
  // Reset testemunhas toggle
  testemunhasAtivas = false;
  const tf = document.getElementById('test-fields');
  const tl = document.getElementById('test-toggle-label');
  const tt = document.getElementById('test-toggle');
  if (tf) tf.style.display = 'none';
  if (tl) tl.textContent = 'Não incluir';
  if (tt) tt.classList.remove('active');
  ['test1_nome','test1_doc','test2_nome','test2_doc'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
}

function wizardNext() {
  if (currentStep === 1 && !selectedType) { showNotif('Selecione um tipo de documento', '⚠️'); return; }
  if (currentStep === 2) {
    if (!V('p_a_nome')) { showNotif('Preencha o nome / nome completo', '⚠️'); return; }
    if (window._docTemParteB !== false && !V('p_b_nome')) { showNotif('Preencha o nome da outra parte', '⚠️'); return; }
  }
  if (currentStep === 3) {
    // Para tipos com formulário específico, obj_desc pode ser opcional
    const hasCustom = window.DocFormularios?.temFormEspecifico(selectedType);
    if (!hasCustom && !V('obj_desc')) { showNotif('Preencha a descrição do documento', '⚠️'); return; }
  }
  // Auto-preenche Foro e Local com cidade do step 3
  if (currentStep === 3) {
    const localExec  = V('obj_local');
    const foroEl     = document.getElementById('jur_foro');
    const jurLocalEl = document.getElementById('jur_local');
    if (localExec && foroEl     && !foroEl.value)     foroEl.value     = localExec;
    if (localExec && jurLocalEl && !jurLocalEl.value) jurLocalEl.value = localExec;
  }

  if (currentStep === 1 && selectedType.startsWith('gen_')) { openIAModal(); return; }

  // Avança para próximo step ATIVO
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];
  const curIdx = activeSteps.indexOf(currentStep);
  if (curIdx === activeSteps.length - 1) { generateDocument(); return; }
  currentStep = activeSteps[curIdx + 1];
  updateWizardUI();
}
function wizardBack() {
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];
  const curIdx = activeSteps.indexOf(currentStep);
  if (curIdx > 0) { currentStep = activeSteps[curIdx - 1]; updateWizardUI(); }
}

function updateWizardUI() {
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];
  // Mostra/oculta bodies dos steps
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.style.display = i === currentStep ? '' : 'none';
  }
  // Atualiza barra de progresso — só mostra steps ativos
  for (let i = 1; i <= 6; i++) {
    const ws = document.getElementById('ws-' + i);
    if (!ws) continue;
    const isActive = activeSteps.includes(i);
    ws.style.display = isActive ? '' : 'none';
    ws.classList.remove('active', 'done');
    if (i === currentStep) ws.classList.add('active');
    if (i < currentStep && isActive) ws.classList.add('done');
    const wc = document.getElementById('wc-' + i);
    if (wc) {
      const nextActive = activeSteps.includes(i + 1);
      wc.style.display = (isActive && nextActive) ? '' : 'none';
      wc.classList.toggle('done', i < currentStep);
    }
  }
  document.getElementById('btn-back').style.visibility = currentStep > 1 ? 'visible' : 'hidden';
  // Indicador e botão
  const curIdx = activeSteps.indexOf(currentStep);
  const isLast = curIdx === activeSteps.length - 1;
  const indEl  = document.getElementById('step-indicator');
  if (indEl) indEl.textContent = `Etapa ${curIdx + 1} de ${activeSteps.length}`;
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


// ════════════════════════════════════════════════════════════════
//  WIZARD ADAPTATIVO — labels e campos por tipo de documento
// ════════════════════════════════════════════════════════════════

const WIZARD_CONFIG = {
  // ── Contratos ──
  servico: {
    step2: { title:'Quem contrata e quem executa?', sub:'Informe os dados do contratante e do prestador de serviços' },
    step3: { title:'Qual serviço será prestado?', sub:'Descreva o serviço, prazo e local de execução' },
    step4: { title:'Valor e forma de pagamento', sub:'Defina os valores e condições financeiras do contrato' },
    step6: { title:'Informações finais do contrato', sub:'Foro, rescisão e demais disposições legais' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  trabalho_pj: {
    step2: { title:'Empresa contratante e profissional PJ', sub:'Informe os dados da empresa e do profissional contratado' },
    step3: { title:'Qual serviço o PJ irá prestar?', sub:'Descreva as atividades, carga horária e local' },
    step4: { title:'Honorários e forma de pagamento', sub:'Defina o valor mensal ou por projeto e dados bancários' },
    step6: { title:'Cláusulas finais do contrato PJ', sub:'Foro, rescisão e ausência de vínculo empregatício' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  freelancer: {
    step2: { title:'Contratante e Freelancer', sub:'Dados de quem contrata e quem executa o projeto' },
    step3: { title:'Qual projeto será desenvolvido?', sub:'Descreva o projeto, entregas e cronograma' },
    step4: { title:'Valor do projeto e pagamento', sub:'Honorários, etapas de pagamento e dados bancários' },
    step6: { title:'Cláusulas finais', sub:'Foro competente e condições de rescisão' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  aluguel_res: {
    step2: { title:'Locador (proprietário) e Locatário', sub:'Informe os dados do proprietário e do inquilino' },
    step3: { title:'Imóvel e prazo da locação', sub:'Descreva o imóvel completo com endereço e características' },
    step3labels: { desc:'Descrição completa do imóvel *', local:'Cidade onde o imóvel está localizado' },
    step4: { title:'Valor do aluguel e encargos', sub:'Defina o valor do aluguel, vencimento e dados para pagamento' },
    step4labels: { forma:'Frequência do aluguel', venc:'Dia de vencimento (ex: dia 10)', banco:'Dados para pagamento (Pix, conta bancária)' },
    step6: { title:'Dados finais do contrato', sub:'Foro da comarca onde o imóvel está localizado' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  aluguel_com: {
    step2: { title:'Locador (proprietário) e Locatário', sub:'Informe os dados do proprietário e do locatário comercial' },
    step3: { title:'Imóvel comercial e prazo', sub:'Descreva o imóvel comercial completo com endereço' },
    step4: { title:'Valor do aluguel comercial', sub:'Aluguel, encargos, vencimento e dados de pagamento' },
    step6: { title:'Dados finais do contrato', sub:'Foro da comarca onde o imóvel está localizado' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  locacao_simples: {
    step2: { title:'Locador (proprietário) e Locatário', sub:'Dados do dono do imóvel e de quem vai alugar' },
    step3: { title:'Imóvel e período da locação', sub:'Informe o endereço completo e o período do aluguel' },
    step4: { title:'Valor e condições do aluguel', sub:'Valor mensal, vencimento e como será pago' },
    step6: { title:'Dados finais', sub:'Foro e condições de rescisão do contrato' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  locacao_fiador: {
    step2: { title:'Locador, Locatário e Fiador', sub:'Dados do proprietário, inquilino e do fiador garante' },
    step3: { title:'Imóvel e período da locação', sub:'Endereço completo do imóvel e período acordado' },
    step4: { title:'Valor e condições do aluguel', sub:'Aluguel mensal, vencimento e dados de pagamento' },
    step6: { title:'Dados finais com fiança', sub:'Foro, rescisão e condições da garantia' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  compravenda: {
    step2: { title:'Vendedor e Comprador', sub:'Dados de quem vende e de quem compra o bem' },
    step3: { title:'O que está sendo vendido?', sub:'Descreva o bem: veículo, imóvel, equipamento etc.' },
    step4: { title:'Preço e forma de pagamento', sub:'Valor total, parcelas e dados para pagamento' },
    step6: { title:'Garantias e disposições finais', sub:'Foro, evicção e vícios ocultos' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  parceria: {
    step2: { title:'Parceiro A e Parceiro B', sub:'Dados de ambos os parceiros comerciais' },
    step3: { title:'Objeto da parceria', sub:'Descreva o negócio, as metas e a divisão de responsabilidades' },
    step4: { title:'Remuneração e resultados', sub:'Como os resultados serão divididos ou pagos' },
    step6: { title:'Dados finais da parceria', sub:'Foro, prazo e condições de encerramento' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  plano_parceria: {
    step2: { title:'Parceiro A e Parceiro B', sub:'Dados de ambos os parceiros do plano comercial' },
    step3: { title:'O que a parceria vai fazer?', sub:'Descreva o plano, metas e divisão de tarefas' },
    step4: { title:'Investimento e retorno', sub:'Valores envolvidos e forma de divisão dos resultados' },
    step6: { title:'Dados finais', sub:'Foro e condições de encerramento da parceria' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  influenciador: {
    step2: { title:'Marca/Empresa e Influenciador Digital', sub:'Dados da marca contratante e do influenciador' },
    step3: { title:'Conteúdo a ser criado', sub:'Descreva o tipo de conteúdo, plataformas e entregáveis' },
    step4: { title:'Cachê e pagamento', sub:'Valor do cachê, forma e data de pagamento' },
    step6: { title:'Dados finais do contrato', sub:'Direitos autorais, foro e rescisão' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  nda: {
    step2: { title:'Parte Divulgante e Parte Receptora', sub:'Quem compartilha e quem recebe as informações confidenciais' },
    step3: { title:'Quais informações serão protegidas?', sub:'Descreva as informações confidenciais e o contexto do acordo' },
    step4: { title:'Penalidade por violação', sub:'Valor da multa em caso de quebra de sigilo' },
    step6: { title:'Vigência e foro do NDA', sub:'Prazo de confidencialidade e foro competente' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  comissao: {
    step2: { title:'Comitente (empresa) e Comissionado', sub:'Dados da empresa contratante e do representante comercial' },
    step3: { title:'O que será vendido?', sub:'Produtos/serviços a representar e região de atuação' },
    step4: { title:'Comissão e pagamento', sub:'Percentual ou valor fixo de comissão e prazo de pagamento' },
    step6: { title:'Dados finais do contrato', sub:'Lei 4.886/65, foro e condições de rescisão' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  autonomo: {
    step2: { title:'Contratante e Profissional Autônomo', sub:'Dados de quem contrata e do profissional autônomo' },
    step3: { title:'Qual serviço autônomo será prestado?', sub:'Descreva o serviço, local e prazo de execução' },
    step4: { title:'Valor e pagamento', sub:'Remuneração pelo serviço e forma de pagamento' },
    step6: { title:'Dados finais', sub:'Foro e ausência de vínculo empregatício' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  estagio: {
    step2: { title:'Empresa concedente e Estagiário', sub:'Dados da empresa e do estudante estagiário' },
    step3: { title:'Atividades e carga horária do estágio', sub:'Descreva as atividades e o horário de trabalho' },
    step4: { title:'Bolsa-auxílio e benefícios', sub:'Valor da bolsa e auxílio-transporte' },
    step6: { title:'Dados finais do termo', sub:'Lei 11.788/2008, foro e condições do estágio' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  // ── Imobiliário ──
  recibo_aluguel: {
    step2: { title:'Locador (recebedor) e Locatário (pagante)', sub:'Dados de quem recebe e de quem pagou o aluguel' },
    step3: { title:'Referência do aluguel', sub:'Período de referência e imóvel relacionado ao recibo' },
    step4: { title:'Valor recebido', sub:'Valor do aluguel e encargos pagos nesta competência' },
    step6: { title:'Dados do recibo', sub:'Local de emissão e informações adicionais' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  vistoria: {
    step2: { title:'Proprietário e Locatário/Ocupante', sub:'Dados de quem entrega e quem recebe o imóvel' },
    step3: { title:'Imóvel a ser vistoriado', sub:'Endereço completo e características do imóvel' },
    step4: { title:'Não aplicável', sub:'A vistoria não tem valores financeiros' },
    step6: { title:'Dados finais da vistoria', sub:'Data, local e observações finais' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  notif_desocupacao: {
    step2: { title:'Notificante (proprietário) e Notificado (inquilino)', sub:'Dados de quem notifica e quem deve desocupar' },
    step3: { title:'Imóvel a ser desocupado', sub:'Endereço do imóvel e motivo da notificação' },
    step4: { title:'Não aplicável', sub:'Notificações não têm valores financeiros' },
    step6: { title:'Dados da notificação', sub:'Prazo para desocupação e foro competente' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  acordo_inadimpl: {
    step2: { title:'Locador (credor) e Locatário (devedor)', sub:'Dados do proprietário e do locatário inadimplente' },
    step3: { title:'Débito em aberto', sub:'Descreva os meses em atraso e o total devedor' },
    step4: { title:'Valor do débito e acordo de pagamento', sub:'Total da dívida, parcelas e dados para pagamento' },
    step6: { title:'Dados finais do acordo', sub:'Consequências do descumprimento e foro' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  // ── Financeiro ──
  recibo: {
    step2: { title:'Quem recebe e quem pagou', sub:'Dados do recebedor e do pagante' },
    step3: { title:'Pelo que está sendo pago?', sub:'Descreva o serviço, produto ou motivo do pagamento' },
    step4: { title:'Valor recebido', sub:'Valor pago, forma e data do pagamento' },
    step6: { title:'Local de emissão', sub:'Cidade e data do recibo' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  quitacao: {
    step2: { title:'Credor e Devedor', sub:'Dados de quem deu a quitação e de quem pagou' },
    step3: { title:'O que está sendo quitado?', sub:'Descreva a dívida ou obrigação que está sendo quitada' },
    step4: { title:'Valor quitado', sub:'Valor total pago e forma de pagamento' },
    step6: { title:'Dados do termo', sub:'Local e data da quitação' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  confissao_divida: {
    step2: { title:'Credor e Devedor', sub:'Dados de quem é credor e de quem confessa a dívida' },
    step3: { title:'Qual é a dívida?', sub:'Descreva a origem e natureza do débito confessado' },
    step4: { title:'Valor da dívida e pagamento', sub:'Total devido, juros e forma de quitação' },
    step6: { title:'Dados finais', sub:'Foro e condições de cobrança em caso de inadimplência' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  parcelamento: {
    step2: { title:'Credor e Devedor', sub:'Dados de quem é credor e de quem vai parcelar' },
    step3: { title:'Qual dívida está sendo parcelada?', sub:'Descreva a origem do débito e o total a parcelar' },
    step4: { title:'Valor e condições do parcelamento', sub:'Total, número de parcelas e vencimentos' },
    step6: { title:'Dados finais do parcelamento', sub:'Foro e consequências do não pagamento' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  nota_servico: {
    step2: { title:'Prestador e Tomador do serviço', sub:'Dados de quem prestou e quem recebeu o serviço' },
    step3: { title:'Serviço prestado', sub:'Descreva o serviço executado e a data de realização' },
    step4: { title:'Valor do serviço', sub:'Valor cobrado e forma de pagamento' },
    step6: { title:'Local de emissão', sub:'Cidade e data da nota' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  // ── Trabalho ──
  curriculo: {
    step2: { title:'Dados pessoais do candidato', sub:'Suas informações de contato e identificação' },
    step3: { title:'Objetivo e experiência', sub:'Área de atuação, experiências e formação acadêmica' },
    step4: { title:'Não aplicável', sub:'Currículo não tem valores financeiros' },
    step6: { title:'Não aplicável', sub:'Currículo não tem dados jurídicos' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: true,
  },
  carta_apres: {
    step2: { title:'Remetente e Destinatário', sub:'Seus dados e da empresa/pessoa para quem está se apresentando' },
    step3: { title:'Assunto e conteúdo da carta', sub:'Vaga ou oportunidade e principais pontos da apresentação' },
    step4: { title:'Não aplicável', sub:'Carta de apresentação não tem valores' },
    step6: { title:'Não aplicável', sub:'Carta não tem dados jurídicos' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: true,
  },
  carta_demissao: {
    step2: { title:'Dados do funcionário', sub:'Seus dados e do RH ou chefia para quem está pedindo demissão' },
    step3: { title:'Motivo e data de saída', sub:'Cargo que ocupa e razão da demissão' },
    step4: { title:'Não aplicável', sub:'Carta de demissão não tem valores financeiros' },
    step6: { title:'Aviso prévio e data de saída', sub:'Prazo do aviso prévio e data efetiva de desligamento' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  decl_experiencia: {
    step2: { title:'Empresa declarante e Profissional', sub:'Dados da empresa que declara e do profissional' },
    step3: { title:'Cargo e atividades exercidas', sub:'Função, período trabalhado e principais atividades' },
    step4: { title:'Não aplicável', sub:'Declaração de experiência não tem valores financeiros' },
    step6: { title:'Dados da declaração', sub:'Local de emissão e informações adicionais' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: true,
  },
  // ── Declarações ──
  decl_residencia: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de residência' },
    step3: { title:'Endereço de residência', sub:'Informe o endereço completo que está declarando' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data da declaração', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_renda: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de renda' },
    step3: { title:'Fonte de renda', sub:'Descreva de onde vem sua renda (emprego, negócio, etc.)' },
    step4: { title:'Valor da renda mensal', sub:'Informe o valor aproximado da sua renda mensal' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_informal: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de trabalho informal' },
    step3: { title:'Atividade informal', sub:'Descreva o tipo de trabalho informal que exerce' },
    step4: { title:'Renda aproximada', sub:'Informe a renda mensal aproximada da atividade' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_comparec: {
    step2: { title:'Declarante (empresa/órgão) e quem compareceu', sub:'Dados de quem emite e de quem compareceu' },
    step3: { title:'Motivo e data do comparecimento', sub:'Quando e para que a pessoa compareceu' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data da declaração', sub:'Onde e quando está sendo emitida' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  decl_respons: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de responsabilidade' },
    step3: { title:'Pelo que está se responsabilizando?', sub:'Descreva claramente o que está declarando assumir' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_uniao: {
    step2: { title:'Companheiro(a) 1 e Companheiro(a) 2', sub:'Dados de ambos os conviventes da união estável' },
    step3: { title:'Dados da união', sub:'Data de início da convivência e endereço comum' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  // ── Jurídico ──
  lgpd_termo: {
    step2: { title:'Controlador dos dados e Titular', sub:'Empresa que trata os dados e a pessoa titular' },
    step3: { title:'Quais dados serão tratados?', sub:'Descreva os dados coletados e a finalidade do tratamento' },
    step4: { title:'Não aplicável', sub:'Termo LGPD não tem valores financeiros' },
    step6: { title:'Vigência do consentimento', sub:'Prazo e condições de revogação do consentimento' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  politica_priv: {
    step2: { title:'Responsável pela política', sub:'Dados da empresa responsável pelo tratamento de dados' },
    step3: { title:'Dados coletados e finalidade', sub:'Descreva que dados são coletados e por quê' },
    step4: { title:'Não aplicável', sub:'Política de privacidade não tem valores financeiros' },
    step6: { title:'Vigência da política', sub:'Data de vigência e canal de contato para o DPO' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  termo_uso: {
    step2: { title:'Responsável pela plataforma', sub:'Dados da empresa ou pessoa responsável pela plataforma' },
    step3: { title:'Regras de uso', sub:'Descreva as regras e condições de uso da plataforma' },
    step4: { title:'Não aplicável', sub:'Termos de uso não têm valores financeiros' },
    step6: { title:'Vigência dos termos', sub:'Data de vigência e como o usuário será notificado de alterações' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  notif_extra: {
    step2: { title:'Notificante e Notificado', sub:'Quem notifica e quem receberá a notificação' },
    step3: { title:'Motivo da notificação', sub:'Descreva claramente o que está sendo notificado e o que se exige' },
    step4: { title:'Valor em disputa (se houver)', sub:'Informe o valor envolvido na notificação, se aplicável' },
    step6: { title:'Prazo e foro', sub:'Prazo para cumprimento e foro para ações judiciais' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  acordo_amigavel: {
    step2: { title:'Parte A e Parte B', sub:'Dados das partes que chegaram ao acordo' },
    step3: { title:'O que está sendo acordado?', sub:'Descreva a situação e os termos do acordo amigável' },
    step4: { title:'Valor do acordo', sub:'Quantia envolvida no acordo e forma de pagamento' },
    step6: { title:'Dados finais do acordo', sub:'Foro e consequências do descumprimento' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  // ── Empresarial ──
  abertura_empresa: {
    step2: { title:'Sócio(s) fundador(es)', sub:'Dados dos sócios que vão abrir a empresa' },
    step3: { title:'Dados da empresa a abrir', sub:'Nome, atividade, sede e capital social da empresa' },
    step4: { title:'Capital social', sub:'Valor do capital social e distribuição entre os sócios' },
    step6: { title:'Dados finais', sub:'Local de registro e informações adicionais' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  contrato_social: {
    step2: { title:'Sócios da empresa', sub:'Dados dos sócios que vão constituir a sociedade' },
    step3: { title:'Dados da empresa', sub:'Nome, objeto social, sede e estrutura da empresa' },
    step4: { title:'Capital social e quotas', sub:'Valor total do capital e divisão entre os sócios' },
    step6: { title:'Administração e foro', sub:'Quem administra a empresa e onde serão resolvidas disputas' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: true,
  },
  acordo_socios: {
    step2: { title:'Sócio A e Sócio B', sub:'Dados dos sócios que estão firmando o acordo' },
    step3: { title:'Objeto do acordo societário', sub:'O que está sendo regulamentado entre os sócios' },
    step4: { title:'Valores e quotas', sub:'Capital envolvido e participação de cada sócio' },
    step6: { title:'Dados finais do acordo', sub:'Foro e condições de saída dos sócios' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  termo_invest: {
    step2: { title:'Investidor e Empresa Investida', sub:'Dados de quem aporta o capital e da empresa que recebe' },
    step3: { title:'Projeto a ser financiado', sub:'Descreva o negócio, produto ou projeto que receberá investimento' },
    step4: { title:'Valor do aporte e retorno', sub:'Valor investido, forma de retorno e prazo' },
    step6: { title:'Dados finais do investimento', sub:'Foro e condições de saída do investidor' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
};

// Configuração padrão para tipos não mapeados
const WIZARD_DEFAULT = {
  step2: { title:'Dados das Partes', sub:'Informe os dados de ambas as partes' },
  step3: { title:'Objeto e Prazo', sub:'Descreva detalhadamente o objeto deste documento' },
  step4: { title:'Valores e Pagamento', sub:'Defina as condições financeiras' },
  step6: { title:'Dados Finais', sub:'Informações legais e foro competente' },
  mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
};

function applyWizardConfig(typeId) {
  const cfg = WIZARD_CONFIG[typeId] || WIZARD_DEFAULT;

  // Step 2
  const s2title = document.querySelector('#step-2 .wizard-title');
  const s2sub   = document.querySelector('#step-2 .wizard-subtitle');
  if (s2title) s2title.textContent = cfg.step2.title;
  if (s2sub)   s2sub.textContent   = cfg.step2.sub;

  // Step 3
  const s3title = document.querySelector('#step-3 .wizard-title');
  const s3sub   = document.querySelector('#step-3 .wizard-subtitle');
  if (s3title) s3title.textContent = cfg.step3.title;
  if (s3sub)   s3sub.textContent   = cfg.step3.sub;

  // Step 3 labels personalizados
  if (cfg.step3labels) {
    const descLabel = document.querySelector('label[for="obj_desc"], #step-3 label:first-of-type');
    const localLabel = document.querySelector('label[for="obj_local"]');
    // Usa querySelector por conteúdo não é confiável, então busca por textarea
    const descArea = document.getElementById('obj_desc');
    if (descArea && cfg.step3labels.desc) {
      const lbl = descArea.previousElementSibling;
      if (lbl && lbl.tagName === 'LABEL') lbl.textContent = cfg.step3labels.desc;
    }
  }

  // Step 4
  const s4title = document.querySelector('#step-4 .wizard-title');
  const s4sub   = document.querySelector('#step-4 .wizard-subtitle');
  if (s4title) s4title.textContent = cfg.step4.title;
  if (s4sub)   s4sub.textContent   = cfg.step4.sub;

  // Step 4: oculta campos de valor quando não aplicável
  const valContainer = document.querySelector('#step-4 .form-grid');
  if (valContainer) {
    valContainer.style.opacity = cfg.mostrarValor ? '1' : '0.4';
  }

  // Step 6
  const s6title = document.querySelector('#step-6 .wizard-title');
  const s6sub   = document.querySelector('#step-6 .wizard-subtitle');
  if (s6title) s6title.textContent = cfg.step6.title;
  if (s6sub)   s6sub.textContent   = cfg.step6.sub;

  // Obrigações no step 3 — oculta se não relevante
  const obrigSection = document.getElementById('obj_obrig_a')?.closest('.field')?.parentElement;
  const obrigAField = document.getElementById('obj_obrig_a')?.closest('.field');
  const obrigBField = document.getElementById('obj_obrig_b')?.closest('.field');
  if (obrigAField) obrigAField.style.display = cfg.mostrarObrig ? '' : 'none';
  if (obrigBField) obrigBField.style.display = cfg.mostrarObrig ? '' : 'none';
}


// ════════════════════════════════════════════════════════════════
//  REGRAS DO WIZARD — o que mostrar por tipo de documento
// ════════════════════════════════════════════════════════════════
const DOC_WIZARD_RULES = {
  // tem_parte_b: mostra seção de Parte B
  // tem_valores: mostra etapa de valores
  // tem_clausulas: mostra etapa de cláusulas
  // tem_juridico: mostra etapa jurídica
  // tem_obrigacoes: mostra campos de obrigações no step 3
  // tem_prazo: mostra campos de prazo/vigência no step 3
  // uma_parte: documento de uma só parte (declarações, currículos)

  // Contratos — duas partes, tudo
  servico:        { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  trabalho_pj:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  freelancer:     { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  autonomo:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  aluguel_res:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  aluguel_com:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  locacao_simples:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  locacao_fiador: { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  compravenda:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  parceria:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  plano_parceria: { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  influenciador:  { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  nda:            { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  comissao:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  estagio:        { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  // Imobiliário
  recibo_aluguel: { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  vistoria:       { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  notif_desocupacao:{ tem_parte_b:true,tem_valores:false, tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  acordo_inadimpl:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  // Financeiro
  recibo:         { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  quitacao:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  confissao_divida:{ tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  parcelamento:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  nota_servico:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  // Trabalho — uma parte
  curriculo:      { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  carta_apres:    { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  carta_demissao: { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_experiencia:{ tem_parte_b:true, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:true  },
  // Declarações — uma parte
  decl_residencia:{ tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_renda:     { tem_parte_b:false, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_informal:  { tem_parte_b:false, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_comparec:  { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  decl_respons:   { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_uniao:     { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  // Jurídico
  lgpd_termo:     { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  politica_priv:  { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  termo_uso:      { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  notif_extra:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  acordo_amigavel:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  // Empresarial
  abertura_empresa:{ tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  contrato_social: { tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  acordo_socios:  { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  termo_invest:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
};
const DOC_WIZARD_DEFAULT = { tem_parte_b:true, tem_valores:true, tem_clausulas:true, tem_juridico:true, tem_obrigacoes:true, tem_prazo:true };

// Retorna os steps ativos para o tipo selecionado
function getActiveSteps(typeId) {
  const r = DOC_WIZARD_RULES[typeId] || DOC_WIZARD_DEFAULT;
  const steps = [1, 2]; // Tipo e Partes sempre
  if (r.tem_prazo || r.tem_obrigacoes) steps.push(3); // Objeto
  else steps.push(3); // sempre mostra step 3 (descrição obrigatória)
  if (r.tem_valores) steps.push(4);
  if (r.tem_clausulas) steps.push(5);
  if (r.tem_juridico) steps.push(6);
  return steps;
}

function applyWizardRules(typeId) {
  const r = DOC_WIZARD_RULES[typeId] || DOC_WIZARD_DEFAULT;
  const cfg = WIZARD_CONFIG[typeId] || WIZARD_DEFAULT;
  const hasCustomForm = window.DocFormularios?.temFormEspecifico(typeId);
  const customCfg = window.DocFormularios?.getCfg(typeId);

  // ── Formulário específico vs padrão ──
  const s2custom  = document.getElementById('step-2-custom-content');
  const s2default = document.getElementById('step-2-default-content');
  const s3custom  = document.getElementById('step-3-custom-content');
  const s3default = document.getElementById('step-3-default-content');

  if (hasCustomForm) {
    if (s2custom)  s2custom.style.display  = '';
    if (s2default) s2default.style.display = 'none';
    if (customCfg?.step3) {
      if (s3custom)  s3custom.style.display  = '';
      if (s3default) s3default.style.display = 'none';
    } else {
      if (s3custom)  s3custom.style.display  = 'none';
      if (s3default) s3default.style.display = '';
    }
  } else {
    if (s2custom)  s2custom.style.display  = 'none';
    if (s2default) s2default.style.display = '';
    if (s3custom)  s3custom.style.display  = 'none';
    if (s3default) s3default.style.display = '';
  }

  // ── Parte B ──
  const parteBSection = document.getElementById('parte-b-section');
  const testemunhasSection = document.getElementById('testemunhas-section');
  if (parteBSection) parteBSection.style.display = r.tem_parte_b ? '' : 'none';
  if (testemunhasSection) testemunhasSection.style.display = r.tem_parte_b ? '' : 'none';

  // Validação step 2: se não tem parte B, não exige p_b_nome
  window._docTemParteB = r.tem_parte_b;

  // ── Step 3: campos condicionais ──
  const obrigAField = document.getElementById('obj_obrig_a')?.closest('.field');
  const obrigBField = document.getElementById('obj_obrig_b')?.closest('.field');
  const entregField = document.getElementById('obj_entregaveis')?.closest('.field');
  const prazoFields = document.getElementById('prazo-fields');
  if (obrigAField) obrigAField.style.display = r.tem_obrigacoes ? '' : 'none';
  if (obrigBField) obrigBField.style.display = (r.tem_obrigacoes && r.tem_parte_b) ? '' : 'none';
  if (entregField) entregField.style.display = r.tem_obrigacoes ? '' : 'none';
  if (prazoFields) prazoFields.style.display = r.tem_prazo ? '' : 'none';

  // ── Steps na barra de progresso ──
  const activeSteps = getActiveSteps(typeId);
  const totalSteps = activeSteps.length;
  window._activeSteps = activeSteps;
  window._totalSteps = totalSteps;

  // Atualiza indicador de steps
  updateStepIndicator();

  // ── Aplica títulos e subtítulos ──
  const s2title = document.querySelector('#step-2 .wizard-title');
  const s2sub   = document.querySelector('#step-2 .wizard-subtitle');
  const s3title = document.querySelector('#step-3 .wizard-title');
  const s3sub   = document.querySelector('#step-3 .wizard-subtitle');
  const s4title = document.querySelector('#step-4 .wizard-title');
  const s4sub   = document.querySelector('#step-4 .wizard-subtitle');
  const s6title = document.querySelector('#step-6 .wizard-title');
  const s6sub   = document.querySelector('#step-6 .wizard-subtitle');

  if (s2title) s2title.textContent = cfg.step2?.title || 'Dados das Partes';
  if (s2sub)   s2sub.textContent   = cfg.step2?.sub   || 'Informe os dados das partes';
  if (s3title) s3title.textContent = cfg.step3?.title || 'Objeto e Prazo';
  if (s3sub)   s3sub.textContent   = cfg.step3?.sub   || 'Descreva o objeto';
  if (s4title) s4title.textContent = cfg.step4?.title || 'Valores e Pagamento';
  if (s4sub)   s4sub.textContent   = cfg.step4?.sub   || 'Defina as condições financeiras';
  if (s6title) s6title.textContent = cfg.step6?.title || 'Dados Finais';
  if (s6sub)   s6sub.textContent   = cfg.step6?.sub   || 'Informações legais e foro';

  // ── Label Parte A ──
  const roleALabel = document.getElementById('role-a-label');
  if (roleALabel) roleALabel.textContent = getRoleA(typeId);
  const roleBLabel = document.getElementById('role-b-label');
  if (roleBLabel) roleBLabel.textContent = getRoleB(typeId);

  // ── Atualiza barra de progresso visual ──
  updateWizardProgressBar(activeSteps);
}

function updateWizardProgressBar(activeSteps) {
  // Mostra/oculta steps e conectores na barra
  for (let i = 1; i <= 6; i++) {
    const step = document.getElementById('ws-' + i);
    const conn = document.getElementById('wc-' + i);
    if (step) step.style.display = activeSteps.includes(i) ? '' : 'none';
    if (conn) conn.style.display = activeSteps.includes(i) && activeSteps.includes(i+1) ? '' : 'none';
  }
}

function updateStepIndicator() {
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];
  const pos = activeSteps.indexOf(currentStep) + 1;
  const el = document.getElementById('step-indicator');
  if (el) el.textContent = `Etapa ${pos} de ${activeSteps.length}`;
}

function getAllTypes() { return Object.values(DOC_TYPES).flat(); }

function generateDocument() {
  const allT    = getAllTypes();
  const typeInfo = allT.find(t => t.id === selectedType) || { name:'Documento', emoji:'📄' };
  const now     = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const num     = `CTR-${now.getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

  const pa = buildParty('p_a');
  const pb = window._docTemParteB !== false ? buildParty('p_b') : { nome:'', doc:'', nac:'', est:'', prof:'', end:'', tel:'', email:'', rg:'' };
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
    foro:       V('jur_foro')       || 'Comarca do domicílio das partes',
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
  const vigText = obj.vigencia && obj.vigencia !== ''
    ? `por prazo ${obj.vigencia === 'indeterminado' ? 'indeterminado' : 'determinado de ' + obj.vigencia}`
    : obj.fim && obj.fim !== 'indeterminado'
      ? `de ${obj.inicio} a ${obj.fim}`
      : `a partir de ${obj.inicio}`;

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

// ════════════════════════════════════════════════════════════════
//  buildDocHTML — Delega para o módulo correto via DocDispatcher
//  Os templates ficam em js/documentos/ (um arquivo por categoria)
// ════════════════════════════════════════════════════════════════
function buildDocHTML(params) {
  // Se o dispatcher estiver disponível, usa ele
  if (window.DocDispatcher) {
    return window.DocDispatcher.build(params);
  }
  // Fallback (não deve ocorrer em produção)
  console.warn('DocDispatcher não carregado — usando fallback');
  return `<p>Erro: módulos de documento não carregados.</p>`;
}


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


// ════════════════════════════════════════════════════════════════
//  PDF PROFISSIONAL — CURRÍCULO
// ════════════════════════════════════════════════════════════════
function downloadPDFCurriculo(d) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });

  const pa  = d.pa || {};
  const obj = d.obj || {};
  const lm = 20, rm = 190, W = rm - lm;
  let y = 20;

  // ── Nome ──
  pdf.setFont('helvetica','bold');
  pdf.setFontSize(20);
  pdf.setTextColor(30,30,30);
  pdf.text(pa.nome || 'Nome do Candidato', lm, y);
  y += 7;

  // ── Cargo / área ──
  pdf.setFont('helvetica','normal');
  pdf.setFontSize(11);
  pdf.setTextColor(100,100,100);
  pdf.text(pa.prof || '', lm, y);
  y += 5;

  // ── Linha separadora ──
  pdf.setFillColor(201,169,110);
  pdf.rect(lm, y, W, 0.7, 'F');
  y += 4;

  // ── Contatos ──
  pdf.setFontSize(9);
  pdf.setTextColor(80,80,80);
  const contatos = [pa.tel, pa.email, pa.end].filter(Boolean);
  if (contatos.length) {
    pdf.text(contatos.join('   |   '), lm, y);
    y += 5;
  }

  // ── Linha ──
  pdf.setDrawColor(220,220,220);
  pdf.line(lm, y, rm, y);
  y += 6;

  function secao(titulo, texto) {
    if (!texto || texto === 'N/A — Currículo não usa este campo') return;
    // Título da seção
    pdf.setFont('helvetica','bold');
    pdf.setFontSize(10);
    pdf.setTextColor(30,30,30);
    pdf.text(titulo.toUpperCase(), lm, y);
    y += 1;
    pdf.setFillColor(201,169,110);
    pdf.rect(lm, y, 30, 0.4, 'F');
    y += 5;

    // Texto da seção
    pdf.setFont('helvetica','normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(50,50,50);
    const linhas = pdf.splitTextToSize(texto, W);
    for (const l of linhas) {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.text(l, lm, y);
      y += 4.5;
    }
    y += 3;
  }

  secao('Objetivo Profissional', obj.obrig_a);
  secao('Experiência Profissional', obj.desc);
  secao('Formação e Habilidades', obj.entregaveis);

  // LinkedIn
  if (obj.local && obj.local !== 'Ex: São Paulo - SP ou Remoto') {
    pdf.setFont('helvetica','italic');
    pdf.setFontSize(9);
    pdf.setTextColor(100,100,100);
    pdf.text('LinkedIn / Portfólio: ' + obj.local, lm, y);
    y += 5;
  }

  // Rodapé
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(220,220,220);
    pdf.rect(lm, 285, W, 0.3, 'F');
    pdf.setFont('helvetica','italic');
    pdf.setFontSize(7);
    pdf.setTextColor(160);
    pdf.text('Gerado pelo DocFácil · docfacil-ia.vercel.app', lm, 289);
    pdf.text(`${i} / ${totalPages}`, rm, 289, { align:'right' });
  }

  pdf.save(`Curriculo_${(pa.nome||'').replace(/\s+/g,'_')}.pdf`);
  showNotif('Currículo baixado com sucesso! 📄', '📄');
}

function downloadPDF() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  // Currículo tem PDF próprio profissional
  if (d.type === 'curriculo') { downloadPDFCurriculo(d); return; }

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
