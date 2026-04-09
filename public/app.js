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
function toggleLandNav() {
  const nav = document.getElementById('land-mobile-nav');
  nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
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
  updateWizardUI();
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.checkbox-item').forEach(c => c.classList.remove('checked'));
  document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(c => c.checked = false);
  document.querySelectorAll('.checkbox-item .check-box').forEach(c => c.textContent = '');
}

function wizardNext() {
  if (currentStep === 1 && !selectedType) { showNotif('Selecione um tipo de documento', '⚠️'); return; }
  if (currentStep === 2 && (!V('p_a_nome') || !V('p_b_nome'))) { showNotif('Preencha os nomes das partes', '⚠️'); return; }
  if (currentStep === 3 && !V('obj_desc')) { showNotif('Descreva o objeto do contrato', '⚠️'); return; }

  if (currentStep === 1 && selectedType.startsWith('gen_')) { generateWithAI(); return; }
  if (currentStep === TOTAL_STEPS) { generateDocument(); return; }

  currentStep++;
  updateWizardUI();
}
function wizardBack() { if (currentStep > 1) { currentStep--; updateWizardUI(); } }

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
  document.getElementById('step-indicator').textContent = `Etapa ${currentStep} de ${TOTAL_STEPS}`;
  const btn = document.getElementById('btn-next');
  btn.innerHTML = currentStep === TOTAL_STEPS ? '✨ Gerar Documento' : 'Próximo →';
  btn.style.background = currentStep === TOTAL_STEPS ? 'var(--green)' : 'var(--accent)';
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
  const pb = buildParty('p_b');
  const t1 = { nome: V('test1_nome') || '___________________________', doc: V('test1_doc') || '___________________' };
  const t2 = { nome: V('test2_nome') || '___________________________', doc: V('test2_doc') || '___________________' };

  const obj = {
    desc:        V('obj_desc')        || 'objeto conforme acordado entre as partes',
    inicio:      V('obj_inicio')      ? formatDate(V('obj_inicio')) : dateStr,
    fim:         V('obj_fim')         ? formatDate(V('obj_fim'))    : 'indeterminado',
    vigencia:    V('obj_vigencia')    || '',
    local:       V('obj_local')       || 'conforme acordado',
    obrig_a:     V('obj_obrig_a')     || 'efetuar o pagamento nos prazos estabelecidos',
    obrig_b:     V('obj_obrig_b')     || 'executar o objeto com boa técnica e nos prazos acordados',
    entregaveis: V('obj_entregaveis') || '',
  };
  const val = {
    total:    V('val_total')    || '0,00',
    forma:    V('val_forma')    || 'à vista',
    venc:     V('val_venc')     || 'na data acordada',
    banco:    V('val_banco')    || 'conforme dados a serem fornecidos',
    reajuste: V('val_reajuste') || '',
    multa:    V('val_multa')    || '2%',
    juros:    V('val_juros')    || '1% ao mês',
    cond:     V('val_cond')     || '',
  };
  const jur = {
    foro:       V('jur_foro')       || 'da Comarca da Capital do Estado',
    rescisao:   V('jur_rescisao')   || '30 dias',
    multa_resc: V('jur_multa_resc') || '10% sobre o valor total do contrato',
    resolucao:  V('jur_resolucao')  || 'pelo Poder Judiciário',
    local:      V('jur_local')      || 'local e data da assinatura',
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

  const html = buildDocHTML({ num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN: clausN + 1, typeInfo });

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
    doc:   V(`${prefix}_doc`)  || '000.000.000-00',
    rg:    V(`${prefix}_rg`)   || '',
    nac:   V(`${prefix}_nac`)  || 'Brasileiro(a)',
    est:   V(`${prefix}_est`)  || 'solteiro(a)',
    prof:  V(`${prefix}_prof`) || '',
    end:   V(`${prefix}_end`)  || 'não informado',
    tel:   V(`${prefix}_tel`)  || '',
    email: V(`${prefix}_email`)|| '',
  };
}

