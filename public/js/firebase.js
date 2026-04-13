// ════════════════════════════════════════════════════════════════
//  js/firebase.js — Autenticação e banco de dados (Firebase)
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

