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

// ── Cláusulas extras ─────────────────────────────────────────
const CLAUSE_BODIES = {
  lgpd: (n, pa, pb) => `<p>${n}.1. As partes comprometem-se a tratar os dados pessoais eventualmente compartilhados no âmbito deste instrumento em conformidade com a Lei nº 13.709/2018 (LGPD), utilizando-os exclusivamente para as finalidades aqui previstas.</p>`,
  exclusividade: (n) => `<p>${n}.1. Durante a vigência deste instrumento, fica vedado ao CONTRATADO prestar serviços idênticos ou similares a empresas concorrentes diretas do CONTRATANTE, salvo autorização prévia e por escrito.</p>`,
  propriedade: (n) => `<p>${n}.1. Todos os materiais, obras intelectuais e criações desenvolvidos no âmbito deste contrato serão de propriedade exclusiva do CONTRATANTE, nos termos da Lei nº 9.610/1998.</p>`,
  sigilo: (n) => `<p>${n}.1. As partes comprometem-se a manter absoluto sigilo sobre as informações técnicas, comerciais e financeiras obtidas em razão deste contrato, durante sua vigência e por 2 (dois) anos após o encerramento.</p>`,
  subcontratacao: (n) => `<p>${n}.1. É vedada a subcontratação total ou parcial do objeto deste instrumento sem prévia e expressa anuência da outra parte, sob pena de rescisão imediata.</p>`,
  reembolso: (n) => `<p>${n}.1. As despesas operacionais diretamente relacionadas à execução do objeto, previamente aprovadas pelo CONTRATANTE, serão reembolsadas mediante apresentação de comprovantes, em até 10 (dez) dias úteis.</p>`,
  garantia: (n) => `<p>${n}.1. O CONTRATADO garante a qualidade dos serviços pelo prazo de 90 (noventa) dias após a entrega, comprometendo-se a corrigir gratuitamente quaisquer falhas ou defeitos identificados.</p>`,
  forca_maior: (n) => `<p>${n}.1. Nenhuma das partes será responsabilizada por atrasos ou inadimplemento decorrentes de caso fortuito ou força maior, nos termos do art. 393 do Código Civil, desde que devidamente comprovado e comunicado no prazo de 5 dias úteis.</p>`,
  antisuborno: (n) => `<p>${n}.1. As partes declaram que não praticam e não praticarão atos de corrupção ou suborno no âmbito desta relação contratual, em cumprimento à Lei nº 12.846/2013 (Lei Anticorrupção).</p>`,
  resolucao: (n) => `<p>${n}.1. As partes poderão encerrar antecipadamente este instrumento por mútuo acordo, mediante distrato escrito assinado por ambas, sem necessidade de cumprir o prazo de aviso prévio estabelecido.</p>`,
  penalidade: (n) => `<p>${n}.1. O descumprimento de qualquer obrigação estabelecida neste instrumento sujeitará a parte infratora ao pagamento de multa não compensatória de 10% sobre o valor total do contrato, sem prejuízo das perdas e danos apurados.</p>`,
}

function buildExtraClause(clause, clauseNum, pa, pb) {
  const R = romanNumeral(clauseNum)
  const body = CLAUSE_BODIES[clause.id]?.(clauseNum, pa, pb) || `<p>${clauseNum}.1. ${clause.desc}.</p>`
  return `<div class="clausula"><div class="clausula-title">Cláusula ${R} — ${clause.name}</div><div class="clausula-body">${body}</div></div>`
}

