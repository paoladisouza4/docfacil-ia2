// ════════════════════════════════════════════════════════════════
//  js/app-core.js — Núcleo da aplicação
//  Auth UI, navegação de páginas, sidebar, notificações
// ════════════════════════════════════════════════════════════════

function showAuth(tab = 'login') {
  document.getElementById('auth-overlay').style.display = 'flex';
  authTab(tab);
}
function hideAuth() {
  document.getElementById('auth-overlay').style.display = 'none';
}

// ── Menu mobile ──
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
  const a    = el.querySelector('.inst-faq-a');
  const s    = el.querySelector('.inst-faq-q span');
  const open = a.style.display === 'block';
  document.querySelectorAll('.inst-faq-a').forEach(x => x.style.display = 'none');
  document.querySelectorAll('.inst-faq-q span').forEach(x => x.textContent = '+');
  if (!open) { a.style.display = 'block'; if (s) s.textContent = '−'; }
}

// ── Toggle testemunhas ──
// NOTA: testemunhasAtivas é declarada APENAS aqui (app-core.js).
// app.js foi limpo das declarações duplicadas.
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
    ['test1_nome','test1_doc','test2_nome','test2_doc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  }
}

// ════════════════════════════════════════════════════════════════
//  FIREBASE AUTH
//  ATENÇÃO: onAuthStateChanged registrado UMA única vez aqui.
//  A versão em app.js foi REMOVIDA para evitar duplo listener.
// ════════════════════════════════════════════════════════════════

function waitForFirebase(cb, tries = 0) {
  if (window._firebase) { cb(window._firebase); return; }
  if (tries > 40) { console.error('Firebase não inicializou'); return; }
  setTimeout(() => waitForFirebase(cb, tries + 1), 150);
}

waitForFirebase(({ auth, onAuthStateChanged }) => {
  onAuthStateChanged(auth, user => {
    document.getElementById('loading-screen').style.display = 'none';
    if (user) {
      currentUser = user;
      document.getElementById('landing-screen').style.display = 'none';
      document.getElementById('auth-overlay').style.display   = 'none';
      startApp();
    } else {
      document.getElementById('landing-screen').style.display = 'block';
      document.getElementById('app').style.display            = 'none';
    }
  });
  document.getElementById('loading-screen').style.display  = 'flex';
  document.getElementById('landing-screen').style.display  = 'none';
});

function authTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('auth-login').style.display    = tab === 'login'    ? '' : 'none';
  document.getElementById('auth-register').style.display = tab === 'register' ? '' : 'none';
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('auth-error');
  const btn   = document.getElementById('login-btn');

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
      document.getElementById('app').style.display            = 'none';
      document.getElementById('landing-screen').style.display = 'block';
    });
  });
}

function showAuthErr(el, msg) { el.textContent = msg; el.style.display = 'block'; }

function fbMsg(code) {
  const m = {
    'auth/user-not-found':        'Usuário não encontrado.',
    'auth/wrong-password':        'Senha incorreta.',
    'auth/invalid-credential':    'E-mail ou senha inválidos.',
    'auth/email-already-in-use':  'E-mail já cadastrado.',
    'auth/invalid-email':         'E-mail inválido.',
    'auth/weak-password':         'Senha muito fraca (mín. 6 caracteres).',
    'auth/too-many-requests':     'Muitas tentativas. Aguarde.',
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

// FIX Bug 7: usa dataWithoutHtml para não inflar o Firestore com HTML gigante
async function updateDocFS(docObj) {
  return new Promise(resolve => {
    waitForFirebase(async ({ db, doc, updateDoc }) => {
      try {
        if (docObj.fsId) {
          // Separa html do resto — salva apenas dados estruturados no Firestore
          const { html: _html, ...dataWithoutHtml } = docObj;
          await updateDoc(doc(db, 'documents', docObj.fsId), dataWithoutHtml);
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
        const q    = query(collection(db, 'documents'), where('userId', '==', currentUser.uid));
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
    const elModal = document.getElementById(id);
    if (elModal) elModal.style.display = 'none';
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
  const s    = document.getElementById('sidebar');
  const o    = document.getElementById('sidebar-overlay');
  const open = s.classList.toggle('mobile-open');
  o.style.display = open ? 'block' : 'none';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').style.display = 'none';
}
