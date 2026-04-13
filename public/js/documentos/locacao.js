// ════════════════════════════════════════════════════════════════
//  js/documentos/locacao.js — Contratos de Locação e Documentos Imobiliários
//  Tipos: aluguel_res, aluguel_com, locacao_simples, locacao_fiador, vistoria, notif_desocupacao, acordo_inadimpl
//  Carregado via <script> — usa window.DocHelpers
// ════════════════════════════════════════════════════════════════

window.DocLocacao = function buildLocacao(t, params) {
  const { partyLine, aviso, cabecalho, roman, signaturas } = window.DocHelpers;
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params;
  const head = cabecalho(num, docTitle);

  if (['aluguel_res','aluguel_com','locacao_simples','locacao_fiador'].includes(t)) {
    const tipoImovel = t === 'aluguel_com' ? 'comercial' : 'residencial';
    const lei = 'Lei nº 8.245/1991 (Lei do Inquilinato)';
    return `${head}
    <div class="doc-subtitle">Instrumento Particular de Locação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">LOCADOR:</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO:</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
      ${t === 'locacao_fiador' ? `<div class="party"><div class="party-role">FIADOR:</div><p>_____________________________, portador(a) do CPF nº _____________________, residente em _____________________________.</p></div>` : ''}
    </div>
    <p>As partes acima qualificadas têm entre si justo e acordado o presente Contrato de Locação, regido pela ${lei} e pelo Código Civil Brasileiro, mediante as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Imóvel Locado</div><div class="clausula-body">
      <p>1.1. O LOCADOR cede ao LOCATÁRIO, para uso exclusivamente <strong>${tipoImovel}</strong>, o imóvel localizado em: <strong>${obj.desc}</strong></p>
      <p>1.2. O imóvel é entregue em perfeitas condições de uso e habitabilidade, conforme Termo de Vistoria a ser anexado e assinado por ambas as partes no ato da entrega das chaves.</p>
      <p>1.3. É expressamente vedada a sublocação, empréstimo ou cessão do imóvel, no todo ou em parte, sem prévia e expressa autorização por escrito do LOCADOR.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Do Prazo</div><div class="clausula-body">
      <p>2.1. A locação terá prazo <strong>${vigText}</strong>, com início em <strong>${obj.inicio}</strong> e término previsto em <strong>${obj.fim}</strong>.</p>
      <p>2.2. Findo o prazo, caso nenhuma das partes manifeste intenção de encerrar o contrato, a locação prosseguirá por prazo indeterminado, podendo ser rescindida mediante aviso prévio de 30 (trinta) dias, nos termos do art. 46 da Lei do Inquilinato.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Do Aluguel e Condições de Pagamento</div><div class="clausula-body">
      <p>3.1. O aluguel mensal é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), a ser pago até o dia <strong>${val.venc}</strong> de cada mês.</p>
      <p>3.2. O pagamento será efetuado mediante: <strong>${val.banco || 'dados a serem informados pelo LOCADOR'}</strong>.</p>
      <p>3.3. O não pagamento no prazo estipulado acarretará multa moratória de <strong>${val.multa}</strong> sobre o valor do aluguel em atraso, acrescida de juros de mora de <strong>${val.juros}</strong>, calculados pro rata die, além de correção monetária pelo índice <strong>${val.reajuste || 'IGPM/FGV'}</strong>, nos termos do art. 17 da Lei do Inquilinato.</p>
      ${val.reajuste ? `<p>3.4. O valor do aluguel será reajustado anualmente pelo índice <strong>${val.reajuste}</strong>, nos termos da legislação vigente.</p>` : '<p>3.4. O valor do aluguel será reajustado anualmente pelo IGPM/FGV, nos termos da legislação vigente.</p>'}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Obrigações do Locador</div><div class="clausula-body">
      <p>4.1. São obrigações do LOCADOR: (a) entregar o imóvel em condições de uso; (b) garantir o uso pacífico do imóvel durante a locação; (c) responder pelos vícios ou defeitos anteriores à locação; (d) pagar os impostos e taxas incidentes sobre o imóvel (IPTU), salvo convenção em contrário.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula V — Das Obrigações do Locatário</div><div class="clausula-body">
      <p>5.1. São obrigações do LOCATÁRIO: (a) pagar o aluguel e os encargos no prazo convencionado; (b) utilizar o imóvel somente para uso ${tipoImovel}; (c) conservar e zelar pelo imóvel, responsabilizando-se pelos danos causados; (d) pagar as contas de consumo (água, luz, gás e demais utilidades); (e) não realizar obras ou modificações sem prévia autorização por escrito do LOCADOR; (f) restituir o imóvel ao final da locação nas mesmas condições em que o recebeu, conforme Termo de Vistoria.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Rescisão</div><div class="clausula-body">
      <p>6.1. O descumprimento de qualquer cláusula deste contrato ensejará sua rescisão imediata, sem prejuízo das penalidades cabíveis.</p>
      <p>6.2. Em caso de rescisão antecipada pelo LOCATÁRIO, será devida multa de <strong>${jur.multa_resc}</strong>, proporcional ao período faltante, nos termos do art. 4º da Lei do Inquilinato.</p>
      <p>6.3. A desocupação do imóvel deverá ser comunicada com antecedência mínima de <strong>${jur.rescisao}</strong>.</p>
    </div></div>

    ${t === 'locacao_fiador' ? `<div class="clausula"><div class="clausula-title">Cláusula VII — Da Fiança</div><div class="clausula-body">
      <p>7.1. O FIADOR acima qualificado, em caráter solidário e como principal pagador, garante o cumprimento de todas as obrigações assumidas pelo LOCATÁRIO neste instrumento, respondendo pelo pagamento do aluguel, encargos, multas e demais obrigações decorrentes deste contrato até a efetiva desocupação e entrega das chaves do imóvel.</p>
    </div></div>` : ''}

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[t === 'locacao_fiador' ? 8 : 7]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este contrato é regido pela ${lei} e pelo Código Civil (Lei nº 10.406/2002). As partes elegem o foro <strong>${jur.foro || 'Comarca do local do imóvel'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      ${t === 'locacao_fiador' ? `<div class="sig-grid"><div class="sig-item"><div class="sig-line"></div><div class="sig-name">_____________________________</div><div class="sig-role">FIADOR</div><div class="sig-doc">CPF: _____________________</div></div><div class="sig-item"></div></div>` : ''}
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ RECIBO DE PAGAMENTO ════
  // ════ VISTORIA DO IMÓVEL ════
  if (t === 'vistoria') {
    return `${head}
    <div class="doc-subtitle">Termo de Vistoria de Imóvel · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação</div>
      <div class="party"><div class="party-role">LOCADOR / PROPRIETÁRIO:</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO / OCUPANTE:</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">1. Identificação do Imóvel</div><div class="clausula-body">
      <p>Imóvel localizado em: <strong>${obj.desc}</strong></p>
      <p>Data da vistoria: <strong>${obj.inicio}</strong> | Tipo: <strong>${obj.local || 'Residencial'}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Estado de Conservação Geral</div><div class="clausula-body">
      <p>As partes declaram que o imóvel foi vistoriado e se encontra nas seguintes condições:</p>
      <p><strong>Paredes e pintura:</strong> _____________________________________________</p>
      <p><strong>Pisos e revestimentos:</strong> _____________________________________________</p>
      <p><strong>Janelas e portas:</strong> _____________________________________________</p>
      <p><strong>Instalações elétricas:</strong> _____________________________________________</p>
      <p><strong>Instalações hidráulicas:</strong> _____________________________________________</p>
      <p><strong>Telhado / Laje:</strong> _____________________________________________</p>
      <p><strong>Área externa / Jardim:</strong> _____________________________________________</p>
      ${obj.entregaveis ? `<p><strong>Observações adicionais:</strong> ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Itens Entregues</div><div class="clausula-body">
      <p>Chaves: _______ cópias | Controle de portão: _______ | Outros: _____________</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Declaração das Partes</div><div class="clausula-body">
      <p>As partes declaram que as informações acima correspondem ao estado real do imóvel na data da vistoria, comprometendo-se o LOCATÁRIO a devolvê-lo nas mesmas condições ao final da locação, salvo desgaste natural pelo uso.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR / PROPRIETÁRIO</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO / OCUPANTE</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ NOTIFICAÇÃO DE DESOCUPAÇÃO ════
  if (t === 'notif_desocupacao') {
    return `${head}
    <div class="doc-subtitle">Notificação Extrajudicial de Desocupação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação</div>
      <div class="party"><div class="party-role">NOTIFICANTE (Proprietário/Locador):</div><p>${partyLine(pa,'NOTIFICANTE')}</p></div>
      <div class="party"><div class="party-role">NOTIFICADO (Locatário/Ocupante):</div><p>${partyLine(pb,'NOTIFICADO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Da Notificação</div><div class="clausula-body">
      <p>O NOTIFICANTE, por meio do presente instrumento, notifica formalmente o NOTIFICADO para que desocupe o imóvel situado em: <strong>${obj.desc}</strong>, no prazo de <strong>${jur.rescisao || '30 (trinta) dias'}</strong>, contados do recebimento desta notificação.</p>
      <p>Motivo da notificação: <strong>${obj.local || 'encerramento do contrato de locação'}</strong>.</p>
      ${obj.entregaveis ? `<p>Observações: ${obj.entregaveis}</p>` : ''}
      <p>Caso o imóvel não seja desocupado no prazo estipulado, o NOTIFICANTE adotará as medidas judiciais cabíveis, incluindo ação de despejo, com todos os ônus decorrentes ao NOTIFICADO, nos termos da Lei nº 8.245/1991.</p>
      <p>Esta notificação serve como prova formal do aviso prévio legalmente exigido.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">NOTIFICANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">Ciente: ${pb.nome}</div><div class="sig-role">NOTIFICADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO DE INADIMPLÊNCIA ════
  if (t === 'acordo_inadimpl') {
    return `${head}
    <div class="doc-subtitle">Acordo de Regularização de Débito Locatício · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">LOCADOR (CREDOR):</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO (DEVEDOR):</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Regularização, mediante as seguintes condições:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Débito</div><div class="clausula-body">
      <p>1.1. O LOCATÁRIO reconhece o débito de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
      <p>1.2. As partes concordam que o valor acima representa o total da dívida, incluindo aluguéis, encargos, multas e juros devidos até <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Acordo de Pagamento</div><div class="clausula-body">
      <p>2.1. O LOCATÁRIO compromete-se a quitar o débito <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.2. O LOCATÁRIO compromete-se ainda a manter os aluguéis futuros em dia, sob pena de rescisão imediata deste acordo.</p>
      <p>2.3. O descumprimento deste acordo ensejará a retomada imediata das medidas judiciais pelo LOCADOR, sem necessidade de nova notificação.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Quitação Condicionada</div><div class="clausula-body">
      <p>3.1. O LOCADOR concede ao LOCATÁRIO a quitação condicionada ao cumprimento integral deste acordo. O descumprimento de qualquer parcela tornará o acordo sem efeito, restaurando integralmente o débito original.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ CARTA DE APRESENTAÇÃO ════

  return null;
};
