// ══════════════════════════════════════════════════════════
//  generatePDF.js — Gera PDF a partir do HTML do documento
// ══════════════════════════════════════════════════════════

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

export async function downloadPDF(html, title = 'documento') {
  try {
    const jsPDF = await ensureJsPDF()
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // iframe invisível para renderizar HTML
    const iframe = document.createElement('iframe')
    iframe.style.cssText =
      'position:fixed;left:-9999px;top:0;width:210mm;height:297mm;border:none;'
    document.body.appendChild(iframe)

    const iDoc = iframe.contentDocument || iframe.contentWindow.document

    iDoc.open()
    iDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <style>
          * { box-sizing:border-box; margin:0; padding:0; }
          body {
            font-family:'DM Sans',sans-serif;
            font-size:12px;
            color:#1a1a1a;
            padding:16mm 20mm;
          }
          p { line-height:1.7; margin-bottom:6px; text-align:justify; }
          .clausula { margin:14px 0; }
          .clausula-title {
            font-weight:700;
            text-transform:uppercase;
            margin-bottom:6px;
          }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
    iDoc.close()

    // espera render
    await new Promise(r => setTimeout(r, 500))

    // 🔥 CORREÇÃO PRINCIPAL (substitui doc.html)
    const element = iDoc.body

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      doc.addPage()
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    doc.save(`${title.replace(/[^a-zA-Z0-9\-_]/g, '_')}.pdf`)

    document.body.removeChild(iframe)
  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
    printDocument(html, title)
  }
}

export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank')
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>${title}</title>
    <meta charset="UTF-8"/>
    <style>
      body { font-family: Arial; padding:20mm; }
      p { line-height:1.7; }
    </style>
    </head><body>${html}</body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 500)
}
