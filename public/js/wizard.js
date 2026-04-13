// ════════════════════════════════════════════════════════════════ //  js/wizard.js — Wizard de criação de documentos (CORRIGIDO) //  Agora com formulário dinâmico por GRUPO de documentos // ════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════ // CONFIG POR GRUPO (ESCALÁVEL) // ═══════════════════════════════════════════════ const FORM_CONFIG = { contratos: { temParteB: true, objeto: true, valor: true, testemunhas: true, steps: [1,2,3,4,5,6] }, locacao: { temParteB: true, objeto: true, valor: true, testemunhas: true, steps: [1,2,3,4,5,6] }, financeiro: { temParteB: true, objeto: true, valor: true, testemunhas: false, steps: [1,2,3,4] }, declaracoes: { temParteB: false, objeto: false, valor: false, testemunhas: false, steps: [1,2] }, juridico: { temParteB: true, objeto: true, valor: false, testemunhas: true, steps: [1,2,3,4,5] }, empresarial: { temParteB: true, objeto: true, valor: true, testemunhas: true, steps: [1,2,3,4,5,6] } };

function getGrupoFromType(type) { const mapa = window.DocDispatcher?._mapa; if (!mapa || !mapa[type]) return 'contratos';

const fn = mapatype;

if (fn === window.DocContratos) return 'contratos'; if (fn === window.DocLocacao) return 'locacao'; if (fn === window.DocFinanceiro) return 'financeiro'; if (fn === window.DocDeclaracoes) return 'declaracoes'; if (fn === window.DocJuridico) return 'juridico'; if (fn === window.DocEmpresarial) return 'empresarial';

return 'contratos'; }

function applyFormConfig(type) { const grupo = getGrupoFromType(type); const cfg = FORM_CONFIG[grupo]; if (!cfg) return;

window._activeSteps = cfg.steps; window._docTemParteB = cfg.temParteB;

const pb = document.getElementById('parte-b-section'); if (pb) pb.style.display = cfg.temParteB ? '' : 'none';

const ts = document.getElementById('testemunhas-section'); if (ts) ts.style.display = cfg.testemunhas ? '' : 'none';

['obj_desc','obj_obrig_a','obj_obrig_b','obj_entregaveis'].forEach(id => { const el = document.getElementById(id)?.closest('.field'); if (el) el.style.display = cfg.objeto ? '' : 'none'; });

const val = document.getElementById('val-section'); if (val) val.style.display = cfg.valor ? '' : 'none'; }

// ═══════════════════════════════════════════════ // RESTO DO WIZARD (ORIGINAL + AJUSTES) // ═══════════════════════════════════════════════

function selectType(id) { selectedType = id; document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected')); document.getElementById('tc-' + id)?.classList.add('selected');

applyFormConfig(id); updateStep3Hints(id); }

function wizardNext() { if (currentStep === 1 && !selectedType) { showNotif('Selecione um tipo de documento', '⚠️'); return; }

if (currentStep === 2) { if (!V('p_a_nome')) { showNotif('Preencha o nome da Parte A', '⚠️'); return; }

if (window._docTemParteB !== false && !V('p_b_nome')) {
  showNotif('Preencha o nome da Parte B', '⚠️');
  return;
}

}

if (currentStep === 3) { const grupo = getGrupoFromType(selectedType); const cfg = FORM_CONFIG[grupo];

if (cfg.objeto && !V('obj_desc')) {
  showNotif('Preencha a descrição do documento', '⚠️');
  return;
}

}

const activeSteps = window._activeSteps || [1,2,3,4,5,6]; const curIdx = activeSteps.indexOf(currentStep);

if (curIdx === activeSteps.length - 1) { generateDocument(); return; }

currentStep = activeSteps[curIdx + 1]; updateWizardUI(); }

function wizardBack() { const activeSteps = window._activeSteps || [1,2,3,4,5,6]; const curIdx = activeSteps.indexOf(currentStep); if (curIdx > 0) { currentStep = activeSteps[curIdx - 1]; updateWizardUI(); } }

function updateWizardUI() { const activeSteps = window._activeSteps || [1,2,3,4,5,6];

for (let i = 1; i <= 6; i++) { const el = document.getElementById('step-' + i); if (el) el.style.display = i === currentStep ? '' : 'none'; }

document.getElementById('btn-back').style.visibility = currentStep > 1 ? 'visible' : 'hidden';

const curIdx = activeSteps.indexOf(currentStep); const isLast = curIdx === activeSteps.length - 1;

const btn = document.getElementById('btn-next'); btn.innerHTML = isLast ? '✨ Gerar Documento' : 'Próximo →'; }

// resto do código original pode continuar abaixo sem alterações