function buildDocHTML({ num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN, typeInfo }) {
  const roman = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];

  const partyLine = (p, role) => {
    let line = `<strong>${p.nome}</strong>, ${p.nac}, ${p.est}`;
    if (p.prof) line += `, ${p.prof}`;
    line += `, portador(a) do CPF/CNPJ nº <strong>${p.doc}</strong>`;
    if (p.rg) line += `, RG nº ${p.rg}`;
    line += `, residente/domiciliado(a) em ${p.end}`;
    if (p.tel) line += `, tel.: ${p.tel}`;
    if (p.email) line += `, e-mail: ${p.email}`;
    return line + '.';
  };

  return `
  <div class="doc-masthead">
    <div class="masthead-logo">DocFácil IA · Documento Profissional</div>
    <div class="masthead-num">Nº ${num}</div>
  </div>

  <div class="doc-main-title">${docTitle}</div>
  <div class="doc-subtitle">Instrumento Particular com Força de Documento Jurídico · ${dateStr}</div>

  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party">
      <div class="party-role">${roleA}:</div>
      <p>${partyLine(pa, roleA)}</p>
    </div>
    <div class="party">
      <div class="party-role">${roleB}:</div>
      <p>${partyLine(pb, roleB)}</p>
    </div>
  </div>

  <p>As partes acima qualificadas, doravante denominadas simplesmente <strong>${roleA}</strong> e <strong>${roleB}</strong>, têm entre si, justo e contratado, o presente instrumento, que se regerá pelas seguintes cláusulas e condições:</p>

  <div class="clausula">
    <div class="clausula-title">Cláusula I — Do Objeto</div>
    <div class="clausula-body">
      <p>1.1. O presente instrumento tem por objeto: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Entregáveis e escopo: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} O objeto será realizado ${vigText}, no local: <strong>${obj.local}</strong>.</p>
    </div>
  </div>

  <div class="clausula">
    <div class="clausula-title">Cláusula II — Das Obrigações das Partes</div>
    <div class="clausula-body">
      <p>2.1. Compete ao <strong>${roleA}</strong>: ${obj.obrig_a}.</p>
      <p>2.2. Compete ao <strong>${roleB}</strong>: ${obj.obrig_b}.</p>
      <p>2.3. Ambas as partes se comprometem a agir com boa-fé, lealdade e transparência, comunicando imediatamente qualquer fato superveniente que possa afetar a execução deste instrumento.</p>
    </div>
  </div>

  <div class="clausula">
    <div class="clausula-title">Cláusula III — Do Valor e Condições de Pagamento</div>
    <div class="clausula-body">
      <p>3.1. O valor total é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pago <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>.</p>
      <p>3.2. O pagamento será efetuado mediante: <strong>${val.banco}</strong>.</p>
      ${val.reajuste ? `<p>3.3. O valor será reajustado anualmente pelo índice <strong>${val.reajuste}</strong>.</p>` : ''}
      <p>${val.reajuste ? '3.4.' : '3.3.'} O atraso no pagamento acarretará multa moratória de <strong>${val.multa}</strong> sobre o montante em atraso, acrescida de juros de <strong>${val.juros}</strong>, calculados pro rata die, nos termos do art. 395 do Código Civil.</p>
      ${val.cond ? `<p>Condições especiais: ${val.cond}.</p>` : ''}
    </div>
  </div>

  <div class="clausula">
    <div class="clausula-title">Cláusula IV — Da Vigência e Rescisão</div>
    <div class="clausula-body">
      <p>4.1. Este instrumento vigorará ${vigText}, podendo ser renovado mediante aditivo assinado por ambas as partes.</p>
      <p>4.2. Qualquer das partes poderá rescindir este instrumento mediante notificação escrita com antecedência mínima de <strong>${jur.rescisao}</strong>.</p>
      <p>4.3. A rescisão imotivada implicará o pagamento de multa rescisória de <strong>${jur.multa_resc}</strong> em favor da parte inocente, sem prejuízo de perdas e danos eventualmente apurados.</p>
      <p>4.4. O presente instrumento poderá ser rescindido de pleno direito, sem necessidade de interpelação judicial, em caso de: (a) descumprimento de qualquer cláusula; (b) falência ou insolvência de qualquer das partes; (c) cessação das atividades.</p>
    </div>
  </div>

  <div class="clausula">
    <div class="clausula-title">Cláusula V — Da Responsabilidade Civil</div>
    <div class="clausula-body">
      <p>5.1. As partes respondem pelos danos diretos causados à outra parte em decorrência de ação ou omissão culposa ou dolosa, nos termos do art. 186 e seguintes do Código Civil.</p>
      <p>5.2. Não serão imputados como inadimplemento os atrasos ou descumprimentos resultantes de caso fortuito ou força maior, conforme art. 393 do Código Civil, desde que comunicados formalmente no prazo de 48 (quarenta e oito) horas após o evento.</p>
    </div>
  </div>

  ${extraClauses}

  <div class="clausula">
    <div class="clausula-title">Cláusula ${roman[finalClauseN] || finalClauseN} — Das Disposições Gerais e Foro</div>
    <div class="clausula-body">
      <p>${finalClauseN}.1. O presente instrumento é regido pela legislação brasileira vigente, em especial o Código Civil (Lei nº 10.406/2002) e demais normas aplicáveis.</p>
      <p>${finalClauseN}.2. As partes declaram ter lido, compreendido e concordado integralmente com todas as cláusulas, podendo ter sido assessoradas juridicamente, ou renunciado expressamente a tal assessoria.</p>
      <p>${finalClauseN}.3. Qualquer alteração a este instrumento somente produzirá efeitos se formalizada em Termo Aditivo por escrito, assinado por ambas as partes.</p>
      <p>${finalClauseN}.4. A tolerância de qualquer das partes em relação a eventuais descumprimentos não implicará novação, renúncia, modificação ou revogação de qualquer disposição deste instrumento.</p>
      ${jur.extra ? `<p>${finalClauseN}.5. Disposições adicionais: ${jur.extra}.</p>` : ''}
      <p>Fica eleito o foro <strong>${jur.foro}</strong>, com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer dúvidas ou litígios oriundos deste instrumento, sendo a resolução de conflitos realizada <strong>${jur.resolucao}</strong>.</p>
      <p>E, por estarem assim, justos e contratados, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma.</p>
    </div>
  </div>

  <div class="signatures-block">
    <div class="signatures-title">${jur.local || 'Local'}, ${dateStr}</div>
    <div class="sig-grid">
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">${pa.nome}</div>
        <div class="sig-role">${roleA}</div>
        <div class="sig-doc">CPF/CNPJ: ${pa.doc}</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">${pb.nome}</div>
        <div class="sig-role">${roleB}</div>
        <div class="sig-doc">CPF/CNPJ: ${pb.doc}</div>
      </div>
    </div>
    <div class="witnesses-block">
      <div class="witnesses-title">Testemunhas</div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">${t1.nome}</div>
        <div class="sig-doc">CPF: ${t1.doc}</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">${t2.nome}</div>
        <div class="sig-doc">CPF: ${t2.doc}</div>
      </div>
    </div>
  </div>`;
}

