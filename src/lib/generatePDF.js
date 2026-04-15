// ══════════════════════════════════════════════════════════
//  generatePDF.js — Gera PDF a partir do HTML do documento
//  Usa jsPDF via CDN (injetado dinamicamente se necessário)
// ══════════════════════════════════════════════════════════

// Largura fixa de 210mm em pixels a 96dpi — valor estável e confiável.
// NÃO usar body.scrollWidth pois o iframe pode não ter terminado o layout.
const A4_WIDTH_PX = 794

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

/**
 * Aguarda o iframe terminar o layout verificando se scrollWidth estabilizou.
 * Evita capturar o DOM antes das fontes/estilos carregarem.
 */
function waitForIframeLayout(iframe, timeout = 3000) {
  return new Promise((resolve) => {
    const start = Date.now()
    let lastWidth = 0

    const check = () => {
      const body = iframe.contentDocument?.body
      const currentWidth = body?.scrollWidth || 0

      // Considera estável quando a largura parou de mudar OU timeout atingido
      if (currentWidth > 0 && currentWidth === lastWidth) {
        return resolve()
      }
      if (Date.now() - start >= timeout) {
        return resolve()
      }
      lastWidth = currentWidth
      setTimeout(check, 150)
    }

    // Aguarda mínimo de 800ms antes de começar a checar (fontes externas)
    setTimeout(check, 800)
  })
}

/**
 * Baixa o documento como PDF.
 * @param {string} html   - HTML interno do doc-paper
 * @param {string} title  - nome do arquivo (sem .pdf)
 */
export async function downloadPDF(html, title = 'documento') {
  let iframe = null
  try {
    const jsPDF = await ensureJsPDF()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Cria iframe invisível para renderizar o HTML
    iframe = document.createElement('iframe')
    // FIX: largura definida em px para garantir consistência com A4_WIDTH_PX
    iframe.style.cssText = `position:fixed;left:-9999px;top:0;width:${A4_WIDTH_PX}px;height:1123px;border:none;visibility:hidden;`
    document.body.appendChild(iframe)

    const iDoc = iframe.contentDocument || iframe.contentWindow.document
    iDoc.open()
    iDoc.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=${A4_WIDTH_PX}"/>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <style>
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; font-size:12px; color:#1a1a1a; padding:16mm 20mm; width:${A4_WIDTH_PX}px; }
        .doc-header { text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #1a1a1a; }
        .doc-title { font-family:'DM Serif Display',serif; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
        .doc-subtitle { font-size:11px; color:#555; }
        .doc-num { font-size:10px; color:#888; margin-top:3px; font-weight:600; }
        .parties-block { background:#f8f8f6; border:1px solid #e5e3dc; border-radius:6px; padding:14px 18px; margin:18px 0; }
        .parties-title { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#888; margin-bottom:10px; }
        .party { margin-bottom:8px; }
        .party-role { font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#555; margin-bottom:2px; }
        .party p { font-size:11px; color:#1a1a1a; line-height:1.5; }
        p { font-size:12px; color:#333; line-height:1.7; margin-bottom:6px; text-align:justify; }
        .clausula { margin:14px 0; }
        .clausula-title { font-size:11px; font-weight:700; color:#1a1a1a; margin-bottom:6px; text-transform:uppercase; letter-spacing:.5px; }
        .clausula-body p { font-size:11px; }
        strong { font-weight:700; }
        .signatures-block { margin-top:36px; padding-top:18px; border-top:1px solid #ddd; }
        .signatures-title { font-size:10px; color:#666; margin-bottom:18px; }
        .sig-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
        .sig-item { text-align:center; }
        .sig-line { border-top:1px solid #1a1a1a; margin-bottom:6px; }
        .sig-name { font-size:11px; font-weight:600; }
        .sig-role { font-size:9px; color:#555; text-transform:uppercase; letter-spacing:.5px; }
        .sig-doc { font-size:9px; color:#888; margin-top:1px; }
        .witnesses-block { margin-top:18px; }
        .witnesses-title { font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#888; margin-bottom:12px; }
        .doc-aviso { font-size:9px; color:#aaa; text-align:center; margin-top:24px; padding-top:12px; border-top:1px solid #eee; font-style:italic; }
      </style>
      </head><body>${html}</body></html>
    `)
    iDoc.close()

    // FIX: aguarda layout estabilizar em vez de timeout fixo de 800ms
    await waitForIframeLayout(iframe)

    await doc.html(iframe.contentDocument.body, {
      callback: (d) => {
        d.save(`${title.replace(/[^a-zA-Z0-9\-_]/g, '_')}.pdf`)
      },
      x: 0,
      y: 0,
      width: 210,
      windowWidth: A4_WIDTH_PX, // FIX: valor fixo e confiável — era body.scrollWidth
    })

  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
    // Fallback: abre janela de impressão
    printDocument(html, title)
  } finally {
    // FIX: remoção do iframe movida para o finally — garante limpeza mesmo em erro
    if (iframe && document.body.contains(iframe)) {
      document.body.removeChild(iframe)
    }
  }
}

/**
 * Fallback: abre janela de impressão do navegador
 */
export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank')
  if (!win) {
    console.error('Não foi possível abrir janela de impressão. Verifique se popups estão bloqueados.')
    return
  }
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>${title}</title>
    <meta charset="UTF-8"/>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
    <style>
      * { box-sizing:border-box; margin:0; padding:0; }
      body { font-family:'DM Sans',sans-serif; font-size:12px; color:#1a1a1a; padding:20mm 24mm; }
      .doc-header { text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #1a1a1a; }
      .doc-title { font-family:'DM Serif Display',serif; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
      .doc-subtitle { font-size:11px; color:#555; }
      .doc-num { font-size:10px; color:#888; margin-top:3px; }
      .parties-block { background:#f8f8f6; border:1px solid #e5e3dc; border-radius:6px; padding:14px 18px; margin:18px 0; }
      .parties-title { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#888; margin-bottom:10px; }
      .party { margin-bottom:8px; }
      .party-role { font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#555; margin-bottom:2px; }
      .party p, p { font-size:12px; color:#333; line-height:1.8; margin-bottom:6px; text-align:justify; }
      .clausula { margin:14px 0; }
      .clausula-title { font-size:11px; font-weight:700; color:#1a1a1a; margin-bottom:6px; text-transform:uppercase; }
      strong { font-weight:700; }
      .signatures-block { margin-top:40px; padding-top:20px; border-top:1px solid #ddd; }
      .sig-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
      .sig-item { text-align:center; }
      .sig-line { border-top:1px solid #1a1a1a; margin-bottom:6px; }
      .sig-name { font-size:11px; font-weight:600; }
      .sig-role { font-size:9px; color:#555; text-transform:uppercase; }
      .doc-aviso { font-size:9px; color:#aaa; text-align:center; margin-top:24px; padding-top:12px; border-top:1px solid #eee; font-style:italic; }
      @media print { body { padding:10mm; } }
    </style>
    </head><body>${html}</body></html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 600)
}
