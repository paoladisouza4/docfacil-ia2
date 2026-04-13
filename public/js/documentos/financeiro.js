// ════════════════════════════════════════════════════════════════
//  js/documentos/financeiro.js — Documentos Financeiros e Recibos
//  Tipos: recibo, recibo_aluguel, quitacao, confissao_divida, parcelamento, nota_servico
//  Carregado via <script> — usa window.DocHelpers
// ════════════════════════════════════════════════════════════════

window.DocFinanceiro = function buildFinanceiro(t, params) {
  const { partyLine, aviso, cabecalho, roman, signaturas } = window.DocHelpers;
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params;
  const head = cabecalho(num, docTitle);

  // ════ RECIBO DE PAGAMENTO ════
  if (['recibo','recibo_aluguel'].includes(t)) {
    return `${head}
    <div class="doc-subtitle">Documento comprobatório de pagamento · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados do Recibo</div>
      <div class="party"><div class="party-role">RECEBEDOR:</div><p>${partyLine(pa,'RECEBEDOR')}</p></div>
      <div class="party"><div class="party-role">PAGANTE:</div><p>${partyLine(pb,'PAGANTE')}</p></div>
    </div>

    <div class="clausula"><div class="clausula-title">Declaração de Recebimento</div><div class="clausula-body">
      <p>Declaro que recebi de <strong>${pb.nome}</strong>, a quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
      <p>Forma de pagamento: <strong>${val.forma}</strong>${val.banco ? ' — ' + val.banco : ''}.</p>
      <p>Período de referência: <strong>${obj.inicio} a ${obj.fim !== 'indeterminado' ? obj.fim : obj.inicio}</strong>.</p>
      <p>Por ser verdade, firmo o presente recibo, dando plena, geral e irrevogável quitação da referida quantia, para que produza seus efeitos legais.</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">RECEBEDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PAGANTE</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>
    ${aviso}`;
  }

  // ════ DECLARAÇÕES ════
  if (['decl_residencia','decl_renda','decl_informal','decl_comparec','decl_respons','decl_uniao'].includes(t)) {
    const declTextos = {
      decl_residencia: `Declaro, para os devidos fins, que resido no endereço: <strong>${obj.desc || obj.local}</strong>, nesta cidade, há aproximadamente <strong>${obj.vigencia || 'tempo indeterminado'}</strong>. Declaro ainda que as informações prestadas são verdadeiras e assumo total responsabilidade civil e criminal por esta declaração.`,
      decl_renda: `Declaro, para os devidos fins, que minha renda ${obj.vigencia === '1 mês' ? 'mensal' : 'aproximada'} é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), proveniente de: <strong>${obj.desc}</strong>. Declaro que as informações são verdadeiras e assumo total responsabilidade por esta declaração.`,
      decl_informal: `Declaro, para os devidos fins, que exerço atividade de trabalho informal como <strong>${pa.prof || obj.desc}</strong>, auferindo renda aproximada de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) mensais. Declaro que as informações são verdadeiras.`,
      decl_comparec: `Declaro, para os devidos fins, que <strong>${pb.nome}</strong>, portador(a) do CPF nº <strong>${pb.doc}</strong>, compareceu a este estabelecimento/local em <strong>${obj.inicio}</strong>, no período de <strong>${obj.desc}</strong>. Esta declaração é fornecida a pedido do(a) interessado(a).`,
      decl_respons: `Declaro, para os devidos fins, que me responsabilizo por: <strong>${obj.desc}</strong>. Assumo toda responsabilidade civil decorrente desta declaração, isentando terceiros de quaisquer ônus.`,
      decl_uniao: `Declaramos, para os devidos fins legais, que vivemos em União Estável desde <strong>${obj.inicio}</strong>, de forma pública, contínua e duradoura, com o objetivo de constituir família, nos termos do art. 1.723 do Código Civil Brasileiro (Lei nº 10.406/2002). Declaramos ainda que não possuímos impedimentos legais para a união e que as informações prestadas são verdadeiras.`,
    };
    return `${head}
    <div class="doc-subtitle">${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Declarante${t === 'decl_uniao' ? 's' : ''}</div>
      <div class="party"><div class="party-role">DECLARANTE${t === 'decl_uniao' ? ' 1' : ''}:</div><p>${partyLine(pa,'DECLARANTE')}</p></div>
      ${t === 'decl_uniao' ? `<div class="party"><div class="party-role">DECLARANTE 2:</div><p>${partyLine(pb,'DECLARANTE 2')}</p></div>` : ''}
    </div>
    <div class="clausula"><div class="clausula-body"><p>${declTextos[t]}</p>${jur.extra ? `<p>${jur.extra}</p>` : ''}</div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">DECLARANTE</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        ${t === 'decl_uniao' ? `<div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">DECLARANTE 2</div><div class="sig-doc">CPF: ${pb.doc}</div></div>` : '<div class="sig-item"></div>'}
      </div>
    </div>
    ${aviso}`;
  }

  // ════ CONFISSÃO DE DÍVIDA / PARCELAMENTO / QUITAÇÃO ════
  if (['confissao_divida','parcelamento','quitacao'].includes(t)) {
    return `${head}
    <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CREDOR:</div><p>${partyLine(pa,'CREDOR')}</p></div>
      <div class="party"><div class="party-role">DEVEDOR:</div><p>${partyLine(pb,'DEVEDOR')}</p></div>
    </div>
    <p>As partes acima qualificadas celebram o presente instrumento mediante as seguintes condições:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — ${t === 'quitacao' ? 'Da Quitação' : t === 'confissao_divida' ? 'Da Dívida Confessada' : 'Do Parcelamento'}</div><div class="clausula-body">
      ${t === 'quitacao'
        ? `<p>1.1. O CREDOR declara ter recebido do DEVEDOR a quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
           <p>1.2. Dando plena, geral e irrevogável quitação da referida quantia, nada mais tendo a reclamar a qualquer título, presente ou futuro, em razão da dívida ora quitada.</p>`
        : t === 'confissao_divida'
        ? `<p>1.1. O DEVEDOR reconhece e confessa, por este instrumento, ser devedor ao CREDOR da quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
           <p>1.2. O DEVEDOR compromete-se a quitar o débito até <strong>${obj.fim}</strong>, mediante <strong>${val.forma}</strong>.</p>`
        : `<p>1.1. O DEVEDOR reconhece o débito de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) perante o CREDOR e compromete-se a pagá-lo de forma parcelada.</p>
           <p>1.2. O pagamento será realizado em parcelas de <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante ${val.banco || 'forma a ser acordada'}.</p>`
      }
      <p>${t === 'quitacao' ? '1.3.' : '1.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de mora de <strong>${val.juros}</strong>, nos termos do art. 395 do Código Civil.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Do Foro</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'da Comarca do domicílio do devedor'}</strong> para dirimir eventuais litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CREDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">DEVEDOR</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ NDA / CONFIDENCIALIDADE ════
  // ════ NOTA SIMPLES DE SERVIÇO ════
  if (t === 'nota_servico') {
    return `${head}
    <div class="doc-subtitle">Nota de Prestação de Serviço · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados</div>
      <div class="party"><div class="party-role">PRESTADOR:</div><p>${partyLine(pa,'PRESTADOR')}</p></div>
      <div class="party"><div class="party-role">TOMADOR:</div><p>${partyLine(pb,'TOMADOR')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Descrição do Serviço</div><div class="clausula-body">
      <p><strong>Serviço prestado:</strong> ${obj.desc}</p>
      <p><strong>Data de execução:</strong> ${obj.inicio}</p>
      ${obj.local ? `<p><strong>Local:</strong> ${obj.local}</p>` : ''}
      ${obj.entregaveis ? `<p><strong>Detalhes:</strong> ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Valor</div><div class="clausula-body">
      <p><strong>Valor total: R$ ${val.total}</strong> (${valorExtenso(val.total)})</p>
      <p>Forma de pagamento: ${val.forma} | Vencimento: ${val.venc}</p>
      ${val.banco ? `<p>Dados para pagamento: ${val.banco}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-body">
      <p>Declaro ter prestado os serviços acima descritos e que as informações são verdadeiras.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PRESTADOR DE SERVIÇO</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">TOMADOR — Ciente</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ LGPD / PRIVACIDADE / TERMOS DE USO ════
  if (['lgpd_termo','politica_priv','termo_uso'].includes(t)) {

  return null;
};