// ════════════════════════════════════════════════════════════════
//  EDIÇÃO DE DOCUMENTO
// ════════════════════════════════════════════════════════════════

function editCurrentDoc() {
  if (!currentDocId) return;
  const docData = currentDocs.find(d => d.id === currentDocId);
  if (!docData) return;

  // Preenche os campos de edição
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('edit_pa_nome',  docData.pa?.nome);
  set('edit_pa_doc',   docData.pa?.doc);
  set('edit_pa_prof',  docData.pa?.prof);
  set('edit_pa_end',   docData.pa?.end);
  set('edit_pa_tel',   docData.pa?.tel);
  set('edit_pa_email', docData.pa?.email);
  set('edit_pb_nome',  docData.pb?.nome);
  set('edit_pb_doc',   docData.pb?.doc);
  set('edit_pb_prof',  docData.pb?.prof);
  set('edit_pb_end',   docData.pb?.end);
  set('edit_pb_tel',   docData.pb?.tel);
  set('edit_pb_email', docData.pb?.email);
  set('edit_obj_desc', docData.obj?.desc);
  set('edit_val_total',docData.val?.total);
  set('edit_val_forma',docData.val?.forma);
  set('edit_val_venc', docData.val?.venc);
  set('edit_val_banco',docData.val?.banco);
  set('edit_jur_foro', docData.jur?.foro);
  set('edit_jur_local',docData.jur?.local);
  set('edit_jur_extra',docData.jur?.extra);

  // Pré-visualização inicial
  document.getElementById('edit-preview-content').innerHTML = docData.html;

  // Live preview
  document.querySelectorAll('#page-edit input, #page-edit textarea').forEach(input => {
    input.addEventListener('input', updateEditPreview);
  });

  gotoPage('edit');
}

