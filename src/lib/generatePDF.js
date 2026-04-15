// ══════════════════════════════════════════════════════════
// generatePDF.js — CÓDIGO FINAL COMPLETO E CORRIGIDO
// ══════════════════════════════════════════════════════════

import { chromium } from 'playwright'

/**
 * Gera o PDF com layout fixo e alta fidelidade (Global)
 * @param {string} html   - Conteúdo HTML do documento
 * @param {string} title  - Nome do arquivo
 */
export async function downloadPDF(html, title = 'documento') {
  let browser

  try {
    // Lançamento com argumentos para garantir execução estável em produção (Vercel/Node)
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    })

    const page = await browser.newPage()

    // AJUSTE GLOBAL 1: Força o tamanho do 'visor' para 1200px.
    // Isso impede que o Playwright ache que está em um celular e quebre o texto.
    await page.setViewportSize({ width: 1200, height: 1600 });

    const fullHTML = `
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>

        <style>
          /* Reset de Impressão */
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; }

          body {
            font-family: 'DM Sans', sans-serif;
            font-size: 11pt; /* Fonte em pt garante que o PDF seja idêntico em qualquer PC */
            color: #1a1a1a;
            line-height: 1.5;
            width: 100%;
            margin: 0;
            padding: 0;
          }

          /* AJUSTE GLOBAL 2: Impede que blocos de texto quebrem de forma feia entre as páginas */
          .clausula, .parties-block, .signatures-block, .party, .sig-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          /* Justificação de texto profissional sem 'buracos' */
          p {
            text-align: justify;
            text-justify: inter-word;
            margin-bottom: 8px;
          }

          /* Garante que o fundo cinza da qualificação apareça no PDF */
          .parties-block {
            background-color: #f8f8f6 !important;
            border: 1px solid #e5e3dc;
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 20px;
          }

          /* Layout de assinaturas lado a lado sem quebrar */
          .sig-grid {
            display: flex !important;
            justify-content: space-between !important;
            gap: 40px;
            margin-top: 40px;
          }

          .sig-item {
            flex: 1;
            text-align: center;
          }

          .sig-line {
            border-top: 1px solid #000;
            margin-bottom: 5px;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div style="padding: 15mm;">
          ${html}
        </div>
      </body>
      </html>
    `

    // Define o conteúdo e espera o carregamento total
    await page.setContent(fullHTML, {
      waitUntil: 'networkidle', 
    })

    // AJUSTE GLOBAL 3: Emula o comportamento de 'Imprimir' (Ctrl+P)
    await page.emulateMedia({ media: 'print' });

    // AJUSTE GLOBAL 4: Espera as fontes do Google carregarem antes de "tirar a foto" do PDF
    // Isso evita que o PDF use a fonte padrão do sistema, que costuma ser maior e quebrar o layout.
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      scale: 1,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
      },
    })

    return pdfBuffer

  } catch (err) {
    console.error('Erro ao gerar PDF no DocFácil IA:', err)
    throw err
  } finally {
    if (browser) await browser.close()
  }
}

/**
 * Fallback para impressão direta via navegador (Client-side)
 */
export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank')
  win.document.write(`<html><head><title>${title}</title></head><body>${html}</body></html>`)
  win.document.close()
  setTimeout(() => {
    win.focus()
    win.print()
  }, 500)
}
