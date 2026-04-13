// ════════════════════════════════════════════════════════════════
//  helpers.js — Funções compartilhadas (carregado via <script>)
//  Disponível em: window.DocHelpers
// ════════════════════════════════════════════════════════════════

window.DocHelpers = {
  roman: ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'],

  aviso: '<div class="doc-aviso-oab">AVISO: Este modelo de referência não constitui assessoria jurídica. Para situações específicas, consulte um advogado inscrito na OAB.</div>',

  cabecalho(num, docTitle) {
    return `
  <div class="doc-masthead">
    <div class="masthead-logo">DocFácil · Gerador de Modelos de Documentos</div>
    <div class="masthead-num">Nº ${num}</div>
  </div>
  <div class="doc-main-title">${docTitle}</div>`;
  },

  partyLine(p, role) {
    let line = `<strong>${p.nome || role}</strong>`;
    if (p.nac   && p.nac   !== 'undefined') line += `, ${p.nac}`;
    if (p.est   && p.est   !== 'undefined') line += `, ${p.est}`;
    if (p.prof  && p.prof  !== 'undefined' && p.prof)  line += `, ${p.prof}`;
    if (p.doc   && p.doc   !== 'undefined' && p.doc)   line += `, portador(a) do CPF/CNPJ nº <strong>${p.doc}</strong>`;
    if (p.rg    && p.rg    !== 'undefined' && p.rg)    line += `, RG nº ${p.rg}`;
    if (p.end   && p.end   !== 'undefined' && p.end)   line += `, residente/domiciliado(a) em ${p.end}`;
    if (p.tel   && p.tel   !== 'undefined' && p.tel)   line += `, tel.: ${p.tel}`;
    if (p.email && p.email !== 'undefined' && p.email) line += `, e-mail: ${p.email}`;
    return line + '.';
  },

  signaturas({ pa, pb, roleA, roleB, t1, t2, jur, dateStr }) {
    const localData  = jur.local ? `${jur.local}, ${dateStr}` : dateStr;
    const testemunhas = t1?.nome ? `
      <div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">CPF: ${t1.doc}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">CPF: ${t2.doc}</div></div>
      </div>` : '';
    return `
    <div class="signatures-block">
      <div class="signatures-title">${localData}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">${roleA}</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        ${pb?.nome ? `<div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">${roleB}</div><div class="sig-doc">CPF/CNPJ: ${pb.doc}</div></div>` : '<div class="sig-item"></div>'}
      </div>
      ${testemunhas}
    </div>`;
  },

  sigUnica({ pa, roleA, jur, dateStr }) {
    const localData = jur.local ? `${jur.local}, ${dateStr}` : dateStr;
    return `
    <div class="signatures-block">
      <div class="signatures-title">${localData}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">${roleA}</div><div class="sig-doc">CPF/CNPJ: ${pa.doc}</div></div>
        <div class="sig-item"></div>
      </div>
    </div>`;
  }
};
