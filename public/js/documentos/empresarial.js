// ════════════════════════════════════════════════════════════════
//  js/documentos/empresarial.js — Documentos Empresariais e Societários
//  Tipos: contrato_social, acordo_socios, termo_invest, abertura_empresa, plano_parceria
//  Carregado via <script> — usa window.DocHelpers
// ════════════════════════════════════════════════════════════════

window.DocEmpresarial = function buildEmpresarial(t, params) {
  const { partyLine, aviso, cabecalho, roman, signaturas } = window.DocHelpers;
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params;
  const head = cabecalho(num, docTitle);

  // ════ CONTRATO SOCIAL ════
  if (t === 'contrato_social') {
    return `${head}
    <div class="doc-subtitle">Contrato Social de Sociedade Limitada · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Sócios</div>
      <div class="party"><div class="party-role">SÓCIO ADMINISTRADOR:</div><p>${partyLine(pa,'SÓCIO ADMINISTRADOR')}</p></div>
      <div class="party"><div class="party-role">SÓCIO:</div><p>${partyLine(pb,'SÓCIO')}</p></div>
    </div>
    <p>Os sócios acima qualificados constituem, por este instrumento, uma Sociedade Limitada, regida pelo Código Civil (arts. 1.052 a 1.087), mediante as seguintes cláusulas:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Da Denominação e Sede</div><div class="clausula-body">
      <p>1.1. A sociedade será denominada <strong>${obj.desc}</strong>, com sede em <strong>${obj.local || 'endereço a ser registrado'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Objeto Social</div><div class="clausula-body">
      <p>2.1. A sociedade tem por objeto: <strong>${obj.obrig_a || obj.entregaveis || 'atividades a serem descritas conforme CNAE'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Do Capital Social</div><div class="clausula-body">
      <p>3.1. O capital social é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), dividido entre os sócios:</p>
      <p>— ${pa.nome}: R$ ____________ (_____%)</p>
      <p>— ${pb.nome}: R$ ____________ (_____%)</p>
      <p>3.2. O capital social está totalmente subscrito e integralizado nesta data.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Administração</div><div class="clausula-body">
      <p>4.1. A sociedade será administrada pelo(a) sócio(a) <strong>${pa.nome}</strong>, que terá poderes para praticar todos os atos de gestão necessários ao funcionamento da empresa.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Distribuição de Lucros</div><div class="clausula-body">
      <p>5.1. Os lucros e resultados serão distribuídos proporcionalmente à participação de cada sócio no capital social, após apuração contábil.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Retirada e Exclusão de Sócios</div><div class="clausula-body">
      <p>6.1. Qualquer sócio poderá retirar-se da sociedade mediante aviso prévio de <strong>${jur.rescisao}</strong>, apurando-se seus haveres na forma da lei.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Regido pelo Código Civil. Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">SÓCIO ADMINISTRADOR</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO ENTRE SÓCIOS ════
  if (t === 'acordo_socios') {
    return `${head}
    <div class="doc-subtitle">Acordo de Sócios · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Sócios</div>
      <div class="party"><div class="party-role">SÓCIO A:</div><p>${partyLine(pa,'SÓCIO A')}</p></div>
      <div class="party"><div class="party-role">SÓCIO B:</div><p>${partyLine(pb,'SÓCIO B')}</p></div>
    </div>
    <p>Os sócios celebram o presente Acordo para regular direitos e obrigações societárias:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. Este acordo regula: <strong>${obj.desc}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Das Quotas e Participações</div><div class="clausula-body">
      <p>2.1. As quotas sociais são distribuídas: SÓCIO A: _____% | SÓCIO B: _____%.</p>
      <p>2.2. Qualquer transferência de quotas requer aprovação prévia e por escrito do outro sócio.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações dos Sócios</div><div class="clausula-body">
      <p>3.1. SÓCIO A: ${obj.obrig_a || 'responsável pela área de gestão e administração'}.</p>
      <p>3.2. SÓCIO B: ${obj.obrig_b || 'responsável pela área operacional e comercial'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Decisões</div><div class="clausula-body">
      <p>4.1. Decisões estratégicas exigem aprovação de ambos os sócios. Decisões operacionais podem ser tomadas individualmente dentro das respectivas áreas de responsabilidade.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Saída de Sócio</div><div class="clausula-body">
      <p>5.1. Em caso de saída, o sócio retirante deverá oferecer suas quotas primeiramente ao(s) outro(s) sócio(s), pelo valor patrimonial apurado. Prazo de exercício do direito de preferência: ${jur.rescisao}.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">SÓCIO A</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO B</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ TERMO DE INVESTIMENTO ════
  if (t === 'termo_invest') {
    return `${head}
    <div class="doc-subtitle">Instrumento Particular de Investimento · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">INVESTIDOR:</div><p>${partyLine(pa,'INVESTIDOR')}</p></div>
      <div class="party"><div class="party-role">EMPRESA INVESTIDA:</div><p>${partyLine(pb,'EMPRESA')}</p></div>
    </div>
    <p>As partes celebram o presente Termo de Investimento nos seguintes termos:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Investimento</div><div class="clausula-body">
      <p>1.1. O INVESTIDOR aporta na EMPRESA o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), destinado a: <strong>${obj.desc}</strong></p>
      <p>1.2. O aporte será realizado ${val.forma}, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Contrapartida</div><div class="clausula-body">
      <p>2.1. Em contrapartida ao investimento, a EMPRESA oferece: <strong>${obj.obrig_b || 'participação societária / retorno financeiro conforme acordado'}</strong>.</p>
      <p>2.2. A forma de retorno do investimento: ${val.cond || 'conforme negociação entre as partes'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações da Empresa</div><div class="clausula-body">
      <p>3.1. A EMPRESA compromete-se a: (a) utilizar os recursos exclusivamente para as finalidades descritas; (b) prestar contas regularmente ao INVESTIDOR; (c) não alienar ativos estratégicos sem anuência do INVESTIDOR.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Do Prazo</div><div class="clausula-body">
      <p>4.1. Este instrumento vigorará ${vigText}, podendo ser renovado por acordo entre as partes.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">INVESTIDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">EMPRESA INVESTIDA</div><div class="sig-doc">CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ABERTURA DE EMPRESA ════
  if (t === 'abertura_empresa') {
    return `${head}
    <div class="doc-subtitle">Requerimento de Constituição de Empresa · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Requerente</div>
      <div class="party"><div class="party-role">SÓCIO / TITULAR:</div><p>${partyLine(pa,'REQUERENTE')}</p></div>
      ${pb.nome && pb.nome !== '—' ? `<div class="party"><div class="party-role">SÓCIO 2:</div><p>${partyLine(pb,'SÓCIO 2')}</p></div>` : ''}
    </div>
    <div class="clausula"><div class="clausula-title">1. Dados da Empresa a Constituir</div><div class="clausula-body">
      <p><strong>Nome Empresarial:</strong> ${obj.desc}</p>
      <p><strong>Tipo jurídico:</strong> ${obj.local || 'Sociedade Limitada (LTDA) / MEI / ME'}</p>
      <p><strong>Endereço da sede:</strong> ${pa.end || 'a preencher'}</p>
      <p><strong>Capital social:</strong> R$ ${val.total} (${valorExtenso(val.total)})</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Objeto Social (Atividade)</div><div class="clausula-body">
      <p>${obj.obrig_a || obj.entregaveis || 'Descrição das atividades a serem exercidas — consulte o CNAE correspondente.'}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Administração</div><div class="clausula-body">
      <p>O(A) administrador(a) da empresa será: <strong>${pa.nome}</strong>, responsável pela representação legal e gestão do negócio.</p>
    </div></div>
    <div class="clausula"><div class="clausula-body">
      <p><em>⚠️ Este documento é um modelo de referência para organização das informações. Para constituição legal da empresa, registre o contrato social na Junta Comercial do seu estado ou utilize o Portal do Empreendedor (MEI/ME).</em></p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">REQUERENTE / SÓCIO</div><div class="sig-doc">CPF: ${pa.doc}</div></div>
        ${pb.nome && pb.nome !== '—' ? `<div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO 2</div><div class="sig-doc">CPF: ${pb.doc}</div></div>` : '<div class="sig-item"></div>'}
      </div>
    </div>${aviso}`;
  }

  // ════ TEMPLATE GENÉRICO MELHORADO ════
  return `${head}
  if (t === 'parceria' || t === 'plano_parceria') {
    return `${head}
    <div class="doc-subtitle">Instrumento Particular de Parceria Comercial · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARCEIRO A:</div><p>${partyLine(pa,'PARCEIRO A')}</p></div>
      <div class="party"><div class="party-role">PARCEIRO B:</div><p>${partyLine(pb,'PARCEIRO B')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Parceria Comercial, comprometendo-se a atuar de forma colaborativa para os fins descritos neste instrumento:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto da Parceria</div><div class="clausula-body">
      <p>1.1. As partes estabelecem parceria comercial para: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Escopo e metas: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} A parceria vigorará ${vigText}, com início em <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações e Responsabilidades</div><div class="clausula-body">
      <p>2.1. Compete ao PARCEIRO A: ${obj.obrig_a || 'aportar recursos, conhecimento e infraestrutura conforme acordado'}.</p>
      <p>2.2. Compete ao PARCEIRO B: ${obj.obrig_b || 'executar as atividades operacionais e de relacionamento conforme acordado'}.</p>
      <p>2.3. As decisões estratégicas serão tomadas em conjunto, mediante acordo entre as partes.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Remuneração e Divisão de Resultados</div><div class="clausula-body">
      <p>3.1. Os resultados financeiros e a remuneração da parceria correspondem a <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pagos <strong>${val.forma}</strong>, com vencimento em <strong>${val.venc || 'data acordada entre as partes'}</strong>.</p>
      <p>3.2. Os pagamentos serão realizados mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>, com vencimento <strong>${val.venc || 'conforme apuração dos resultados'}</strong>.</p>
      ${val.cond ? `<p>3.3. Condições especiais: ${val.cond}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Confidencialidade</div><div class="clausula-body">
      <p>4.1. As partes comprometem-se a manter sigilo sobre todas as informações estratégicas, comerciais e financeiras obtidas em razão desta parceria, durante toda a vigência e por 2 (dois) anos após o encerramento.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Rescisão</div><div class="clausula-body">
      <p>5.1. A parceria poderá ser encerrada por qualquer das partes mediante aviso prévio de <strong>${jur.rescisao}</strong>, devendo as obrigações em curso ser finalizadas.</p>
      <p>5.2. O encerramento imotivado implicará multa de <strong>${jur.multa_resc}</strong>.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este instrumento não gera vínculo societário entre as partes. Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARCEIRO A</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARCEIRO B</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ COMISSÃO / REPRESENTAÇÃO COMERCIAL ════

  return null;
};
