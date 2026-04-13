// ════════════════════════════════════════════════════════════════
//  js/documentos/declaracoes.js — Declarações, Cartas e Documentos de Trabalho
//  Tipos: decl_residencia, decl_renda, decl_informal, decl_comparec, decl_respons, decl_uniao, curriculo, carta_apres, carta_demissao, decl_experiencia, estagio
//  Carregado via <script> — usa window.DocHelpers
// ════════════════════════════════════════════════════════════════

window.DocDeclaracoes = function buildDeclaracao(t, params) {
  const { partyLine, aviso, cabecalho, roman, signaturas, sigUnica } = window.DocHelpers;
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params;
  const head = cabecalho(num, docTitle);

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
  // ════ CARTA DE APRESENTAÇÃO ════
  if (t === 'carta_apres') {
    return `${head}
    <div class="doc-subtitle">${dateStr}</div>
    <div style="margin-bottom:24px;">
      <p><strong>${pa.nome}</strong>${pa.prof ? ' — ' + pa.prof : ''}</p>
      ${pa.end ? `<p>${pa.end}</p>` : ''}
      ${pa.tel ? `<p>Tel.: ${pa.tel}</p>` : ''}
      ${pa.email ? `<p>E-mail: ${pa.email}</p>` : ''}
    </div>
    <div style="margin-bottom:24px;">
      <p>A/C: <strong>${pb.nome || 'Responsável de Recursos Humanos'}</strong></p>
      ${pb.end ? `<p>${pb.end}</p>` : ''}
    </div>
    <p><strong>Assunto: ${obj.desc || 'Carta de Apresentação Profissional'}</strong></p><br>
    <div class="clausula"><div class="clausula-body">
      <p>Prezado(a) ${pb.nome || 'Senhor(a)'},</p>
      <p>Venho, por meio desta carta, apresentar-me como candidato(a) à oportunidade em sua empresa. Sou <strong>${pa.nome}</strong>, ${pa.prof ? pa.prof + ', ' : ''}com ${obj.local || 'experiência na área'}.</p>
      <p>${obj.obrig_a || 'Ao longo da minha trajetória profissional, desenvolvi competências que acredito serem relevantes para contribuir com os objetivos de sua organização. Tenho interesse genuíno em fazer parte de sua equipe e acredito que meu perfil se alinha aos valores e necessidades da empresa.'}</p>
      <p>${obj.obrig_b || 'Coloco-me à disposição para uma entrevista, quando poderemos conversar mais detalhadamente sobre como posso agregar valor à sua equipe.'}</p>
      <p>Agradeço a atenção dispensada e aguardo um retorno.</p>
    </div></div>
    <div style="margin-top:40px;">
      <p>Atenciosamente,</p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p><strong>${pa.nome}</strong></p>
      ${pa.prof ? `<p>${pa.prof}</p>` : ''}
    </div>
    ${aviso}`;
  }

  // ════ CARTA DE DEMISSÃO ════
  if (t === 'carta_demissao') {
    return `${head}
    <div class="doc-subtitle">${dateStr}</div>
    <div style="margin-bottom:24px;">
      <p>De: <strong>${pa.nome}</strong>${pa.prof ? ' — ' + pa.prof : ''}</p>
      <p>Para: <strong>${pb.nome || 'Departamento de Recursos Humanos'}</strong></p>
    </div>
    <p><strong>Assunto: Pedido de Demissão</strong></p><br>
    <div class="clausula"><div class="clausula-body">
      <p>Prezado(a) ${pb.nome || 'Senhor(a)'},</p>
      <p>Venho, por meio desta carta, formalizar meu pedido de demissão do cargo de <strong>${pa.prof || 'cargo que ocupo'}</strong> nesta empresa, a partir desta data.</p>
      <p>${obj.desc || 'Esta decisão foi tomada após cuidadosa reflexão sobre minha trajetória profissional e objetivos de carreira. Agradeço imensamente pela oportunidade de crescimento e aprendizado proporcionados durante meu período na empresa.'}</p>
      <p>Comprometo-me a cumprir o aviso prévio de <strong>${jur.rescisao || '30 (trinta) dias'}</strong>, conforme previsto em contrato e na legislação trabalhista vigente, garantindo a plena transição das minhas responsabilidades.</p>
      <p>Agradeço a todos os colegas e lideranças pela convivência e peço que confirmem o recebimento desta carta.</p>
    </div></div>
    <div style="margin-top:40px;">
      <p>Respeitosamente,</p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p><strong>${pa.nome}</strong></p>
      <p>CPF: ${pa.doc}</p>
      <p>${dateStr}</p>
    </div>
    <div style="margin-top:30px;padding:16px;border:1px solid #ddd;border-radius:4px;">
      <p><strong>Ciente:</strong></p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p>${pb.nome || 'Representante da Empresa'}</p>
      <p>Data: ___/___/______</p>
    </div>
    ${aviso}`;
  }

  // ════ DECLARAÇÃO DE EXPERIÊNCIA ════
  if (t === 'decl_experiencia') {
    return `${head}
    <div class="doc-subtitle">${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados da Empresa Declarante</div>
      <div class="party"><div class="party-role">EMPRESA:</div><p>${partyLine(pa,'EMPRESA')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Declaração de Experiência Profissional</div><div class="clausula-body">
      <p>Declaramos, para os devidos fins, que <strong>${pb.nome}</strong>, portador(a) do CPF nº <strong>${pb.doc}</strong>, prestou serviços a esta empresa no cargo/função de <strong>${pb.prof || obj.desc}</strong>, pelo período de <strong>${obj.inicio}</strong> a <strong>${obj.fim !== 'indeterminado' ? obj.fim : 'atual'}</strong>.</p>
      <p>Durante o período mencionado, o(a) profissional demonstrou: <strong>${obj.obrig_b || 'competência técnica, comprometimento e responsabilidade no exercício de suas funções'}</strong>.</p>
      ${obj.entregaveis ? `<p>Atividades desenvolvidas: ${obj.entregaveis}</p>` : ''}
      <p>Esta declaração é fornecida a pedido do(a) interessado(a) para os fins que se fizerem necessários, sendo verdadeiras todas as informações aqui prestadas.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">Representante Legal</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ESTÁGIO ════
  if (t === 'estagio') {
    return `${head}
    <div class="doc-subtitle">Termo de Compromisso de Estágio · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">EMPRESA CONCEDENTE:</div><p>${partyLine(pa,'EMPRESA CONCEDENTE')}</p></div>
      <div class="party"><div class="party-role">ESTAGIÁRIO(A):</div><p>${partyLine(pb,'ESTAGIÁRIO')}</p></div>
    </div>
    <p>As partes celebram o presente Termo de Compromisso de Estágio, nos termos da Lei nº 11.788/2008 (Lei do Estágio), mediante as seguintes condições:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Estágio</div><div class="clausula-body">
      <p>1.1. A EMPRESA CONCEDENTE recebe o(a) ESTAGIÁRIO(A) para realização de estágio na área de: <strong>${obj.desc}</strong></p>
      <p>1.2. O estágio terá duração de <strong>${vigText}</strong>, com início em <strong>${obj.inicio}</strong> e término em <strong>${obj.fim}</strong>, conforme art. 11 da Lei nº 11.788/2008.</p>
      <p>1.3. Carga horária: <strong>${obj.local || '6 horas diárias, 30 horas semanais'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Bolsa-Auxílio</div><div class="clausula-body">
      <p>2.1. Será paga ao(à) ESTAGIÁRIO(A) bolsa-auxílio no valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, além de auxílio-transporte conforme legislação vigente.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações</div><div class="clausula-body">
      <p>3.1. A EMPRESA CONCEDENTE compromete-se a: oferecer atividades compatíveis com a área de formação do estagiário; designar supervisor responsável; garantir condições de segurança; conceder recesso de 30 dias a cada 12 meses.</p>
      <p>3.2. O(A) ESTAGIÁRIO(A) compromete-se a: cumprir a carga horária estabelecida; zelar pelo sigilo das informações da empresa; cumprir as normas internas da empresa.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>O presente estágio não gera vínculo empregatício, nos termos do art. 3º da Lei nº 11.788/2008. Foro: <strong>${jur.foro}</strong>.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">EMPRESA CONCEDENTE</div><div class="sig-doc">CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">ESTAGIÁRIO(A)</div><div class="sig-doc">CPF: ${pb.doc}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ NOTA SIMPLES DE SERVIÇO ════

  // Currículo — preview profissional
  if (t === 'curriculo') {
    return `
    <div style="font-family:'Georgia',serif;max-width:680px;margin:0 auto;padding:32px;">

      <div style="border-bottom:3px solid #c9a96e;padding-bottom:16px;margin-bottom:20px;">
        <div style="font-size:26px;font-weight:700;color:#1a1a1a;letter-spacing:-0.5px;">${pa.nome || 'Nome do Candidato'}</div>
        <div style="font-size:13px;color:#888;margin-top:4px;">${pa.prof || ''}</div>
        <div style="font-size:12px;color:#aaa;margin-top:8px;display:flex;flex-wrap:wrap;gap:12px;">
          ${pa.tel   ? `<span>📞 ${pa.tel}</span>` : ''}
          ${pa.email ? `<span>✉️ ${pa.email}</span>` : ''}
          ${pa.end   ? `<span>📍 ${pa.end}</span>` : ''}
          ${obj.local && !obj.local.includes('São Paulo - SP ou Remoto') ? `<span>🔗 ${obj.local}</span>` : ''}
        </div>
      </div>

      ${obj.obrig_a ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;margin-bottom:6px;">Objetivo Profissional</div>
        <div style="font-size:13px;color:#333;line-height:1.7;">${obj.obrig_a.replace(/
/g,'<br>')}</div>
      </div>` : ''}

      ${obj.desc && obj.desc !== 'objeto conforme acordado entre as partes' ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;margin-bottom:6px;">Experiência Profissional</div>
        <div style="font-size:13px;color:#333;line-height:1.7;white-space:pre-wrap;">${obj.desc}</div>
      </div>` : ''}

      ${obj.entregaveis ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a96e;margin-bottom:6px;">Formação e Competências</div>
        <div style="font-size:13px;color:#333;line-height:1.7;white-space:pre-wrap;">${obj.entregaveis}</div>
      </div>` : ''}

      <div style="margin-top:24px;padding-top:12px;border-top:1px dashed #ddd;font-size:9px;color:#bbb;text-align:center;">
        Gerado pelo DocFácil · modelo de referência · não constitui assessoria jurídica
      </div>
    </div>`;
  }

  return null;
};