// ── Template genérico (fallback) ─────────────────────────────
function buildGenerico(t, params) {
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params
  const R = romanNumeral
  return `${cabecalho(num, docTitle)}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa, roleA)}</p></div>
    ${pb?.nome ? `<div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb, roleB)}</p></div>` : ''}
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
  </div></div>` : ''}

  ${val.total && val.total !== '0,00' ? `<div class="clausula"><div class="clausula-title">Cláusula III — Do Valor e Pagamento</div><div class="clausula-body">
    <p>Valor: <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pago <strong>${val.forma}</strong>${val.venc ? ', vencimento: ' + val.venc : ''}.${val.banco ? ' Pagamento via: ' + val.banco + '.' : ''}</p>
    ${val.multa ? `<p>Multa por atraso: ${val.multa}. Juros de mora: ${val.juros}.</p>` : ''}
  </div></div>` : ''}

  ${extraClauses || ''}

  ${jur.foro ? `<div class="clausula"><div class="clausula-title">Cláusula ${R(finalClauseN)} — Das Disposições Gerais</div><div class="clausula-body">
    <p>Fica eleito o foro de <strong>${jur.foro}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
  </div></div>` : ''}

  ${signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr })}
  ${aviso}`
}

// ── Contratos de serviços ─────────────────────────────────────
function buildContrato(t, params) {
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN } = params
  const R = romanNumeral
  const tipoNome = { servico:'Prestação de Serviços', freelancer:'Freelancer', trabalho_pj:'Trabalho PJ', autonomo:'Autônomo', influenciador:'Parceria com Influenciador Digital', compravenda:'Compra e Venda', parceria:'Parceria Comercial', comissao:'Representação Comercial e Comissão', nda:'Confidencialidade (NDA)' }[t] || 'Serviços'

  if (t === 'nda') {
    return `${cabecalho(num, docTitle)}
    <div class="doc-subtitle">Acordo de Não-Divulgação — Non-Disclosure Agreement · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARTE DIVULGANTE:</div><p>${partyLine(pa,'PARTE DIVULGANTE')}</p></div>
      <div class="party"><div class="party-role">PARTE RECEPTORA:</div><p>${partyLine(pb,'PARTE RECEPTORA')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Confidencialidade, comprometendo-se a observar as seguintes cláusulas:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Das Informações Confidenciais</div><div class="clausula-body">
      <p>1.1. Consideram-se confidenciais todas as informações relacionadas a: <strong>${obj.desc}</strong></p>
      <p>1.2. As obrigações de confidencialidade não se aplicam a informações de domínio público ou exigidas por determinação judicial.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
      <p>2.1. A PARTE RECEPTORA compromete-se a manter as informações em sigilo absoluto e não divulgá-las a terceiros.</p>
      <p>2.2. A vigência das obrigações de sigilo é de <strong>${vigText}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Penalidades</div><div class="clausula-body">
      <p>3.1. O descumprimento sujeitará a parte infratora ao pagamento de multa de <strong>R$ ${val.total || '10.000,00'}</strong> (${valorExtenso(val.total || '10.000,00')}), sem prejuízo de perdas e danos.</p>
    </div></div>
    ${extraClauses || ''}
    <div class="clausula"><div class="clausula-title">Cláusula ${R(finalClauseN)} — Do Foro</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.</p>
    </div></div>
    ${signaturas({ pa, pb, roleA:'PARTE DIVULGANTE', roleB:'PARTE RECEPTORA', t1, t2, jur, dateStr })}
    ${aviso}`
  }

  return `${cabecalho(num, docTitle)}
  <div class="doc-subtitle">Instrumento Particular de ${tipoNome} · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa, roleA)}</p></div>
    ${pb?.nome ? `<div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb, roleB)}</p></div>` : ''}
  </div>
  <p>As partes celebram o presente instrumento, ficando expressamente acordado que a presente relação é de natureza civil, não gerando qualquer vínculo empregatício, nos termos do art. 593 e seguintes do Código Civil:</p>

  <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
    <p>1.1. O ${roleB} prestará ao ${roleA} os seguintes serviços: <strong>${obj.desc}</strong></p>
    ${obj.entregaveis ? `<p>1.2. Entregáveis: ${obj.entregaveis}</p>` : ''}
    <p>${obj.entregaveis ? '1.3.' : '1.2.'} Os serviços serão prestados ${vigText}${obj.local ? ', no local: ' + obj.local : ''}.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações do ${roleA}</div><div class="clausula-body">
    <p>2.1. Compete ao ${roleA}: ${obj.obrig_a || 'efetuar o pagamento nos prazos estabelecidos; fornecer as informações necessárias à execução dos serviços'}.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do ${roleB}</div><div class="clausula-body">
    <p>3.1. Compete ao ${roleB}: ${obj.obrig_b || 'executar os serviços com qualidade, diligência e nos prazos acordados; manter o CONTRATANTE informado sobre o andamento dos trabalhos'}.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula IV — Da Remuneração</div><div class="clausula-body">
    <p>4.1. Pela prestação dos serviços, o ${roleA} pagará ao ${roleB} o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>${val.venc ? ', com vencimento em ' + val.venc : ''}.</p>
    ${val.banco ? `<p>4.2. O pagamento será realizado mediante: <strong>${val.banco}</strong>.</p>` : ''}
    ${val.multa ? `<p>4.${val.banco ? '3' : '2'}. O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de mora de <strong>${val.juros}</strong>.</p>` : ''}
    ${val.cond ? `<p>Condições especiais: ${val.cond}.</p>` : ''}
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula V — Da Rescisão</div><div class="clausula-body">
    <p>5.1. Qualquer das partes poderá rescindir o presente instrumento mediante notificação escrita com antecedência mínima de <strong>${jur.rescisao || '30 dias'}</strong>.</p>
    ${jur.multa_resc ? `<p>5.2. A rescisão imotivada implicará multa de <strong>${jur.multa_resc}</strong>.</p>` : ''}
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula VI — Da Ausência de Vínculo Empregatício</div><div class="clausula-body">
    <p>6.1. O presente instrumento não gera vínculo empregatício, societário ou associativo entre as partes. O ${roleB} é responsável pelo recolhimento de seus próprios tributos e encargos.</p>
  </div></div>

  ${extraClauses || ''}

  <div class="clausula"><div class="clausula-title">Cláusula ${R(finalClauseN)} — Das Disposições Gerais</div><div class="clausula-body">
    <p>Este instrumento é regido pelo Código Civil (Lei nº 10.406/2002). Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
  </div></div>

  ${signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr })}
  ${aviso}`
}

// ── Locação ───────────────────────────────────────────────────
function buildLocacao(t, params) {
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, vigText, extraClauses, finalClauseN } = params
  const R = romanNumeral
  const roleA = 'LOCADOR'; const roleB = 'LOCATÁRIO'

  if (t === 'vistoria') {
    return `${cabecalho(num, docTitle)}
    <div class="doc-subtitle">Termo de Vistoria de Imóvel · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">LOCADOR / VISTORIADOR:</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO:</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Imóvel Vistoriado</div><div class="clausula-body">
      <p>1.1. As partes procedem à vistoria do imóvel descrito a seguir: <strong>${obj.desc}</strong></p>
      <p>1.2. Data da vistoria: <strong>${obj.inicio || dateStr}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Estado do Imóvel</div><div class="clausula-body">
      <p>2.1. As partes declaram que o imóvel se encontra nas condições descritas neste termo, comprometendo-se o LOCATÁRIO a devolvê-lo nas mesmas condições ao final da locação.</p>
    </div></div>
    ${signaturas({ pa, pb, roleA:'LOCADOR', roleB:'LOCATÁRIO', t1, t2, jur, dateStr })}
    ${aviso}`
  }

  if (t === 'notif_desocupacao') {
    return `${cabecalho(num, docTitle)}
    <div class="doc-subtitle">Notificação Extrajudicial de Desocupação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Partes</div>
      <div class="party"><div class="party-role">NOTIFICANTE (LOCADOR):</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">NOTIFICADO (LOCATÁRIO):</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <p>Por meio desta notificação, o LOCADOR requer ao LOCATÁRIO a desocupação do imóvel situado em: <strong>${obj.desc}</strong></p>
    <div class="clausula"><div class="clausula-title">Do Prazo</div><div class="clausula-body">
      <p>O imóvel deverá ser desocupado e as chaves entregues até <strong>${obj.fim || '30 dias a contar desta notificação'}</strong>, ${obj.obrig_a || 'em perfeitas condições de conservação, com todas as despesas quitadas'}.</p>
    </div></div>
    <p>O descumprimento desta notificação ensejará as medidas legais cabíveis, incluindo ação de despejo.</p>
    ${signaturas({ pa, pb, roleA:'NOTIFICANTE', roleB:'NOTIFICADO', t1, t2, jur, dateStr })}
    ${aviso}`
  }

  return `${cabecalho(num, docTitle)}
  <div class="doc-subtitle">Instrumento Particular de Locação · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">LOCADOR:</div><p>${partyLine(pa, 'LOCADOR')}</p></div>
    <div class="party"><div class="party-role">LOCATÁRIO:</div><p>${partyLine(pb, 'LOCATÁRIO')}</p></div>
  </div>
  <p>As partes celebram o presente Contrato de Locação, regido pela Lei nº 8.245/1991 (Lei do Inquilinato), mediante as seguintes cláusulas:</p>

  <div class="clausula"><div class="clausula-title">Cláusula I — Do Imóvel</div><div class="clausula-body">
    <p>1.1. O LOCADOR cede ao LOCATÁRIO, para fins de locação, o seguinte imóvel: <strong>${obj.desc}</strong></p>
    <p>1.2. O imóvel destina-se a fins ${t === 'aluguel_com' ? 'comerciais' : 'residenciais'}, vedada qualquer outra utilização.</p>
    <p>1.3. A locação vigorará ${vigText}${obj.local ? ', localizado em: ' + obj.local : ''}.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula II — Do Aluguel</div><div class="clausula-body">
    <p>2.1. O aluguel mensal é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), a ser pago ${val.forma || 'mensalmente'}, até o dia <strong>${val.venc || '10 (dez)'}</strong> de cada mês.</p>
    ${val.banco ? `<p>2.2. O pagamento será realizado mediante: <strong>${val.banco}</strong>.</p>` : ''}
    <p>2.${val.banco ? '3' : '2'}. O atraso no pagamento acarretará multa de <strong>${val.multa || '2%'}</strong> e juros de mora de <strong>${val.juros || '1% ao mês'}</strong>.</p>
    ${val.reajuste && val.reajuste !== 'Sem reajuste' ? `<p>2.4. O aluguel será reajustado anualmente pelo índice <strong>${val.reajuste}</strong>.</p>` : ''}
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do Locador</div><div class="clausula-body">
    <p>3.1. Compete ao LOCADOR: ${obj.obrig_a || 'entregar o imóvel em perfeitas condições de habitabilidade, manter o uso pacífico e cumprir as obrigações previstas na Lei do Inquilinato'}.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula IV — Das Obrigações do Locatário</div><div class="clausula-body">
    <p>4.1. Compete ao LOCATÁRIO: ${obj.obrig_b || 'pagar o aluguel e encargos pontualmente, usar o imóvel exclusivamente para os fins contratados, conservá-lo e devolvê-lo nas mesmas condições ao final da locação'}.</p>
  </div></div>

  ${extraClauses || ''}

  <div class="clausula"><div class="clausula-title">Cláusula ${R(finalClauseN)} — Das Disposições Gerais</div><div class="clausula-body">
    <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.</p>
  </div></div>

  ${signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr })}
  ${aviso}`
}

// ── Financeiro ────────────────────────────────────────────────
function buildFinanceiro(t, params) {
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, extraClauses, finalClauseN } = params
  const R = romanNumeral

  if (t === 'recibo' || t === 'recibo_aluguel' || t === 'nota_servico') {
    const roleA = t === 'recibo_aluguel' ? 'LOCADOR' : 'RECEBEDOR'
    const roleB = t === 'recibo_aluguel' ? 'LOCATÁRIO' : 'PAGANTE'
    return `${cabecalho(num, docTitle)}
    <div class="doc-subtitle">${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Partes</div>
      <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa, roleA)}</p></div>
      <div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb, roleB)}</p></div>
    </div>
    <p>Declaro ter recebido de <strong>${pb.nome}</strong> a importância de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong></p>
    <p>Forma de pagamento: <strong>${val.forma || 'conforme acordado'}</strong>${val.banco ? '. Dados: ' + val.banco : ''}.</p>
    <p>${jur.local ? jur.local + ', ' : ''}${dateStr}. Dou plena quitação pelo valor recebido.</p>
    ${signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr })}
    ${aviso}`
  }

  if (t === 'quitacao') {
    return `${cabecalho(num, docTitle)}
    <div class="doc-subtitle">Termo de Quitação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Partes</div>
      <div class="party"><div class="party-role">CREDOR:</div><p>${partyLine(pa,'CREDOR')}</p></div>
      <div class="party"><div class="party-role">DEVEDOR:</div><p>${partyLine(pb,'DEVEDOR')}</p></div>
    </div>
    <p>O CREDOR declara ter recebido do DEVEDOR a importância de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong></p>
    <p>Mediante o recebimento integral do valor acima, o CREDOR dá ao DEVEDOR plena, geral e irrevogável quitação da obrigação, nada mais tendo a reclamar a qualquer título.</p>
    ${signaturas({ pa, pb, roleA:'CREDOR', roleB:'DEVEDOR', t1, t2, jur, dateStr })}
    ${aviso}`
  }

  // confissao_divida e parcelamento
  return `${cabecalho(num, docTitle)}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">CREDOR:</div><p>${partyLine(pa,'CREDOR')}</p></div>
    <div class="party"><div class="party-role">DEVEDOR:</div><p>${partyLine(pb,'DEVEDOR')}</p></div>
  </div>
  <div class="clausula"><div class="clausula-title">Cláusula I — Da Dívida</div><div class="clausula-body">
    <p>1.1. O DEVEDOR reconhece e confessa dever ao CREDOR a importância de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong></p>
  </div></div>
  <div class="clausula"><div class="clausula-title">Cláusula II — Do Pagamento</div><div class="clausula-body">
    <p>2.1. A dívida será paga de forma <strong>${val.forma || 'parcelada'}</strong>${val.venc ? ', com vencimento em ' + val.venc : ''}.${val.banco ? ' Pagamento mediante: ' + val.banco + '.' : ''}</p>
    ${val.multa ? `<p>2.2. O atraso acarretará multa de <strong>${val.multa}</strong> e juros de <strong>${val.juros}</strong>.</p>` : ''}
  </div></div>
  ${extraClauses || ''}
  <div class="clausula"><div class="clausula-title">Cláusula ${R(finalClauseN)} — Do Foro</div><div class="clausula-body">
    <p>Foro competente: <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>.</p>
  </div></div>
  ${signaturas({ pa, pb, roleA:'CREDOR', roleB:'DEVEDOR', t1, t2, jur, dateStr })}
  ${aviso}`
}

// ── Declarações ───────────────────────────────────────────────
function buildDeclaracao(t, params) {
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, jur } = params

  if (t === 'curriculo') {
    return `${cabecalho(num, 'Currículo Profissional')}
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:20px;font-weight:700;">${pa.nome}</div>
      <div style="font-size:13px;color:#555;margin-top:4px;">${pa.prof || ''}</div>
      <div style="font-size:12px;color:#777;margin-top:4px;">${pa.email ? pa.email + ' · ' : ''}${pa.tel || ''}</div>
      ${obj.local ? `<div style="font-size:12px;color:#777;">${obj.local}</div>` : ''}
    </div>
    <div class="clausula"><div class="clausula-title">Objetivo Profissional</div><div class="clausula-body"><p>${obj.desc}</p></div></div>
    ${obj.entregaveis ? `<div class="clausula"><div class="clausula-title">Experiência Profissional</div><div class="clausula-body"><p>${obj.entregaveis.replace(/\n/g,'<br>')}</p></div></div>` : ''}
    ${obj.obrig_a ? `<div class="clausula"><div class="clausula-title">Formação Acadêmica</div><div class="clausula-body"><p>${obj.obrig_a.replace(/\n/g,'<br>')}</p></div></div>` : ''}
    ${obj.obrig_b ? `<div class="clausula"><div class="clausula-title">Habilidades e Competências</div><div class="clausula-body"><p>${obj.obrig_b.replace(/\n/g,'<br>')}</p></div></div>` : ''}
    ${aviso}`
  }

  return `${cabecalho(num, docTitle)}
  <div class="doc-subtitle">${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Declarante</div>
    <div class="party"><p>${partyLine(pa,'DECLARANTE')}</p></div>
  </div>
  <p>Declaro, para os devidos fins, que: <strong>${obj.desc}</strong></p>
  ${pb?.nome ? `<p>Referente a: <strong>${pb.nome}</strong>${pb.doc ? ` — CPF/CNPJ: ${pb.doc}` : ''}</p>` : ''}
  ${obj.inicio ? `<p>Período: de ${obj.inicio}${obj.fim && obj.fim !== 'indeterminado' ? ' a ' + obj.fim : ''}.</p>` : ''}
  ${obj.obrig_a ? `<p>${obj.obrig_a}</p>` : ''}
  <p>Declaro ser verdadeiras as informações prestadas, ciente das responsabilidades civis e criminais pelo seu conteúdo.</p>
  <p style="margin-top:24px;">${jur.local ? jur.local + ', ' : ''}${dateStr}.</p>
  <div class="signatures-block">
    <div class="sig-item" style="max-width:300px;margin:24px auto 0;text-align:center;">
      <div class="sig-line"></div>
      <div class="sig-name">${pa.nome}</div>
      <div class="sig-role">DECLARANTE</div>
      <div class="sig-doc">CPF: ${pa.doc || '__________________'}</div>
    </div>
  </div>
  ${aviso}`
}

// ── Jurídico ──────────────────────────────────────────────────
function buildJuridico(t, params) {
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, vigText, extraClauses, finalClauseN } = params
  const R = romanNumeral

  if (t === 'lgpd_termo' || t === 'politica_priv' || t === 'termo_uso') {
    return `${cabecalho(num, docTitle)}
    <div class="doc-subtitle">Vigência: ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Responsável</div>
      <div class="party"><p>${partyLine(pa,'CONTROLADOR')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. ${obj.desc}</p>
      ${obj.entregaveis ? `<p>1.2. ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Base Legal</div><div class="clausula-body">
      <p>2.1. O tratamento de dados é realizado em conformidade com a Lei nº 13.709/2018 (LGPD) e demais normas aplicáveis.</p>
    </div></div>
    ${extraClauses || ''}
    <div class="clausula"><div class="clausula-title">Cláusula ${R(finalClauseN)} — Das Disposições Finais</div><div class="clausula-body">
      <p>Foro competente: <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>. Vigência: ${vigText}.</p>
    </div></div>
    ${signaturas({ pa, pb: {}, roleA:'CONTROLADOR', roleB:'', t1, t2, jur, dateStr })}
    ${aviso}`
  }

  return buildGenerico(t, params)
}

// ── Empresarial ───────────────────────────────────────────────
function buildEmpresarial(t, params) {
  const { num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, vigText, extraClauses, finalClauseN } = params
  const R = romanNumeral

  return `${cabecalho(num, docTitle)}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">SÓCIO A / PARTE A:</div><p>${partyLine(pa,'SÓCIO A')}</p></div>
    ${pb?.nome ? `<div class="party"><div class="party-role">SÓCIO B / PARTE B:</div><p>${partyLine(pb,'SÓCIO B')}</p></div>` : ''}
  </div>
  <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
    <p>1.1. ${obj.desc}</p>
    ${obj.entregaveis ? `<p>1.2. Endereço / Informações adicionais: ${obj.entregaveis}</p>` : ''}
  </div></div>
  ${val.total && val.total !== '0,00' ? `<div class="clausula"><div class="clausula-title">Cláusula II — Do Capital</div><div class="clausula-body">
    <p>2.1. Capital: <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}).</p>
    ${val.forma ? `<p>2.2. Divisão: ${val.forma}.</p>` : ''}
    ${val.cond ? `<p>2.3. ${val.cond}</p>` : ''}
  </div></div>` : ''}
  ${obj.obrig_a ? `<div class="clausula"><div class="clausula-title">Cláusula III — Das Responsabilidades</div><div class="clausula-body">
    <p>3.1. SÓCIO A / PARTE A: ${obj.obrig_a}.</p>
    ${obj.obrig_b && pb?.nome ? `<p>3.2. SÓCIO B / PARTE B: ${obj.obrig_b}.</p>` : ''}
  </div></div>` : ''}
  ${extraClauses || ''}
  <div class="clausula"><div class="clausula-title">Cláusula ${R(finalClauseN)} — Das Disposições Gerais</div><div class="clausula-body">
    <p>Foro competente: <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
  </div></div>
  ${signaturas({ pa, pb, roleA:'PARTE A', roleB:'PARTE B', t1, t2, jur, dateStr })}
  ${aviso}`
}

