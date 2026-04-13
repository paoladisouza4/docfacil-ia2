// ════════════════════════════════════════════════════════════════
//  documentos/index.js — Dispatcher central de documentos
//  Recebe o tipo e delega para o módulo correto
// ════════════════════════════════════════════════════════════════

import { buildLocacao }     from './locacao.js';
import { buildContrato }    from './contratos.js';
import { buildFinanceiro }  from './financeiro.js';
import { buildDeclaracao }  from './declaracoes.js';
import { buildJuridico }    from './juridico.js';
import { buildEmpresarial } from './empresarial.js';

// Mapa: tipo → módulo
const TIPO_MODULO = {
  // Locação e Imobiliário
  aluguel_res:       buildLocacao,
  aluguel_com:       buildLocacao,
  locacao_simples:   buildLocacao,
  locacao_fiador:    buildLocacao,
  vistoria:          buildLocacao,
  notif_desocupacao: buildLocacao,
  acordo_inadimpl:   buildLocacao,
  recibo_aluguel:    buildFinanceiro,

  // Contratos de Serviços e Parcerias
  servico:           buildContrato,
  freelancer:        buildContrato,
  trabalho_pj:       buildContrato,
  autonomo:          buildContrato,
  influenciador:     buildContrato,
  compravenda:       buildContrato,
  parceria:          buildContrato,
  plano_parceria:    buildEmpresarial,
  comissao:          buildContrato,
  nda:               buildContrato,

  // Financeiro
  recibo:            buildFinanceiro,
  quitacao:          buildFinanceiro,
  confissao_divida:  buildFinanceiro,
  parcelamento:      buildFinanceiro,
  nota_servico:      buildFinanceiro,

  // Declarações e Trabalho
  decl_residencia:   buildDeclaracao,
  decl_renda:        buildDeclaracao,
  decl_informal:     buildDeclaracao,
  decl_comparec:     buildDeclaracao,
  decl_respons:      buildDeclaracao,
  decl_uniao:        buildDeclaracao,
  curriculo:         buildDeclaracao,
  carta_apres:       buildDeclaracao,
  carta_demissao:    buildDeclaracao,
  decl_experiencia:  buildDeclaracao,
  estagio:           buildDeclaracao,

  // Jurídico
  lgpd_termo:        buildJuridico,
  politica_priv:     buildJuridico,
  termo_uso:         buildJuridico,
  notif_extra:       buildJuridico,
  acordo_amigavel:   buildJuridico,

  // Empresarial
  contrato_social:   buildEmpresarial,
  acordo_socios:     buildEmpresarial,
  termo_invest:      buildEmpresarial,
  abertura_empresa:  buildEmpresarial,
};

/**
 * Gera o HTML do documento para o tipo especificado.
 * @param {string} type - ID do tipo de documento
 * @param {object} params - Parâmetros do documento (pa, pb, obj, val, jur, etc.)
 * @returns {string} HTML do documento
 */
export function buildDocHTML(params) {
  const { type } = params;
  const builder = TIPO_MODULO[type];

  if (builder) {
    const html = builder(type, params);
    if (html) return html;
  }

  // Fallback: template genérico
  return buildGenerico(type, params);
}

function buildGenerico(t, { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN }) {
  const { partyLine, aviso, cabecalho: cab, roman, signaturas } = window.DocHelpers;
  const head = cab(num, docTitle);

  return `${head}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa,roleA)}</p></div>
    ${pb.nome ? `<div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb,roleB)}</p></div>` : ''}
  </div>
  <p>As partes celebram o presente instrumento mediante as seguintes cláusulas:</p>

  <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
    <p>1.1. ${obj.desc}</p>
    ${obj.entregaveis ? `<p>1.2. Escopo: ${obj.entregaveis}</p>` : ''}
    <p>${obj.entregaveis ? '1.3.' : '1.2.'} Prazo: ${vigText}${obj.local ? ', local: ' + obj.local : ''}.</p>
  </div></div>

  ${obj.obrig_a ? `<div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
    <p>2.1. Compete ao <strong>${roleA}</strong>: ${obj.obrig_a}.</p>
    ${obj.obrig_b && pb.nome ? `<p>2.2. Compete ao <strong>${roleB}</strong>: ${obj.obrig_b}.</p>` : ''}
  </div></div>` : ''}

  ${val.total && val.total !== '0,00' ? `<div class="clausula"><div class="clausula-title">Cláusula III — Do Valor</div><div class="clausula-body">
    <p>Valor: <strong>R$ ${val.total}</strong> (${window.valorExtenso(val.total)}), pago ${val.forma}${val.venc ? ', vencimento: ' + val.venc : ''}.${val.banco ? ' Pagamento via: ' + val.banco + '.' : ''}</p>
    <p>Multa por atraso: ${val.multa} + juros de mora de ${val.juros}.</p>
  </div></div>` : ''}

  ${extraClauses}

  ${jur.foro ? `<div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
    <p>Foro competente: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
  </div></div>` : ''}

  ${signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr })}
  ${aviso}`;
}
