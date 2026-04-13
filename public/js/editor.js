// ════════════════════════════════════════════════════════════════
//  js/editor.js — Edição inline estilo Word
//  Gerencia edição de documentos após geração
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

