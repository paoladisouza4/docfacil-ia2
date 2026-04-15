// ══════════════════════════════════════════════════════════
//  generatePDF.js — DocFácil IA v3
//  Estratégia: janela isolada + @media print
//  - Sem dependências externas além do jsPDF já instalado
//  - Fontes aguardadas via document.fonts.ready
//  - Layout A4 fixo, idêntico ao preview
// ══════════════════════════════════════════════════════════

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap'

function getStyles() {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: white;
      -webkit-font-smoothing: antialiased;
    }

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

    .parties-block {
      background: #f8f8f6 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
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

    .signatures-block { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ddd; }
    .signatures-title { font-size: 12px; color: #666; margin-bottom: 24px; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .sig-item { text-align: center; }
    .sig-line { border-top: 1px solid #1a1a1a; margin-bottom: 8px; }
    .sig-name { font-size: 13px; font-weight: 600; color: #1a1a1a; }
    .sig-role { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: .5px; }
    .sig-doc { font-size: 11px; color: #888; margin-top: 2px; }

    .witnesses-block { margin-top: 24px; }
    .witnesses-title {
      font-size: 11px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: #888; margin-bottom: 16px;
    }

    .doc-aviso {
      font-size: 10px; color: #aaa; text-align: center;
      margin-top: 32px; padding-top: 16px;
      border-top: 1px solid #eee; font-style: italic;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 18mm 20mm;
      }
      body { font-size: 13px; width: 100%; }
      .clausula,
      .parties-block,
      .signatures-block,
      .sig-item {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `
}

function buildPage(html, title = '') {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="${FONT_URL}" rel="stylesheet"/>
  <style>${getStyles()}</style>
</head>
<body>${html}</body>
</html>`
}

function waitFonts(win) {
  return new Promise((resolve) => {
    if (win.document.fonts?.ready) {
      win.document.fonts.ready.then(resolve)
    } else {
      setTimeout(resolve, 1500)
    }
  })
}

/**
 * Abre janela limpa e dispara impressão/salvar PDF.
 * No celular: Chrome → menu → "Imprimir" → "Salvar como PDF"
 */
export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Permita pop-ups para este site e tente novamente.')
    return
  }
  win.document.open()
  win.document.write(buildPage(html, title))
  win.document.close()

  waitFonts(win).then(() => {
    win.focus()
    win.print()
  })
}

/**
 * Baixa como PDF via html2canvas + jsPDF.
 * Fallback automático para printDocument se html2canvas falhar.
 */
export async function downloadPDF(html, title = 'documento') {
  try {
    // jsPDF já instalado no package.json — importa do pacote, não do CDN
    const { jsPDF } = await import('jspdf')

    // html2canvas via CDN (não está no package.json)
    const html2canvas = await new Promise((resolve, reject) => {
      if (window.html2canvas) { resolve(window.html2canvas); return }
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
      s.onload = () => resolve(window.html2canvas)
      s.onerror = () => reject(new Error('html2canvas falhou ao carregar'))
      document.head.appendChild(s)
    })

    // Iframe oculto com largura A4 exata (794px = 210mm a 96dpi)
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1px;border:none;visibility:hidden;'
    document.body.appendChild(iframe)

    const iDoc = iframe.contentDocument || iframe.contentWindow.document
    iDoc.open()
    iDoc.write(buildPage(html, title))
    iDoc.close()

    // Espera fontes de verdade
    await waitFonts(iframe.contentWindow)

    // Ajusta altura ao conteúdo real antes de capturar
    iframe.style.height = iDoc.body.scrollHeight + 'px'

    // Captura pixel-perfect em escala 2× (texto nítido)
    const canvas = await html2canvas(iDoc.body, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      width: 794,
    })

    document.body.removeChild(iframe)

    // Monta PDF página a página
    const imgData = canvas.toDataURL('image/jpeg', 0.96)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgH  = (canvas.height * pageW) / canvas.width

    let yPos = 0
    let pagesAdded = 0
    while (yPos < imgH) {
      if (pagesAdded > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, -yPos, pageW, imgH)
      yPos += pageH
      pagesAdded++
    }

    pdf.save(`${title.replace(/[^a-zA-Z0-9\-_]/g, '_')}.pdf`)

  } catch (err) {
    console.warn('downloadPDF falhou, usando impressão como fallback:', err)
    printDocument(html, title)
  }
}