function updateEditPreview() {
  // Atualiza preview em tempo real baseado nos campos
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  const preview = document.getElementById('edit-preview-content');
  let html = d.html;

  const G = id => document.getElementById(id)?.value || '';

  // Substituições simples no HTML para preview
  const replacements = [
    [d.pa?.nome, G('edit_pa_nome')],
    [d.pb?.nome, G('edit_pb_nome')],
    [d.pa?.doc,  G('edit_pa_doc')],
    [d.pb?.doc,  G('edit_pb_doc')],
    [d.pa?.end,  G('edit_pa_end')],
    [d.pb?.end,  G('edit_pb_end')],
    [d.val?.total, G('edit_val_total')],
    [d.val?.banco, G('edit_val_banco')],
    [d.obj?.desc,  G('edit_obj_desc')],
  ];

  replacements.forEach(([old, novo]) => {
    if (old && novo && old !== novo) {
      html = html.split(old).join(novo);
    }
  });

  preview.innerHTML = html;
}

function saveEdit() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  const G = id => document.getElementById(id)?.value || '';

  // Atualiza os dados
  d.pa = { ...d.pa, nome: G('edit_pa_nome'), doc: G('edit_pa_doc'), prof: G('edit_pa_prof'), end: G('edit_pa_end'), tel: G('edit_pa_tel'), email: G('edit_pa_email') };
  d.pb = { ...d.pb, nome: G('edit_pb_nome'), doc: G('edit_pb_doc'), prof: G('edit_pb_prof'), end: G('edit_pb_end'), tel: G('edit_pb_tel'), email: G('edit_pb_email') };
  d.obj = { ...d.obj, desc: G('edit_obj_desc') };
  d.val = { ...d.val, total: G('edit_val_total'), forma: G('edit_val_forma'), venc: G('edit_val_venc'), banco: G('edit_val_banco') };
  d.jur = { ...d.jur, foro: G('edit_jur_foro'), local: G('edit_jur_local'), extra: G('edit_jur_extra') };
  d.editedAt = new Date().toISOString();

  // Regenera o HTML do documento
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const roleA = getRoleA(d.type);
  const roleB = getRoleB(d.type);
  const vigText = d.obj.vigencia
    ? `por prazo ${d.obj.vigencia === 'indeterminado' ? 'indeterminado' : 'determinado de ' + d.obj.vigencia}`
    : `de ${d.obj.inicio || dateStr} a ${d.obj.fim || 'indeterminado'}`;

  d.html = buildDocHTML({
    num: d.id, docTitle: getDocTitle(d.type), dateStr,
    pa: d.pa, pb: d.pb,
    t1: { nome:'___________________________', doc:'___________________' },
    t2: { nome:'___________________________', doc:'___________________' },
    obj: d.obj, val: d.val, jur: d.jur,
    roleA, roleB, vigText,
    extraClauses: '', finalClauseN: 6, typeInfo: d.typeInfo,
  });

  updateDocFS(d).then(() => {
    showNotif('Documento atualizado com sucesso! ✏️', '✏️');
    viewDocument(d.id);
  });
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

