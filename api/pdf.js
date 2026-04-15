// ══════════════════════════════════════════════════════════════
//  api/pdf.js — Função Serverless Vercel: gera PDF com Puppeteer
//  Motor real do Chrome = layout 100% idêntico ao preview
// ══════════════════════════════════════════════════════════════

import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

// Configuração da função serverless
export const config = {
  maxDuration: 30, // segundos (Vercel Pro) — no Hobby ficará em 10s
}

const CSS_DOCUMENTO = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', Arial, sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    padding: 16mm 20mm;
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
  .doc-num { font-size: 10px; color: #888; margin-top: 3px; font-weight: 600; }

  .parties-block {
    background: #f8f8f6;
    border: 1px solid #e5e3dc;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 18px 0;
  }
  .parties-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 10px;
  }
  .party { margin-bottom: 8px; }
  .party-role {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #555;
    margin-bottom: 2px;
  }
  .party p { font-size: 11px; color: #1a1a1a; line-height: 1.5; }

  p {
    font-size: 12px;
    color: #333;
    line-height: 1.7;
    margin-bottom: 6px;
    text-align: justify;
  }

  .clausula { margin: 14px 0; }
  .clausula-title {
    font-size: 11px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .clausula-body p { font-size: 11px; }

  strong { font-weight: 700; }

  .signatures-block {
    margin-top: 36px;
    padding-top: 18px;
    border-top: 1px solid #ddd;
  }
  .signatures-title { font-size: 10px; color: #666; margin-bottom: 18px; }

  /* CORREÇÃO CRÍTICA: grid → flex (html2canvas não suporta grid) */
  .sig-grid {
    display: flex;
    flex-direction: row;
    gap: 24px;
  }
  .sig-item {
    flex: 1;
    text-align: center;
  }
  .sig-line {
    border-top: 1px solid #1a1a1a;
    margin-bottom: 6px;
    margin-top: 32px;
  }
  .sig-name { font-size: 11px; font-weight: 600; }
  .sig-role {
    font-size: 9px;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .sig-doc { font-size: 9px; color: #888; margin-top: 1px; }

  .witnesses-block { margin-top: 18px; }
  .witnesses-title {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 12px;
  }

  .doc-aviso {
    font-size: 9px;
    color: #aaa;
    text-align: center;
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid #eee;
    font-style: italic;
  }

  @media print {
    body { padding: 0; }
    .doc-aviso { display: block; }
  }
`

function buildFullHtml(html, title) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
    rel="stylesheet"
  />
  <style>${CSS_DOCUMENTO}</style>
</head>
<body>${html}</body>
</html>`
}

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { html, title = 'documento' } = req.body

  if (!html) {
    return res.status(400).json({ error: 'Campo html é obrigatório' })
  }

  let browser = null

  try {
    // Lança o Chromium serverless
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()

    // Injeta o HTML completo e aguarda recursos (fontes, etc.)
    await page.setContent(buildFullHtml(html, title), {
      waitUntil: 'networkidle0', // espera fontes e recursos carregarem
      timeout: 8000,
    })

    // Gera o PDF com fidelidade total
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        bottom: '16mm',
        left: '20mm',
        right: '20mm',
      },
    })

    await browser.close()
    browser = null

    // Nome seguro para o arquivo
    const safeTitle = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .trim()
      .replace(/\s+/g, '_')
      || 'documento'

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    res.setHeader('Cache-Control', 'no-store')
    return res.send(pdfBuffer)

  } catch (err) {
    console.error('[api/pdf] Erro:', err)
    if (browser) {
      await browser.close().catch(() => {})
    }
    return res.status(500).json({
      error: 'Falha ao gerar PDF',
      details: err.message,
    })
  }
}