// ── Dispatcher ────────────────────────────────────────────────
const BUILDERS = {
  servico: buildContrato, freelancer: buildContrato, trabalho_pj: buildContrato,
  autonomo: buildContrato, influenciador: buildContrato, compravenda: buildContrato,
  parceria: buildContrato, plano_parceria: buildEmpresarial, comissao: buildContrato, nda: buildContrato,
  aluguel_res: buildLocacao, aluguel_com: buildLocacao, locacao_simples: buildLocacao,
  locacao_fiador: buildLocacao, vistoria: buildLocacao, notif_desocupacao: buildLocacao, acordo_inadimpl: buildLocacao,
  recibo: buildFinanceiro, recibo_aluguel: buildFinanceiro, quitacao: buildFinanceiro,
  confissao_divida: buildFinanceiro, parcelamento: buildFinanceiro, nota_servico: buildFinanceiro,
  decl_residencia: buildDeclaracao, decl_renda: buildDeclaracao, decl_informal: buildDeclaracao,
  decl_comparec: buildDeclaracao, decl_respons: buildDeclaracao, decl_uniao: buildDeclaracao,
  curriculo: buildDeclaracao, carta_apres: buildDeclaracao, carta_demissao: buildDeclaracao,
  decl_experiencia: buildDeclaracao, estagio: buildDeclaracao,
  lgpd_termo: buildJuridico, politica_priv: buildJuridico, termo_uso: buildJuridico,
  notif_extra: buildJuridico, acordo_amigavel: buildJuridico,
  abertura_empresa: buildEmpresarial, contrato_social: buildEmpresarial,
  acordo_socios: buildEmpresarial, termo_invest: buildEmpresarial,
}

export function buildDocHTML(params) {
  const { type } = params
  const builder = BUILDERS[type]
  if (builder) {
    const html = builder(type, params)
    if (html) return html
  }
  return buildGenerico(type, params)
}

export { buildExtraClause, CLAUSE_BODIES }
