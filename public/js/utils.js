// ════════════════════════════════════════════════════════════════
//  js/utils.js — Funções utilitárias compartilhadas
//  valorExtenso, formatDate, formatCurrency, buildExtraClause, etc.
// ════════════════════════════════════════════════════════════════

function buildExtraClause(clause, num, pa, pb) {
  const R = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII'];
  const bodies = {
    lgpd:`<p>${num}.1. As partes comprometem-se a tratar dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018), sendo vedado o compartilhamento com terceiros sem autorização expressa do titular.</p><p>${num}.2. Os dados coletados serão utilizados exclusivamente para as finalidades deste instrumento, devendo ser eliminados após o término da relação contratual, salvo obrigação legal.</p>`,
    exclusividade:`<p>${num}.1. Durante a vigência, o <strong>${pb.nome}</strong> compromete-se a não prestar serviços idênticos a concorrentes diretos do <strong>${pa.nome}</strong>, salvo autorização expressa e por escrito.</p><p>${num}.2. A violação sujeitará a parte infratora ao pagamento de multa compensatória, além de perdas e danos apuráveis.</p>`,
    propriedade:`<p>${num}.1. Todos os produtos, obras, criações e resultados intelectuais decorrentes deste instrumento serão de titularidade exclusiva do <strong>${pa.nome}</strong>, nos termos da Lei nº 9.610/1998.</p><p>${num}.2. O <strong>${pb.nome}</strong> cede e transfere irrevogavelmente todos os direitos patrimoniais sobre as criações desenvolvidas.</p>`,
    sigilo:`<p>${num}.1. As partes obrigam-se a manter absoluto sigilo sobre informações confidenciais obtidas em razão deste instrumento, incluindo dados financeiros, estratégias comerciais e informações técnicas.</p><p>${num}.2. A obrigação de sigilo persiste por 5 (cinco) anos após o término deste instrumento.</p>`,
    subcontratacao:`<p>${num}.1. É vedado ao <strong>${pb.nome}</strong> subcontratar, no todo ou em parte, o objeto deste instrumento sem prévia e expressa anuência por escrito do <strong>${pa.nome}</strong>.</p>`,
    reembolso:`<p>${num}.1. Despesas operacionais previamente aprovadas pelo <strong>${pa.nome}</strong> serão reembolsadas mediante comprovantes fiscais, no prazo de 15 (quinze) dias úteis após a apresentação.</p>`,
    garantia:`<p>${num}.1. O <strong>${pb.nome}</strong> garante a qualidade dos serviços/produtos por 90 (noventa) dias, comprometendo-se a corrigir vícios ou defeitos sem custo adicional para o <strong>${pa.nome}</strong>.</p>`,
    forca_maior:`<p>${num}.1. As partes não serão responsabilizadas por descumprimento decorrente de caso fortuito ou força maior, nos termos do art. 393 do Código Civil.</p><p>${num}.2. A parte afetada deve comunicar o evento no prazo de 48 (quarenta e oito) horas, com documentação comprobatória disponível.</p>`,
    antisuborno:`<p>${num}.1. As partes declaram conhecer e estar em conformidade com a Lei Anticorrupção (Lei nº 12.846/2013), comprometendo-se a não praticar atos de corrupção, suborno ou conduta que viole a legislação vigente.</p>`,
    resolucao:`<p>${num}.1. As partes poderão, de comum acordo, resolver antecipadamente este instrumento, mediante notificação escrita com antecedência mínima de 15 (quinze) dias, sem penalidades, desde que obrigações pendentes estejam regularizadas.</p>`,
    penalidade:`<p>${num}.1. O descumprimento de qualquer obrigação sujeitará a parte infratora ao pagamento de multa de 10% (dez por cento) sobre o valor total do contrato, sem prejuízo das perdas e danos apuráveis.</p>`,
    testemunha:`<p>${num}.1. Este instrumento é firmado na presença de 2 (duas) testemunhas instrumentárias, que dão fé da identidade das partes e da validade das assinaturas.</p>`,
  };
  return `<div class="clausula"><div class="clausula-title">Cláusula ${R[num] || num} — ${clause.name}</div><div class="clausula-body">${bodies[clause.id] || `<p>${num}.1. ${clause.desc}.</p>`}</div></div>`;
}

function getDocTitle(type) {
  const t = {
    servico:'Contrato de Prestação de Serviços', trabalho_pj:'Contrato de Trabalho PJ / Autônomo',
    aluguel_res:'Contrato de Locação Residencial', aluguel_com:'Contrato de Locação Comercial',
    compravenda:'Contrato de Compra e Venda', parceria:'Contrato de Parceria Comercial',
    freelancer:'Contrato de Prestação de Serviços Freelancer',
    influenciador:'Contrato de Parceria com Influenciador Digital',
    nda:'Acordo de Confidencialidade e Não-Divulgação (NDA)',
    comissao:'Contrato de Representação Comercial e Comissão',
    locacao_simples:'Contrato de Locação de Imóvel', locacao_fiador:'Contrato de Locação com Fiador',
    recibo_aluguel:'Recibo de Pagamento de Aluguel', vistoria:'Termo de Vistoria de Imóvel',
    notif_desocupacao:'Notificação de Desocupação de Imóvel', acordo_inadimpl:'Acordo de Regularização de Inadimplência',
    curriculo:'Currículo Profissional', carta_apres:'Carta de Apresentação Profissional',
    carta_demissao:'Carta de Pedido de Demissão',
    decl_experiencia:'Declaração de Experiência e Tempo de Serviço',
    estagio:'Termo de Compromisso de Estágio', autonomo:'Acordo de Prestação de Serviços Autônomos',
    decl_residencia:'Declaração de Residência', decl_renda:'Declaração de Renda Mensal',
    decl_informal:'Declaração de Trabalho Informal', decl_comparec:'Declaração de Comparecimento',
    decl_respons:'Declaração de Responsabilidade', decl_uniao:'Declaração de União Estável',
    recibo:'Recibo de Pagamento', quitacao:'Termo de Quitação de Débito',
    confissao_divida:'Confissão de Dívida', parcelamento:'Acordo de Parcelamento de Dívida',
    nota_servico:'Nota Simples de Prestação de Serviço',
    lgpd_termo:'Termo de Consentimento e Tratamento de Dados (LGPD)',
    politica_priv:'Política de Privacidade', termo_uso:'Termos de Uso',
    notif_extra:'Notificação Extrajudicial', acordo_amigavel:'Acordo Amigável entre Partes',
    abertura_empresa:'Requerimento de Abertura de Empresa',
    contrato_social:'Contrato Social', acordo_socios:'Acordo entre Sócios',
    termo_invest:'Termo de Investimento', plano_parceria:'Plano de Parceria Comercial',
  };
  return t[type] || 'Documento Profissional';
}

