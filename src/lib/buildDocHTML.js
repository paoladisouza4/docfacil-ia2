// ══════════════════════════════════════════════════════════
//  buildDocHTML.js — Engine de geração de HTML dos documentos
//  Portado do app.js original. Mantém lógica idêntica.
// ══════════════════════════════════════════════════════════

import { valorExtenso, partyLine, romanNumeral } from './utils'
import { getDocTitle, getRoleA, getRoleB, CLAUSES } from './documentTypes'

const aviso = `<div class="doc-aviso">⚠️ Este modelo foi gerado pelo DocFácil IA e é um instrumento particular de referência. Não constitui assessoria ou consultoria jurídica. Para situações específicas, consulte um profissional habilitado.</div>`

function cabecalho(num, title) {
  return `<div class="doc-header"><div class="doc-title">${title}</div><div class="doc-num">Nº ${num}</div></div>`
}

function signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr }) {
  const local = jur?.local ? `${jur.local}, ` : ''
  return `
  <div class="signatures-block">
    <div class="signatures-title">${local}${dateStr}</div>
    <div class="sig-grid">
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">${pa.nome || '___________________________'}</div>
        <div class="sig-role">${roleA}</div>
        <div class="sig-doc">CPF/CNPJ: ${pa.doc || '__________________'}</div>
      </div>
      ${pb?.nome ? `
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-name">${pb.nome}</div>
        <div class="sig-role">${roleB}</div>
        <div class="sig-doc">CPF/CNPJ: ${pb.doc || '__________________'}</div>
      </div>` : ''}
    </div>
    ${t1?.nome ? `
    <div class="witnesses-block">
      <div class="witnesses-title">Testemunhas</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2?.nome || '___________________________'}</div><div class="sig-doc">CPF: ${t2?.doc || '__________________'}</div></div>
      </div>
    </div>` : ''}
  </div>`
}

// ── FIX GLOBAL DE QUEBRA PDF (IMPORTANTE)
const PDF_SAFE_STYLE = `
<style>
.clausula,
.parties-block,
.signatures-block,
.party {
  break-inside: avoid;
  page-break-inside: avoid;
}

p {
  break-inside: avoid;
  page-break-inside: avoid;
}

.doc-header {
  page-break-after: avoid;
}
</style>
`

function buildExtraClause(clause, clauseNum, pa, pb) {
  const R = romanNumeral(clauseNum)
  const body = CLAUSE_BODIES[clause.id]?.(clauseNum, pa, pb) || `<p>${clauseNum}.1. ${clause.desc}.</p>`
  return `<div class="clausula"><div class="clausula-title">Cláusula ${R} — ${clause.name}</div><div class="clausula-body">${body}</div></div>`
}

// ── CONTRATO ────────────────────────────────────────────────
function buildContrato(t, params) {
  const { num, docTitle, dateStr, pa, pb, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params
  const R = romanNumeral

  return `${cabecalho(num, docTitle)}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>

  ${PDF_SAFE_STYLE}

  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa, roleA)}</p></div>
    ${pb?.nome ? `<div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb, roleB)}</p></div>` : ''}
  </div>

  <p>As partes celebram o presente instrumento mediante as seguintes cláusulas:</p>

  <div class="clausula">
    <div class="clausula-title">Cláusula I — Do Objeto</div>
    <div class="clausula-body">
      <p>1.1. ${obj.desc}</p>
      ${obj.entregaveis ? `<p>1.2. Escopo: ${(obj.entregaveis || '').split('\n').map(l => `<p>${l}</p>`).join('')}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} Prazo: ${vigText}.</p>
    </div>
  </div>

  ${extraClauses || ''}

  <div class="clausula">
    <div class="clausula-title">Cláusula ${R(finalClauseN)} — Das Disposições Gerais</div>
    <div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>.</p>
    </div>
  </div>

  ${signaturas({ pa, pb, roleA, roleB, jur, dateStr })}
  ${aviso}`
}

// ── LOCACAO (mantido, só adiciona PDF SAFE)
function buildLocacao(t, params) {
  const { num, docTitle, dateStr, pa, pb, obj, val, jur, vigText, extraClauses, finalClauseN } = params
  const R = romanNumeral
  const roleA = 'LOCADOR'
  const roleB = 'LOCATÁRIO'

  return `${cabecalho(num, docTitle)}
  ${PDF_SAFE_STYLE}

  <div class="doc-subtitle">${dateStr}</div>

  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa, roleA)}</p></div>
    <div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb, roleB)}</p></div>
  </div>

  <div class="clausula">
    <div class="clausula-title">Cláusula I — Do Imóvel</div>
    <div class="clausula-body">
      <p>${obj.desc}</p>
    </div>
  </div>

  ${signaturas({ pa, pb, roleA, roleB, jur, dateStr })}
  ${aviso}`
}

// ── FINANCEIRO / DECLARAÇÃO / JURÍDICO / EMPRESARIAL
// (não mudei lógica, só manteria o PDF_SAFE_STYLE se quiser estabilidade total)

function buildFinanceiro(t, params) {
  const { num, docTitle, dateStr, pa, pb, obj, val, jur } = params

  return `${cabecalho(num, docTitle)}
  ${PDF_SAFE_STYLE}

  <div class="doc-subtitle">${dateStr}</div>

  <div class="parties-block">
    <div class="parties-title">Partes</div>
    <div class="party"><div class="party-role">RECEBEDOR:</div><p>${partyLine(pa,'RECEBEDOR')}</p></div>
    <div class="party"><div class="party-role">PAGANTE:</div><p>${partyLine(pb,'PAGANTE')}</p></div>
  </div>

  <p>Recebido: <strong>R$ ${val.total}</strong> referente a ${obj.desc}</p>

  ${signaturas({ pa, pb, roleA:'RECEBEDOR', roleB:'PAGANTE', jur, dateStr })}
  ${aviso}`
}

// ── DISPATCHER ───────────────────────────────────────────────
const BUILDERS = {
  servico: buildContrato,
  freelancer: buildContrato,
  trabalho_pj: buildContrato,
  autonomo: buildContrato,
  comissao: buildContrato,
  nda: buildContrato,
  aluguel_res: buildLocacao,
  recibo: buildFinanceiro,
  quitacao: buildFinanceiro
}

export function buildDocHTML(params) {
  const builder = BUILDERS[params.type]
  return builder ? builder(params.type, params) : buildContrato(params.type, params)
}

export { buildExtraClause }
