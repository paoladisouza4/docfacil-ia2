// ══════════════════════════════════════════════════════════
// generatePDF.js — Geração de PDF usando Playwright (Chrome headless)
// Backend Node.js ONLY
// ══════════════════════════════════════════════════════════

import { chromium } from 'playwright'

/**
 * Gera PDF real a partir de HTML usando Playwright
 * @param {string} html  - HTML interno do documento
 * @param {string} title - nome do arquivo
 * @returns {Promise<Buffer>} PDF em buffer
 */
export async function generatePDF(html, title = 'documento') {
  const browser = await chromium.launch({
    headless: true,
  })

  try {
    const page = await browser.newPage()

    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />

        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: 'DM Sans', sans-serif;
            font-size: 12px;
            color: #1a1a1a;
            padding: 20mm;
          }

          .doc-header {
            text-align: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #1a1a1a;
          }

          .doc-title {
            font-family: 'DM Serif Display', serif;
            font-size: 14px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }

          .doc-subtitle {
            font-size: 11px;
            color: #555;
          }

          .doc-num {
            font-size: 10px;
            color: #888;
          }

          .parties-block {
            background: #f8f8f6;
            border: 1px solid #e5e3dc;
            border-radius: 6px;
            padding: 14px 18px;
            margin: 18px 0;
          }

          .clausula {
            margin: 14px 0;
          }

          .clausula-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            margin-bottom: 6px;
          }

          .clausula-body p {
            font-size: 11px;
            line-height: 1.7;
            text-align: justify;
          }

          p {
            margin-bottom: 6px;
            line-height: 1.7;
          }

          strong { font-weight: 700; }

          .signatures-block {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }

          .sig-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          .sig-item {
            text-align: center;
          }

          .sig-line {
            border-top: 1px solid #000;
            margin-bottom: 6px;
          }

          .sig-name { font-weight: 600; font-size: 11px; }
          .sig-role { font-size: 9px; color: #555; text-transform: uppercase; }
          .sig-doc { font-size: 9px; color: #888; }

        </style>
      </head>

      <body>
        ${html}
      </body>
      </html>
    `

    await page.setContent(fullHTML, {
      waitUntil: 'networkidle',
    })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    })

    await browser.close()

    return pdfBuffer

  } catch (err) {
    await browser.close()
    throw err
  }
}

/**
 * API helper (opcional)
 * envia PDF direto pro browser download
 */
export async function sendPDFResponse(res, html, title) {
  const pdf = await generatePDF(html, title)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${title}.pdf"`)

  return res.send(pdf)
}
