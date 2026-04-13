// ════════════════════════════════════════════════════════════════
//  js/documentos/dispatcher.js — Dispatcher central de documentos
//  Recebe o tipo e chama o módulo correto
//  Carregado via <script> APÓS todos os módulos de documento
// ════════════════════════════════════════════════════════════════

window.DocDispatcher = {

  // Mapa tipo → função do módulo
  _mapa: {
    // Locação e Imobiliário
    aluguel_res:       () => window.DocLocacao,
    aluguel_com:       () => window.DocLocacao,
    locacao_simples:   () => window.DocLocacao,
    locacao_fiador:    () => window.DocLocacao,
    vistoria:          () => window.DocLocacao,
    notif_desocupacao: () => window.DocLocacao,
    acordo_inadimpl:   () => window.DocLocacao,

    // Contratos de Serviços
    servico:           () => window.DocContratos,
    freelancer:        () => window.DocContratos,
    trabalho_pj:       () => window.DocContratos,
    autonomo:          () => window.DocContratos,
    influenciador:     () => window.DocContratos,
    compravenda:       () => window.DocContratos,
    parceria:          () => window.DocContratos,
    comissao:          () => window.DocContratos,
    nda:               () => window.DocContratos,

    // Financeiro
    recibo:            () => window.DocFinanceiro,
    recibo_aluguel:    () => window.DocFinanceiro,
    quitacao:          () => window.DocFinanceiro,
    confissao_divida:  () => window.DocFinanceiro,
    parcelamento:      () => window.DocFinanceiro,
    nota_servico:      () => window.DocFinanceiro,

    // Declarações e Trabalho
    decl_residencia:   () => window.DocDeclaracoes,
    decl_renda:        () => window.DocDeclaracoes,
    decl_informal:     () => window.DocDeclaracoes,
    decl_comparec:     () => window.DocDeclaracoes,
    decl_respons:      () => window.DocDeclaracoes,
    decl_uniao:        () => window.DocDeclaracoes,
    curriculo:         () => window.DocDeclaracoes,
    carta_apres:       () => window.DocDeclaracoes,
    carta_demissao:    () => window.DocDeclaracoes,
    decl_experiencia:  () => window.DocDeclaracoes,
    estagio:           () => window.DocDeclaracoes,

    // Jurídico
    lgpd_termo:        () => window.DocJuridico,
    politica_priv:     () => window.DocJuridico,
    termo_uso:         () => window.DocJuridico,
    notif_extra:       () => window.DocJuridico,
    acordo_amigavel:   () => window.DocJuridico,

    // Empresarial
    contrato_social:   () => window.DocEmpresarial,
    acordo_socios:     () => window.DocEmpresarial,
    termo_invest:      () => window.DocEmpresarial,
    abertura_empresa:  () => window.DocEmpresarial,
    plano_parceria:    () => window.DocEmpresarial,
  },

  /**
   * Gera o HTML do documento
   * @param {object} params - todos os parâmetros do documento
   * @returns {string} HTML completo do documento
   */
  build(params) {
    const { type } = params;
    const getBuilder = this._mapa[type];
    if (getBuilder) {
      const builder = getBuilder();
      if (builder) {
        const html = builder(type, params);
        if (html) return html;
      }
    }
    // Fallback: template genérico
    return this._generico(type, params);
  },

  _generico(t, { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN }) {
    const H = window.DocHelpers;
    const head = H.cabecalho(num, docTitle);
    const roman = H.roman;
    return `${head}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${H.partyLine(pa,roleA)}</p></div>
    ${pb?.nome ? `<div class="party"><div class="party-role">${roleB}:</div><p>${H.partyLine(pb,roleB)}</p></div>` : ''}
  </div>
  <p>As partes celebram o presente instrumento mediante as seguintes cláusulas:</p>

  <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
    <p>1.1. ${obj.desc}</p>
    ${obj.entregaveis ? `<p>1.2. Escopo: ${obj.entregaveis}</p>` : ''}
    <p>${obj.entregaveis ? '1.3.' : '1.2.'} Prazo: ${vigText}${obj.local ? ', local: ' + obj.local : ''}.</p>
  </div></div>

  ${obj.obrig_a ? `<div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
    <p>2.1. Compete ao <strong>${roleA}</strong>: ${obj.obrig_a}.</p>
    ${obj.obrig_b && pb?.nome ? `<p>2.2. Compete ao <strong>${roleB}</strong>: ${obj.obrig_b}.</p>` : ''}
    <p>Ambas as partes comprometem-se a agir com boa-fé e transparência.</p>
  </div></div>` : ''}

  ${val.total && val.total !== '0,00' ? `<div class="clausula"><div class="clausula-title">Cláusula III — Do Valor e Pagamento</div><div class="clausula-body">
    <p>Valor: <strong>R$ ${val.total}</strong> (${window.valorExtenso(val.total)}), pago <strong>${val.forma}</strong>${val.venc ? ', vencimento: ' + val.venc : ''}.${val.banco ? ' Pagamento via: ' + val.banco + '.' : ''}</p>
    <p>Multa por atraso: ${val.multa}. Juros de mora: ${val.juros}.</p>
  </div></div>` : ''}

  ${extraClauses || ''}

  ${jur.foro ? `<div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
    <p>Fica eleito o foro de <strong>${jur.foro}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
  </div></div>` : ''}

  ${H.signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr })}
  ${H.aviso}`;
  }
};
