// ══════════════════════════════════════════════════════════
//  generatePDF.js — DocFácil IA
//  Estratégia: html2canvas (captura pixel-perfect) + jsPDF
//  Corrige: texto encavalado, fontes não carregadas, layout quebrado
// ══════════════════════════════════════════════════════════

// ── Carrega jsPDF via CDN ──────────────────────────────────
async function ensureJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF
  if (window.jsPDF) return window.jsPDF
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s.onload = () => resolve(window.jspdf?.jsPDF || window.jsPDF)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// ── Carrega html2canvas via CDN ────────────────────────────
async function ensureHtml2Canvas() {
  if (window.html2canvas) return window.html2canvas
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    s.onload = () => resolve(window.html2canvas)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// ── Monta o HTML completo com estilos embutidos ────────────
// IMPORTANTE: as fontes são pré-carregadas via <link> no <head>
// e aguardamos document.fonts.ready antes de capturar.
function buildDocumentHTML(html) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: white;
      /* Largura fixa de página A4 para captura consistente */
      width: 794px;
      padding: 60px 64px;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Cabeçalho ── */
    .doc-header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #1a1a1a;
    }
    .doc-title {
      font-family: 'DM Serif Display', serif;
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #1a1a1a;
      margin-bottom: 6px;
    }
    .doc-subtitle { font-size: 13px; color: #555; }
    .doc-num { font-size: 11px; color: #888; margin-top: 4px; font-weight: 600; letter-spacing: .5px; }

    /* ── Partes ── */
    .parties-block {
      background: #f8f8f6;
      border: 1px solid #e5e3dc;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .parties-title {
      font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; color: #888; margin-bottom: 14px;
    }
    .party { margin-bottom: 12px; }
    .party-role {
      font-size: 10px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: #555; margin-bottom: 3px;
    }
    .party p { font-size: 13px; color: #1a1a1a; line-height: 1.6; }

    /* ── Parágrafos e cláusulas ── */
    p {
      font-size: 13px;
      color: #333;
      line-height: 1.8;
      margin-bottom: 8px;
      text-align: justify;
    }
    .clausula { margin: 20px 0; }
    .clausula-title {
      font-size: 13px; font-weight: 700; color: #1a1a1a;
      margin-bottom: 10px; text-transform: uppercase; letter-spacing: .5px;
    }
    .clausula-body p { font-size: 13px; color: #333; line-height: 1.8; margin-bottom: 8px; text-align: justify; }
    strong { font-weight: 700; }

    /* ── Assinaturas ── */
    .signatures-block {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #ddd;
    }
    .signatures-title { font-size: 12px; color: #666; margin-bottom: 24px; }
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
    }
    .sig-item { text-align: center; }
    .sig-line { border-top: 1px solid #1a1a1a; margin-bottom: 8px; }
    .sig-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .sig-role { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: .5px; }
    .sig-doc { font-size: 11px; color: #888; margin-top: 2px; }

    /* ── Testemunhas ── */
    .witnesses-block { margin-top: 24px; }
    .witnesses-title {
      font-size: 11px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: #888; margin-bottom: 16px;
    }

    /* ── Aviso ── */
    .doc-aviso {
      font-size: 10px; color: #aaa; text-align: center;
      margin-top: 32px; padding-top: 16px;
      border-top: 1px solid #eee; font-style: italic;
    }
  </style>
</head>
<body>${html}</body>
</html>`
}

// ── Aguarda as fontes carregarem dentro do iframe ──────────
function waitForFonts(iframeWindow) {
  return new Promise((resolve) => {
    if (iframeWindow.document.fonts?.ready) {
      iframeWindow.document.fonts.ready.then(resolve)
    } else {
      // fallback para browsers mais antigos
      setTimeout(resolve, 1200)
    }
  })
}

/**
 * Baixa o documento como PDF fiel ao preview.
 * @param {string} html   - innerHTML do doc-paper
 * @param {string} title  - nome do arquivo (sem .pdf)
 */
export async function downloadPDF(html, title = 'documento') {
  try {
    // 1. Carrega as dependências em paralelo
    const [jsPDF, html2canvas] = await Promise.all([
      ensureJsPDF(),
      ensureHtml2Canvas(),
    ])

    // 2. Cria iframe invisível com largura A4 fixa (794px = 210mm a 96dpi)
    const iframe = document.createElement('iframe')
    iframe.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:0',
      // Largura exata de página A4 a 96dpi — garante quebra de linha idêntica ao PDF
      'width:794px',
      'height:1123px',
      'border:none',
      'visibility:hidden',
    ].join(';')
    document.body.appendChild(iframe)

    // 3. Escreve o HTML com estilos completos
    const iDoc = iframe.contentDocument || iframe.contentWindow.document
    iDoc.open()
    iDoc.write(buildDocumentHTML(html))
    iDoc.close()

    // 4. Aguarda fontes carregarem de verdade (não timeout fixo)
    await waitForFonts(iframe.contentWindow)

    // 5. Captura o body do iframe como canvas pixel-perfect
    const canvas = await html2canvas(iDoc.body, {
      scale: 2,              // resolução 2× para texto nítido
      useCORS: true,         // permite carregar fontes externas
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      // Define largura de captura igual ao body do iframe
      windowWidth: 794,
    })

    document.body.removeChild(iframe)

    // 6. Converte canvas → PDF A4
    const imgData = canvas.toDataURL('image/jpeg', 0.97)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageW = doc.internal.pageSize.getWidth()   // 210mm
    const pageH = doc.internal.pageSize.getHeight()  // 297mm

    // Calcula altura proporcional da imagem capturada
    const imgRatio = canvas.height / canvas.width
    const imgHeightMm = pageW * imgRatio

    if (imgHeightMm <= pageH) {
      // Documento cabe em uma página
      doc.addImage(imgData, 'JPEG', 0, 0, pageW, imgHeightMm)
    } else {
      // Documento longo: divide em múltiplas páginas
      let yOffset = 0
      while (yOffset < imgHeightMm) {
        if (yOffset > 0) doc.addPage()
        doc.addImage(imgData, 'JPEG', 0, -yOffset, pageW, imgHeightMm)
        yOffset += pageH
      }
    }

    doc.save(`${title.replace(/[^a-zA-Z0-9\-_]/g, '_')}.pdf`)

  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
    // Fallback: janela de impressão do navegador
    printDocument(html, title)
  }
}

/**
 * Abre janela de impressão fiel ao preview.
 * @param {string} html   - innerHTML do doc-paper
 * @param {string} title  - título da janela
 */
export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Permita pop-ups para usar a função de impressão.')
    return
  }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta charset="UTF-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: white;
      padding: 20mm 24mm;
      -webkit-font-smoothing: antialiased;
    }

    .doc-header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #1a1a1a; }
    .doc-title { font-family: 'DM Serif Display', serif; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a; margin-bottom: 6px; }
    .doc-subtitle { font-size: 13px; color: #555; }
    .doc-num { font-size: 11px; color: #888; margin-top: 4px; font-weight: 600; }
    .parties-block { background: #f8f8f6; border: 1px solid #e5e3dc; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .parties-title { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #888; margin-bottom: 14px; }
    .party { margin-bottom: 12px; }
    .party-role { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #555; margin-bottom: 3px; }
    .party p, p { font-size: 13px; color: #333; line-height: 1.8; margin-bottom: 8px; text-align: justify; }
    .clausula { margin: 20px 0; }
    .clausula-title { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px; text-transform: uppercase; letter-spacing: .5px; }
    strong { font-weight: 700; }
    .signatures-block { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ddd; }
    .signatures-title { font-size: 12px; color: #666; margin-bottom: 24px; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .sig-item { text-align: center; }
    .sig-line { border-top: 1px solid #1a1a1a; margin-bottom: 8px; }
    .sig-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .sig-role { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: .5px; }
    .sig-doc { font-size: 11px; color: #888; margin-top: 2px; }
    .witnesses-block { margin-top: 24px; }
    .witnesses-title { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #888; margin-bottom: 16px; }
    .doc-aviso { font-size: 10px; color: #aaa; text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-style: italic; }

    @media print {
      body { padding: 10mm 14mm; }
      /* Mantém cores de fundo ao imprimir */
      .parties-block { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>${html}</body>
</html>`)

  win.document.close()

  // Aguarda fontes antes de abrir diálogo de impressão
  win.document.fonts.ready.then(() => {
    win.focus()
    win.print()
  })
}
