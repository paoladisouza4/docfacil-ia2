// ════════════════════════════════════════════════════════════════
//  js/documentos/contratos.js — Contratos de Prestação de Serviços e Parcerias
//  Tipos: servico, freelancer, trabalho_pj, autonomo, nda, influenciador, compravenda, parceria, comissao
//  Carregado via <script> — usa window.DocHelpers
// ════════════════════════════════════════════════════════════════

window.DocContratos = function buildContrato(t, params) {
  const { partyLine, aviso, cabecalho, roman, signaturas } = window.DocHelpers;
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params;
  const head = cabecalho(num, docTitle);

  // ════ NDA / CONFIDENCIALIDADE ════
  if (t === 'nda') {
    return `${head}
    <div class="doc-subtitle">Acordo de Não-Divulgação — Non-Disclosure Agreement · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARTE DIVULGANTE:</div><p>${partyLine(pa,'PARTE DIVULGANTE')}</p></div>
      <div class="party"><div class="party-role">PARTE RECEPTORA:</div><p>${partyLine(pb,'PARTE RECEPTORA')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Confidencialidade, comprometendo-se a observar as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Das Informações Confidenciais</div><div class="clausula-body">
      <p>1.1. Consideram-se confidenciais todas as informações relacionadas a: <strong>${obj.desc}</strong>, incluindo, mas não se limitando a: dados técnicos, financeiros, comerciais, estratégicos, segredos de negócio, know-how, projetos, planos, códigos-fonte e quaisquer outros dados revelados por uma parte à outra.</p>
      <p>1.2. As obrigações de confidencialidade não se aplicam a informações que: (a) sejam ou se tornem de domínio público sem culpa da Parte Receptora; (b) já eram de conhecimento da Parte Receptora antes da divulgação; (c) sejam exigidas por determinação judicial ou legal.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
      <p>2.1. A PARTE RECEPTORA compromete-se a: (a) manter as informações confidenciais em sigilo absoluto; (b) não divulgar, reproduzir ou utilizar as informações para fins outros que não os previstos neste acordo; (c) restringir o acesso às informações apenas às pessoas que necessitem conhecê-las para os fins acordados.</p>
      <p>2.2. A vigência das obrigações de sigilo é de <strong>${vigText}</strong>, a contar da data de assinatura deste instrumento.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Das Penalidades</div><div class="clausula-body">
      <p>3.1. O descumprimento das obrigações deste acordo sujeitará a parte infratora ao pagamento de multa de <strong>R$ ${val.total || '10.000,00'}</strong>, sem prejuízo de perdas e danos apurados em juízo e demais sanções legais cabíveis.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Do Foro</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARTE DIVULGANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARTE RECEPTORA</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ FREELANCER / PRESTAÇÃO DE SERVIÇOS / PJ / AUTÔNOMO ════
  if (['servico','freelancer','trabalho_pj','autonomo'].includes(t)) {
    const tipoContrato = t === 'freelancer' ? 'Freelancer' : t === 'trabalho_pj' ? 'Trabalho PJ' : t === 'autonomo' ? 'Autônomo' : 'Prestação de Serviços';
    return `${head}
    <div class="doc-subtitle">Instrumento Particular de ${tipoContrato} · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CONTRATANTE:</div><p>${partyLine(pa,'CONTRATANTE')}</p></div>
      <div class="party"><div class="party-role">CONTRATADO:</div><p>${partyLine(pb,'CONTRATADO')}</p></div>
    </div>
    <p>As partes celebram o presente instrumento mediante as seguintes cláusulas e condições, ficando expressamente acordado que a presente relação é de natureza civil, não gerando qualquer vínculo empregatício entre as partes, nos termos do art. 593 e seguintes do Código Civil:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O CONTRATADO prestará ao CONTRATANTE os seguintes serviços: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Entregáveis: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} Os serviços serão prestados ${vigText}, com início em <strong>${obj.inicio}</strong>${obj.fim !== 'indeterminado' ? ` e término em <strong>${obj.fim}</strong>` : ''}, no local: <strong>${obj.local || 'a ser definido entre as partes'}</strong>.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações do Contratante</div><div class="clausula-body">
      <p>2.1. Compete ao CONTRATANTE: ${obj.obrig_a || 'efetuar o pagamento nos prazos estabelecidos; fornecer as informações e subsídios necessários à execução dos serviços; comunicar ao CONTRATADO eventuais alterações no escopo com antecedência mínima de 5 dias úteis'}.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do Contratado</div><div class="clausula-body">
      <p>3.1. Compete ao CONTRATADO: ${obj.obrig_b || 'executar os serviços com qualidade, diligência e nos prazos acordados; manter o CONTRATANTE informado sobre o andamento dos trabalhos; responsabilizar-se pelos impostos e contribuições decorrentes de sua atividade autônoma'}.</p>
      <p>3.2. O CONTRATADO declara possuir plena capacidade técnica para a prestação dos serviços ora contratados, respondendo por eventuais falhas na execução.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Remuneração</div><div class="clausula-body">
      <p>4.1. Pela prestação dos serviços, o CONTRATANTE pagará ao CONTRATADO o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, com vencimento em <strong>${val.venc}</strong>.</p>
      <p>4.2. O pagamento será realizado mediante: <strong>${val.banco || 'dados bancários a serem informados pelo CONTRATADO'}</strong>.</p>
      ${val.reajuste ? `<p>4.3. O valor será reajustado pelo índice <strong>${val.reajuste}</strong>.</p>` : ''}
      <p>${val.reajuste ? '4.4.' : '4.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de mora de <strong>${val.juros}</strong>, nos termos do art. 395 do Código Civil.</p>
      ${val.cond ? `<p>Condições especiais: ${val.cond}.</p>` : ''}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula V — Da Rescisão</div><div class="clausula-body">
      <p>5.1. Qualquer das partes poderá rescindir o presente instrumento mediante notificação escrita com antecedência mínima de <strong>${jur.rescisao}</strong>.</p>
      <p>5.2. A rescisão imotivada implicará multa de <strong>${jur.multa_resc}</strong>.</p>
      <p>5.3. Em caso de rescisão por descumprimento, a parte faltosa responderá por perdas e danos.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Ausência de Vínculo Empregatício</div><div class="clausula-body">
      <p>6.1. O presente instrumento não gera vínculo empregatício, societário ou associativo entre as partes. O CONTRATADO exercerá suas atividades com autonomia, podendo prestar serviços a outros clientes, desde que não haja conflito de interesses com o CONTRATANTE.</p>
      <p>6.2. O CONTRATADO é responsável pelo recolhimento de seus próprios tributos, previdência social e demais encargos decorrentes de sua atividade.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este instrumento é regido pelo Código Civil (Lei nº 10.406/2002). Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTRATANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">CONTRATADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ INFLUENCIADOR DIGITAL ════
  if (t === 'influenciador') {
    return `${head}
    <div class="doc-subtitle">Instrumento Particular de Parceria Comercial com Influenciador Digital · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CONTRATANTE (MARCA/EMPRESA):</div><p>${partyLine(pa,'CONTRATANTE')}</p></div>
      <div class="party"><div class="party-role">INFLUENCIADOR DIGITAL:</div><p>${partyLine(pb,'INFLUENCIADOR')}</p></div>
    </div>
    <p>As partes celebram o presente instrumento de parceria comercial para criação e divulgação de conteúdo digital, conforme as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto e Escopo da Parceria</div><div class="clausula-body">
      <p>1.1. O INFLUENCIADOR compromete-se a criar e publicar conteúdo digital promovendo: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Entregáveis: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} A parceria vigorará ${vigText}, com início em <strong>${obj.inicio}</strong>.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações do Influenciador</div><div class="clausula-body">
      <p>2.1. O INFLUENCIADOR compromete-se a: (a) criar conteúdo autêntico e alinhado com as diretrizes da marca; (b) identificar o conteúdo patrocinado conforme as normas do CONAR e BACEN; (c) não associar a marca a conteúdos polêmicos, ofensivos ou que violem a legislação; (d) manter as métricas e resultados informados ao CONTRATANTE.</p>
      <p>2.2. O INFLUENCIADOR declara ser titular dos canais/perfis utilizados e possuir audiência verdadeira, respondendo por quaisquer irregularidades neste sentido.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Da Remuneração</div><div class="clausula-body">
      <p>3.1. Pela execução da parceria, o CONTRATANTE pagará ao INFLUENCIADOR o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      ${val.cond ? `<p>3.2. Condições especiais: ${val.cond}.</p>` : ''}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Dos Direitos Autorais</div><div class="clausula-body">
      <p>4.1. O CONTRATANTE terá direito de uso do conteúdo produzido pelo INFLUENCIADOR pelo período de <strong>${vigText}</strong>, podendo ser prorrogado mediante acordo entre as partes e pagamento adicional a ser negociado.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTRATANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">INFLUENCIADOR DIGITAL</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ COMPRA E VENDA ════
  if (t === 'compravenda') {
    return `${head}
    <div class="doc-subtitle">Instrumento Particular de Compra e Venda · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">VENDEDOR:</div><p>${partyLine(pa,'VENDEDOR')}</p></div>
      <div class="party"><div class="party-role">COMPRADOR:</div><p>${partyLine(pb,'COMPRADOR')}</p></div>
    </div>
    <p>As partes celebram o presente Contrato de Compra e Venda, nos termos dos arts. 481 a 532 do Código Civil (Lei nº 10.406/2002), mediante as seguintes cláusulas:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O VENDEDOR vende ao COMPRADOR, em caráter irrevogável e irretratável: <strong>${obj.desc}</strong></p>
      <p>1.2. O bem objeto deste contrato é vendido no estado em que se encontra, sendo de responsabilidade do COMPRADOR verificar suas condições antes da assinatura.</p>
      ${obj.entregaveis ? `<p>1.3. Características adicionais: ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Preço e Forma de Pagamento</div><div class="clausula-body">
      <p>2.1. O preço total da venda é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pago <strong>${val.forma}</strong>.</p>
      <p>2.2. O pagamento será efetuado mediante: <strong>${val.banco || 'dados a serem informados pelo VENDEDOR'}</strong>.</p>
      ${val.cond ? `<p>2.3. Condições especiais: ${val.cond}</p>` : ''}
      <p>${val.cond ? '2.4.' : '2.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de mora de <strong>${val.juros}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Entrega e Transferência</div><div class="clausula-body">
      <p>3.1. O bem será entregue ao COMPRADOR em <strong>${obj.fim !== 'indeterminado' ? obj.fim : obj.inicio}</strong>, no local: <strong>${obj.local || 'a ser acordado entre as partes'}</strong>.</p>
      <p>3.2. A transferência definitiva da propriedade ocorrerá após o pagamento integral do preço. Até lá, o bem permanece em nome do VENDEDOR.</p>
      <p>3.3. As despesas de transferência, registro e tributos incidentes sobre a transação serão de responsabilidade do <strong>COMPRADOR</strong>, salvo acordo em contrário.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Garantias</div><div class="clausula-body">
      <p>4.1. O VENDEDOR garante que o bem está livre e desembaraçado de quaisquer ônus, dívidas, hipotecas ou restrições, respondendo por eventuais vícios ocultos nos termos do art. 441 do Código Civil.</p>
      <p>4.2. O VENDEDOR responde pela evicção, nos termos dos arts. 447 a 457 do Código Civil.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">VENDEDOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">COMPRADOR</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ PARCERIA COMERCIAL ════
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
  if (t === 'comissao') {
    return `${head}
    <div class="doc-subtitle">Instrumento Particular de Representação Comercial e Comissão · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">COMITENTE (Empresa):</div><p>${partyLine(pa,'COMITENTE')}</p></div>
      <div class="party"><div class="party-role">COMISSIONADO (Representante):</div><p>${partyLine(pb,'COMISSIONADO')}</p></div>
    </div>
    <p>As partes celebram o presente Contrato de Representação Comercial, nos termos da Lei nº 4.886/1965 e alterações:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O COMISSIONADO fica autorizado a representar comercialmente o COMITENTE na venda de: <strong>${obj.desc}</strong></p>
      <p>1.2. Área de atuação: <strong>${obj.local || 'todo o território nacional'}</strong>.</p>
      <p>1.3. A representação vigorará ${vigText}, a partir de <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Comissão</div><div class="clausula-body">
      <p>2.1. O COMISSIONADO receberá comissão de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) ou equivalente a <strong>${val.forma}</strong> sobre as vendas realizadas.</p>
      <p>2.2. O pagamento das comissões ocorrerá <strong>${val.venc || 'mensalmente até o 10º dia do mês subsequente'}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.3. As comissões são devidas no momento da efetivação do pagamento pelo cliente final ao COMITENTE.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do Comissionado</div><div class="clausula-body">
      <p>3.1. O COMISSIONADO compromete-se a: (a) promover ativamente as vendas dos produtos/serviços do COMITENTE; (b) manter relacionamento ético com os clientes; (c) prestar contas regularmente ao COMITENTE; (d) não representar empresas concorrentes sem autorização prévia.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Rescisão</div><div class="clausula-body">
      <p>4.1. O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de <strong>${jur.rescisao}</strong>, nos termos do art. 34 da Lei nº 4.886/1965.</p>
      <p>4.2. Em caso de rescisão sem justa causa pelo COMITENTE, será devida indenização ao COMISSIONADO conforme legislação vigente.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Regido pela Lei nº 4.886/1965 e Código Civil. Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">COMITENTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">COMISSIONADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ VISTORIA DO IMÓVEL ════

  return null;
};