function downloadPDF() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

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

const IA_SYSTEM = `Você é o assistente jurídico do DocFácil IA, plataforma brasileira de geração de documentos profissionais.
Ajude os usuários com: dúvidas sobre contratos, explicação de cláusulas, indicação de documentos, informações sobre leis brasileiras.
Responda sempre em português brasileiro. Seja claro, prático e objetivo. Cite leis quando relevante.
Não emita aconselhamento jurídico formal — recomende advogado para casos específicos.`;

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

async function generateWithAI() {
  const allT    = getAllTypes();
  const typeInfo = allT.find(t => t.id === selectedType) || { name:'Documento', emoji:'🤖' };

  showIALoading(`Gerando "${typeInfo.name}" com IA...`);

  const prompts = {
    gen_curriculo: `Gere um currículo profissional completo em HTML com as classes do DocFácil (doc-main-title, doc-subtitle, clausula, clausula-title, clausula-body). Seções: Perfil profissional, Experiência, Formação, Habilidades, Idiomas. Use dados de exemplo realistas e profissionais.`,
    gen_carta:     `Gere uma carta formal profissional em HTML. Inclua: remetente, data, destinatário, assunto, 3 parágrafos formais, despedida, assinatura. Formate elegantemente.`,
    gen_proposta:  `Gere uma proposta comercial completa em HTML com: apresentação, escopo, metodologia, cronograma, investimento e condições. Texto profissional de exemplo.`,
    gen_email:     `Gere 3 modelos de e-mail profissional em HTML: (1) Apresentação comercial, (2) Follow-up de proposta, (3) Agradecimento pós-reunião. Cada um bem estruturado.`,
    gen_contrato_ia: `Gere um contrato de prestação de serviços profissional e completo em HTML usando as classes: doc-main-title, doc-subtitle, parties-block, parties-title, party, party-role, clausula, clausula-title, clausula-body. Inclua 10 cláusulas completas com linguagem jurídica real brasileira. Use placeholders [CONTRATANTE] e [CONTRATADO].`,
  };

  const prompt = prompts[selectedType] || `Gere um documento profissional do tipo "${typeInfo.name}" em HTML completo e formatado para uso no Brasil, com linguagem formal e técnica.`;

  try {
    const data = await callIA({
      max_tokens: 2500,
      system: 'Você é especialista em documentos profissionais brasileiros. Gere documentos completos em HTML com formatação profissional. Retorne apenas o HTML do conteúdo, sem tags html/body/head.',
      messages: [{ role:'user', content: prompt }],
    });
    const html = data.content?.[0]?.text || `<div class="doc-main-title">${typeInfo.name}</div><p>Documento gerado com IA.</p>`;
    hideIALoading();

    const num = `IA-${new Date().getFullYear()}-${Math.floor(Math.random()*9000)+1000}`;
    const docObj = {
      id: num, type: selectedType, typeInfo,
      title: typeInfo.name,
      pa:{ nome: currentUser.displayName || 'Usuário' }, pb:{ nome:'—' },
      val:{}, obj:{}, jur:{},
      html, status:'rascunho',
      createdAt: new Date().toISOString(), generatedByAI: true,
    };
    await saveDocFS(docObj);
    currentDocs.unshift(docObj);
    renderDocsBadge();
    viewDocument(num);
    showNotif('Documento gerado pela IA! 🤖', '🤖');
  } catch {
    hideIALoading();
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
  if (isNaN(n) || n === 0) return val + ' reais';
  const inteiro = Math.floor(n);
  const dec = Math.round((n - inteiro) * 100);
  const numStr = inteiro.toLocaleString('pt-BR');
  return `${val} reais (${numStr}${dec > 0 ? ` reais e ${dec} centavos` : ' reais'})`;
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
