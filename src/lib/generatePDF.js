// ══════════════════════════════════════════════════════════
// generatePDF.js — CORRIGIDO PARA EVITAR TEXTO QUEBRADO
// ══════════════════════════════════════════════════════════

import { chromium } from 'playwright'

export async function downloadPDF(html, title = 'documento') {
  let browser

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Importante para Vercel/Linux
    })

    const page = await browser.newPage()

    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

        <style>
          /* Forçamos o tamanho real da folha para o Playwright não 'esmagar' o texto */
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; }

          body {
            font-family: 'DM Sans', sans-serif;
            font-size: 11.5pt; /* Usar pt em vez de px é mais estável para PDF */
            line-height: 1.6;
            color: #1a1a1a;
            width: 180mm; /* Garante que o texto não sangre para as margens */
            margin: 0 auto;
          }

          /* Correção das Quebras de Cláusulas */
          .clausula {
            margin: 15px 0;
            page-break-inside: avoid; /* IMPEDE QUE UMA CLÁUSULA QUEBRE NO MEIO DA PÁGINA */
          }

          .parties-block {
            background: #f8f8f6 !important; /* !important garante que a cor apareça no PDF */
            border: 1px solid #e5e3dc;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          p {
            margin-bottom: 8px;
            text-align: justify;
            orphans: 3; /* Evita uma linha sozinha no fim da página */
            widows: 3;  /* Evita uma linha sozinha no topo da página */
          }

          /* Ajuste das Assinaturas para não quebrar o layout */
          .signatures-block {
            margin-top: 50px;
            page-break-inside: avoid;
          }

          .sig-grid {
            display: flex; /* Flex é mais estável que Grid para PDF simples no Playwright */
            justify-content: space-between;
            gap: 40px;
          }

          .sig-item { 
            flex: 1;
            text-align: center; 
          }

          .sig-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            margin-bottom: 5px;
          }

          /* Rodapé Fixo */
          .doc-aviso {
            font-size: 8.5pt;
            color: #999;
            text-align: center;
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
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

    // Espera as fontes carregarem para não bugar o espaçamento
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '25mm',    // Aumentei um pouco a margem para dar respiro
        bottom: '25mm',
        left: '20mm',
        right: '20mm',
      },
    })

    return pdfBuffer

  } catch (err) {
    console.error('Erro ao gerar PDF:', err)
    throw err
  } finally {
    if (browser) await browser.close()
  }
}
