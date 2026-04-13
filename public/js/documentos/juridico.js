// ════════════════════════════════════════════════════════════════
//  js/documentos/juridico.js — Documentos Jurídicos e Compliance
//  Tipos: lgpd_termo, politica_priv, termo_uso, notif_extra, acordo_amigavel
//  Carregado via <script> — usa window.DocHelpers
// ════════════════════════════════════════════════════════════════

window.DocJuridico = function buildJuridico(t, params) {
  const { partyLine, aviso, cabecalho, roman, signaturas } = window.DocHelpers;
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params;
  const head = cabecalho(num, docTitle);

  // ════ LGPD / PRIVACIDADE / TERMOS DE USO ════
  if (['lgpd_termo','politica_priv','termo_uso'].includes(t)) {
    const titulos = {
      lgpd_termo: 'Termo de Consentimento para Tratamento de Dados Pessoais',
      politica_priv: 'Política de Privacidade',
      termo_uso: 'Termos de Uso da Plataforma',
    };
    return `${head}
    <div class="doc-subtitle">${titulos[t]} · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Responsável pelo Tratamento</div>
      <div class="party"><div class="party-role">CONTROLADOR DOS DADOS:</div><p>${partyLine(pa,'EMPRESA/RESPONSÁVEL')}</p></div>
    </div>
    ${t === 'lgpd_termo' ? `
    <div class="clausula"><div class="clausula-title">1. Finalidade do Tratamento</div><div class="clausula-body">
      <p>O(A) CONTROLADOR(A) acima identificado(a) trata dados pessoais do titular para as seguintes finalidades: <strong>${obj.desc}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Dados Coletados</div><div class="clausula-body">
      <p>Serão coletados os seguintes dados: <strong>${obj.entregaveis || 'nome, e-mail, CPF e demais dados necessários para a prestação do serviço'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Direitos do Titular</div><div class="clausula-body">
      <p>Nos termos da Lei nº 13.709/2018 (LGPD), o titular tem direito a: (a) confirmação de tratamento; (b) acesso aos dados; (c) correção; (d) anonimização ou eliminação; (e) portabilidade; (f) informação sobre compartilhamento; (g) revogação do consentimento a qualquer tempo.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Prazo de Conservação</div><div class="clausula-body">
      <p>Os dados serão mantidos pelo prazo de <strong>${vigText}</strong> ou pelo tempo necessário ao cumprimento das finalidades descritas, exceto quando houver obrigação legal de guarda por prazo superior.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">5. Consentimento</div><div class="clausula-body">
      <p>O titular declara ter lido e compreendido este termo, consentindo livremente com o tratamento de seus dados pessoais conforme descrito acima, nos termos do art. 8º da LGPD.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome || 'TITULAR DOS DADOS'}</div><div class="sig-role">TITULAR</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTROLADOR</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
      </div>
    </div>` : `
    <div class="clausula"><div class="clausula-title">1. Sobre ${t === 'politica_priv' ? 'a Política de Privacidade' : 'os Termos de Uso'}</div><div class="clausula-body">
      <p>Este documento regula: <strong>${obj.desc}</strong></p>
      <p>Vigência: ${vigText} | Última atualização: ${dateStr}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. ${t === 'politica_priv' ? 'Dados Coletados e Finalidade' : 'Uso da Plataforma'}</div><div class="clausula-body">
      <p>${obj.obrig_a || (t === 'politica_priv' ? 'Coletamos dados necessários para prestação dos serviços, conforme a Lei nº 13.709/2018 (LGPD).' : 'O uso da plataforma implica aceitação integral destes termos.')}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Responsabilidades</div><div class="clausula-body">
      <p>${obj.obrig_b || 'As partes comprometem-se a respeitar a legislação aplicável e as disposições deste documento.'}</p>
      ${obj.entregaveis ? `<p>${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Contato e Atualizações</div><div class="clausula-body">
      <p>Para dúvidas: <strong>${pa.email || 'contato a ser informado'}</strong>. Este documento pode ser atualizado a qualquer momento, com aviso prévio aos usuários.</p>
    </div></div>`}
    ${aviso}`;
  }

  // ════ NOTIFICAÇÃO EXTRAJUDICIAL ════
  if (t === 'notif_extra') {
    return `${head}
    <div class="doc-subtitle">Notificação Extrajudicial · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação das Partes</div>
      <div class="party"><div class="party-role">NOTIFICANTE:</div><p>${partyLine(pa,'NOTIFICANTE')}</p></div>
      <div class="party"><div class="party-role">NOTIFICADO:</div><p>${partyLine(pb,'NOTIFICADO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Da Notificação</div><div class="clausula-body">
      <p>O(A) NOTIFICANTE, por meio do presente instrumento, notifica formalmente o(a) NOTIFICADO(A) a respeito de: <strong>${obj.desc}</strong></p>
      <p>${obj.obrig_a || 'O NOTIFICADO deverá adotar as providências cabíveis no prazo de <strong>' + (jur.rescisao || '15 dias') + '</strong> a contar do recebimento desta notificação.'}</p>
      ${obj.entregaveis ? `<p>${obj.entregaveis}</p>` : ''}
      <p>O não atendimento desta notificação no prazo estipulado implicará a adoção das medidas legais cabíveis, incluindo as de ordem judicial, com todos os ônus decorrentes ao NOTIFICADO.</p>
      <p>Esta notificação serve como prova do conhecimento formal pelo NOTIFICADO sobre os fatos e exigências aqui descritos.</p>
      ${jur.extra ? `<p>${jur.extra}</p>` : ''}
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">NOTIFICANTE</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">Ciente: ${pb.nome}</div><div class="sig-role">NOTIFICADO</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO AMIGÁVEL ════
  if (t === 'acordo_amigavel') {
    return `${head}
    <div class="doc-subtitle">Instrumento de Acordo Amigável entre Partes · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARTE A:</div><p>${partyLine(pa,'PARTE A')}</p></div>
      <div class="party"><div class="party-role">PARTE B:</div><p>${partyLine(pb,'PARTE B')}</p></div>
    </div>
    <p>As partes, de comum acordo e sem necessidade de intervenção judicial, celebram o presente instrumento de composição amigável:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto do Acordo</div><div class="clausula-body">
      <p>1.1. As partes acordam a resolução amigável relativa a: <strong>${obj.desc}</strong></p>
      <p>1.2. Ficam acordadas as seguintes obrigações: ${obj.obrig_a && obj.obrig_b ? `<br>— PARTE A: ${obj.obrig_a}<br>— PARTE B: ${obj.obrig_b}` : obj.entregaveis || 'conforme negociado entre as partes'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Pagamento</div><div class="clausula-body">
      <p>2.1. Fica acordado o pagamento de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.2. O descumprimento das obrigações acordadas acarretará multa de <strong>${val.multa}</strong> sobre o valor em atraso.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Quitação</div><div class="clausula-body">
      <p>3.1. O cumprimento integral deste acordo implica plena, geral e irrevogável quitação recíproca entre as partes, relativamente ao objeto aqui descrito, nada mais tendo a reclamar uma da outra a qualquer título.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARTE A</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARTE B</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ CONTRATO SOCIAL ════
  if (t === 'contrato_social') {

  return null;
};