function getRoleA(type) {
  const r = {
    aluguel_res:'LOCADOR', aluguel_com:'LOCADOR', locacao_simples:'LOCADOR', locacao_fiador:'LOCADOR',
    compravenda:'VENDEDOR', trabalho_pj:'CONTRATANTE', freelancer:'CONTRATANTE',
    influenciador:'CONTRATANTE', nda:'PARTE DIVULGANTE', comissao:'COMITENTE',
    recibo:'PAGANTE', recibo_aluguel:'LOCADOR', quitacao:'CREDOR',
    confissao_divida:'CREDOR', parcelamento:'CREDOR', autonomo:'CONTRATANTE',
    estagio:'EMPRESA CONCEDENTE', acordo_socios:'SÓCIO A', parceria:'PARCEIRO A',
    plano_parceria:'PARTE A', notif_extra:'NOTIFICANTE', acordo_amigavel:'PARTE A',
    termo_invest:'INVESTIDOR', contrato_social:'SÓCIO ADMINISTRADOR',
  };
  return r[type] || 'CONTRATANTE';
}

function getRoleB(type) {
  const r = {
    aluguel_res:'LOCATÁRIO', aluguel_com:'LOCATÁRIO', locacao_simples:'LOCATÁRIO', locacao_fiador:'LOCATÁRIO',
    compravenda:'COMPRADOR', trabalho_pj:'CONTRATADO', freelancer:'FREELANCER',
    influenciador:'INFLUENCIADOR', nda:'PARTE RECEPTORA', comissao:'COMISSIONADO',
    recibo:'BENEFICIÁRIO', recibo_aluguel:'LOCATÁRIO', quitacao:'DEVEDOR',
    confissao_divida:'DEVEDOR', parcelamento:'DEVEDOR', autonomo:'PRESTADOR',
    estagio:'ESTAGIÁRIO', acordo_socios:'SÓCIO B', parceria:'PARCEIRO B',
    plano_parceria:'PARTE B', notif_extra:'NOTIFICADO', acordo_amigavel:'PARTE B',
    termo_invest:'EMPRESA INVESTIDA', contrato_social:'SÓCIO',
  };
  return r[type] || 'CONTRATADO';
}

function valorExtenso(val) {
  if (!val) return 'valor a ser definido';
  const n = parseFloat(val.replace(/\./g,'').replace(',','.'));
  if (isNaN(n) || n === 0) return 'valor a ser definido';

  const unidades  = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const dezenas   = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const centenas  = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];

  function porExtenso(num) {
    if (num === 0)   return '';
    if (num === 100) return 'cem';
    if (num < 20)    return unidades[num];
    if (num < 100) {
      const d = Math.floor(num / 10);
      const u = num % 10;
      return dezenas[d] + (u ? ' e ' + unidades[u] : '');
    }
    const c  = Math.floor(num / 100);
    const resto = num % 100;
    return centenas[c] + (resto ? ' e ' + porExtenso(resto) : '');
  }

  const inteiro = Math.floor(n);
  const centavos = Math.round((n - inteiro) * 100);

  let textoInteiro = '';
  if (inteiro === 0) {
    textoInteiro = 'zero';
  } else if (inteiro < 1000) {
    textoInteiro = porExtenso(inteiro) + (inteiro === 1 ? ' real' : ' reais');
  } else if (inteiro < 1000000) {
    const mil   = Math.floor(inteiro / 1000);
    const resto = inteiro % 1000;
    textoInteiro = (mil === 1 ? 'mil' : porExtenso(mil) + ' mil')
      + (resto ? ' e ' + porExtenso(resto) : '')
      + (inteiro === 1000 ? ' reais' : ' reais');
  } else {
    const mi    = Math.floor(inteiro / 1000000);
    const resto = inteiro % 1000000;
    textoInteiro = porExtenso(mi) + (mi === 1 ? ' milhão' : ' milhões')
      + (resto ? ' e ' + porExtenso(resto) : '')
      + ' de reais';
  }

  if (centavos === 0) return textoInteiro;
  const textoCent = porExtenso(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
  return inteiro === 0 ? textoCent : textoInteiro + ' e ' + textoCent;
}

function formatDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${parseInt(day)} de ${months[parseInt(m)-1]} de ${y}`;
}

function formatCurrency(input) {
  let v = input.value.replace(/\D/g,'');
  v = (parseInt(v || '0') / 100).toFixed(2);
  v = v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = v;
}

function showNotif(msg, icon = '✅') {
  const n = document.getElementById('notif');
  document.getElementById('notif-icon').textContent = icon;
  document.getElementById('notif-text').textContent  = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}
