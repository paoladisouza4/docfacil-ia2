// ════════════════════════════════════════════════════════════════
//  js/render.js — Renderização de listas e dashboard
//  renderDocs, updateDashboard, renderDocsBadge
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

