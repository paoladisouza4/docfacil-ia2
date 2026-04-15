// ══════════════════════════════════════════════════════════════
//  lib/generatePDF.js — Gera PDF via API serverless (Puppeteer)
//  Layout 100% idêntico ao preview. Funciona em PC e celular.
// ══════════════════════════════════════════════════════════════

/**
 * Chama a função serverless /api/pdf e faz download direto.
 * @param {string} html   - HTML interno do documento (do buildDocHTML)
 * @param {string} title  - Nome do arquivo (sem .pdf)
 */
export async function downloadPDF(html, title = 'documento') {
  try {
    const response = await fetch('/api/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, title }),
    })

    if (!response.ok) {
      // Tenta ler o erro do servidor
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `Erro HTTP ${response.status}`)
    }

    // Converte a resposta em Blob e força o download
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/[^a-zA-Z0-9\-_ ]/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Libera memória
    setTimeout(() => URL.revokeObjectURL(url), 5000)

  } catch (err) {
    console.error('[downloadPDF] Falha na API, usando fallback de impressão:', err)
    // Fallback: abre janela de impressão do navegador
    printDocument(html, title)
  }
}

/**
 * Fallback: abre janela de impressão do navegador.
 * Aguarda fontes carregarem antes de acionar o print.
 * @param {string} html
 * @param {string} title
 */
export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank')

  if (!win) {
    alert('Permita pop-ups para este site e tente novamente.')
    return
  }

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
    rel="stylesheet"
  />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'DM Sans', Arial, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      padding: 20mm 24mm;
      background: #fff;
    }
    .doc-header {
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1a1a1a;
    }
    .doc-title {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 4px;
    }
    .doc-subtitle { font-size: 11px; color: #555; }
    .doc-num { font-size: 10px; color: #888; margin-top: 3px; }
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
    .party { margin-bottom: 8px; }
    .party-role {
      font-size: 9px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: #555; margin-bottom: 2px;
    }
    .party p, p {
      font-size: 12px; color: #333; line-height: 1.8;
      margin-bottom: 6px; text-align: justify;
    }
    .clausula { margin: 14px 0; }
    .clausula-title {
      font-size: 11px; font-weight: 700; color: #1a1a1a;
      margin-bottom: 6px; text-transform: uppercase;
    }
    strong { font-weight: 700; }
    .signatures-block {
      margin-top: 40px; padding-top: 20px;
      border-top: 1px solid #ddd;
    }
    .signatures-title { font-size: 10px; color: #666; margin-bottom: 18px; }
    /* CORREÇÃO: flex em vez de grid */
    .sig-grid { display: flex; flex-direction: row; gap: 24px; }
    .sig-item { flex: 1; text-align: center; }
    .sig-line {
      border-top: 1px solid #1a1a1a;
      margin-bottom: 6px; margin-top: 32px;
    }
    .sig-name { font-size: 11px; font-weight: 600; }
    .sig-role {
      font-size: 9px; color: #555;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .sig-doc { font-size: 9px; color: #888; margin-top: 1px; }
    .witnesses-block { margin-top: 18px; }
    .witnesses-title {
      font-size: 9px; font-weight: 700; letter-spacing: 1px;
      text-transform: uppercase; color: #888; margin-bottom: 12px;
    }
    .doc-aviso {
      font-size: 9px; color: #aaa; text-align: center;
      margin-top: 24px; padding-top: 12px;
      border-top: 1px solid #eee; font-style: italic;
    }
    @media print {
      body { padding: 10mm 14mm; }
      @page { size: A4; margin: 10mm; }
    }
  </style>
</head>
<body>${html}</body>
</html>`)

  win.document.close()

  // Aguarda as fontes carregarem de verdade antes de imprimir
  win.onload = async () => {
    try {
      await win.document.fonts.ready
    } catch (_) {
      // fallback: aguarda 1.5s
      await new Promise(r => setTimeout(r, 1500))
    }
    win.focus()
    win.print()
  }
}
