// ══════════════════════════════════════════════════════════
//  utils.js — utilitários compartilhados
//  Extraídos do app.js original, sem alteração de lógica
// ══════════════════════════════════════════════════════════

export function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  return `${parseInt(day)} de ${months[parseInt(m) - 1]} de ${y}`
}

export function formatCurrency(value) {
  let v = String(value).replace(/\D/g, '')
  v = (parseInt(v || '0') / 100).toFixed(2)
  v = v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return v
}

export function parseCurrency(str) {
  if (!str) return 0
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0
}

export function valorExtenso(val) {
  if (!val) return 'valor a ser definido'
  const n = parseFloat(String(val).replace(/\./g, '').replace(',', '.'))
  if (isNaN(n) || n === 0) return 'valor a ser definido'

  const unidades  = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove']
  const dezenas   = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa']
  const centenas  = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos']

  function porExtenso(num) {
    if (num === 0)   return ''
    if (num === 100) return 'cem'
    if (num < 20)    return unidades[num]
    if (num < 100) {
      const d = Math.floor(num / 10); const u = num % 10
      return dezenas[d] + (u ? ' e ' + unidades[u] : '')
    }
    const c = Math.floor(num / 100); const resto = num % 100
    return centenas[c] + (resto ? ' e ' + porExtenso(resto) : '')
  }

  const inteiro  = Math.floor(n)
  const centavos = Math.round((n - inteiro) * 100)

  let textoInteiro = ''
  if (inteiro === 0) {
    textoInteiro = 'zero'
  } else if (inteiro < 1000) {
    textoInteiro = porExtenso(inteiro) + (inteiro === 1 ? ' real' : ' reais')
  } else if (inteiro < 1000000) {
    const mil = Math.floor(inteiro / 1000); const resto = inteiro % 1000
    textoInteiro = (mil === 1 ? 'mil' : porExtenso(mil) + ' mil')
      + (resto ? ' e ' + porExtenso(resto) : '') + ' reais'
  } else {
    const mi = Math.floor(inteiro / 1000000); const resto = inteiro % 1000000
    textoInteiro = porExtenso(mi) + (mi === 1 ? ' milhão' : ' milhões')
      + (resto ? ' e ' + porExtenso(resto) : '') + ' de reais'
  }

  if (centavos === 0) return textoInteiro
  const textoCent = porExtenso(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  return inteiro === 0 ? textoCent : textoInteiro + ' e ' + textoCent
}

export function generateDocId() {
  const now = new Date()
  return `CTR-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
}

export function getGreeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export function romanNumeral(n) {
  const map = { 1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',
    11:'XI',12:'XII',13:'XIII',14:'XIV',15:'XV',16:'XVI',17:'XVII',18:'XVIII',19:'XIX',20:'XX' }
  return map[n] || String(n)
}

export function partyLine(p, role) {
  if (!p?.nome) return `[${role} — dados não preenchidos]`
  const parts = [
    p.nome ? `<strong>${p.nome}</strong>` : null,
    p.nac  ? p.nac : null,
    p.est  ? p.est : null,
    p.prof ? p.prof : null,
    p.doc  ? (p.doc.length > 14 ? `CNPJ nº ${p.doc}` : `CPF nº ${p.doc}`) : null,
    p.rg   ? `RG nº ${p.rg}` : null,
    p.end  ? `residente e domiciliado(a) na ${p.end}` : null,
    p.tel  ? `Tel.: ${p.tel}` : null,
    p.email ? `E-mail: ${p.email}` : null,
  ].filter(Boolean)
  return parts.join(', ') + '.'
}
