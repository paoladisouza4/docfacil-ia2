// ══════════════════════════════════════════════════════════
//  generatePDF.js
//  Estratégia: usa window.print() com @media print
//  Elimina 100% dos problemas de renderização do jsPDF
//  pois o browser é quem renderiza e gera o PDF — igual
//  à pré-visualização. O que você vê é exatamente o que imprime.
// ══════════════════════════════════════════════════════════

const FONTS = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap'

const BASE_STYLES = `
  @import url('${FONTS}');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    background: #fff;
    padding: 18mm 22mm;
    width: 210mm;
  }

  .doc-header {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #1a1a1a;
  }
  .doc-title {
    font-family: 'DM Serif Display', serif;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 4px;
  }
  .doc-subtitle { font-size: 11px; color: #555; }
  .doc-num      { font-size: 10px; color: #888; margin-top: 3px; font-weight: 600; }

  .parties-block {
    background: #f8f8f6;
    border: 1px solid #e5e3dc;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 18px 0;
  }
  .parties-title {
    font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: #888; margin-bottom: 10px;
  }
  .party        { margin-bottom: 8px; }
  .party-role   { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #555; margin-bottom: 2px; }
  .party p      { font-size: 11px; color: #1a1a1a; line-height: 1.5; }

  p {
    font-size: 12px;
    color: #333;
    line-height: 1.8;
    margin-bottom: 8px;
    text-align: justify;
  }
  h1, h2, h3, h4 { font-family: 'DM Serif Display', serif; margin: 16px 0 6px; }
  h1 { font-size: 15px; }
  h2 { font-size: 13px; }
  h3 { font-size: 12px; }
  ul, ol { padding-left: 18px; margin-bottom: 8px; }
  li     { font-size: 12px; line-height: 1.7; margin-bottom: 4px; }

  .clausula        { margin: 16px 0; }
  .clausula-title  { font-size: 11px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .5px; }
  .clausula-body p { font-size: 11px; }

  strong { font-weight: 700; }
  em     { font-style: italic; }
  hr     { border: none; border-top: 1px solid #ddd; margin: 16px 0; }

  .signatures-block  { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
  .signatures-title  { font-size: 10px; color: #666; margin-bottom: 18px; }
  .sig-grid          { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .sig-item          { text-align: center; }
  .sig-line          { border-top: 1px solid #1a1a1a; margin-bottom: 6px; }
  .sig-name          { font-size: 11px; font-weight: 600; }
  .sig-role          { font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: .5px; }
  .sig-doc           { font-size: 9px; color: #888; margin-top: 1px; }
  .witnesses-block   { margin-top: 18px; }
  .witnesses-title   { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #888; margin-bottom: 12px; }

  .doc-aviso {
    font-size: 9px; color: #aaa; text-align: center;
    margin-top: 24px; padding-top: 12px;
    border-top: 1px solid #eee; font-style: italic;
  }

  @media print {
    html, body    { width: 210mm; margin: 0; padding: 14mm 18mm; }
    .doc-paper    { box-shadow: none !important; border: none !important; }
    .clausula, .party, .sig-item, .parties-block { page-break-inside: avoid; }
    .signatures-block { page-break-before: auto; }
    @page { size: A4 portrait; margin: 0; }
  }
`

/** Escapa caracteres especiais para uso seguro em atributos HTML */
function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Gera o PDF via janela de impressão do browser.
 * O browser renderiza o HTML idêntico à pré-visualização
 * e converte para PDF — sem jsPDF, sem problemas de renderização.
 *
 * @param {string} html   - innerHTML do doc-paper (HTML já renderizado)
 * @param {string} title  - nome do arquivo
 */
export async function downloadPDF(html, title = 'documento') {
  if (!html || typeof html !== 'string' || html.trim() === '') {
    console.error('downloadPDF: conteúdo vazio ou inválido')
    return
  }

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('Seu navegador bloqueou o pop-up. Por favor, permita pop-ups para este site e tente novamente.')
    return
  }

  const safeTitle = escapeHtml(title)

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${safeTitle}</title>
  <style>
    ${BASE_STYLES}

    #print-hint {
      position: fixed;
      top: 0; left: 0; right: 0;
      background: #1a1a1a;
      color: #fff;
      text-align: center;
      padding: 12px 16px;
      font-family: sans-serif;
      font-size: 13px;
      z-index: 9999;
    }
    #print-hint strong { color: #c9a96e; }
    #print-hint button {
      margin-left: 12px;
      padding: 4px 14px;
      background: #c9a96e;
      color: #1a1a1a;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    #print-hint .btn-close {
      background: #555;
      color: #fff;
    }
    /* Oculta o hint na impressão */
    @media print {
      #print-hint { display: none !important; }
    }
  </style>
</head>
<body>
  <div id="print-hint">
    Para salvar como PDF: selecione <strong>Salvar como PDF</strong> no destino da impressão.
    <button onclick="window.print()">🖨️ Abrir impressão</button>
    <button class="btn-close" onclick="window.close()">✕ Fechar</button>
  </div>
  <div style="margin-top: 48px;">
    ${html}
  </div>
</body>
</html>`)

  win.document.close()

  // Dispara impressão automaticamente após fontes carregarem
  win.addEventListener('load', () => {
    setTimeout(() => {
      win.focus()
      win.print()
      win.addEventListener('afterprint', () => win.close())
    }, 1000)
  })
}

/**
 * Abre janela de impressão (sem download automático).
 *
 * @param {string} html   - innerHTML do doc-paper
 * @param {string} title  - nome do documento
 */
export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('Seu navegador bloqueou o pop-up. Por favor, permita pop-ups para este site e tente novamente.')
    return
  }

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeHtml(title)}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>${html}</body>
</html>`)

  win.document.close()

  win.addEventListener('load', () => {
    setTimeout(() => {
      win.focus()
      win.print()
      win.addEventListener('afterprint', () => win.close())
    }, 800)
  })
}
