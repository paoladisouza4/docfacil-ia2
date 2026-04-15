// ══════════════════════════════════════════════════════════
// lib/generatePDF.js — VERSÃO FINAL ABSOLUTA (DOCFÁCIL IA)
// ══════════════════════════════════════════════════════════

import { chromium } from 'playwright';

/**
 * Gera o PDF com fidelidade total, injetando Tailwind e fontes.
 */
export async function downloadPDF(html, title = 'documento') {
  let browser;

  try {
    // 1. Lança o navegador Chromium (Essencial para o Playwright)
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 2. FORÇA VIEWPORT DESKTOP: Evita que o layout tente ser "mobile"
    await page.setViewportSize({ width: 1200, height: 1600 });

    // 3. MONTAGEM DO HTML COM TAILWIND E FONTES (DM SANS / SERIF)
    const fullHTML = `
      <!DOCTYPE html>
      <html lang="pt-br">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <script src="https://cdn.tailwindcss.com"></script>
        
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet"/>
        
        <script>
          // Configuração do Tailwind para reconhecer as fontes do projeto
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['DM Sans', 'sans-serif'],
                  serif: ['DM Serif Display', 'serif'],
                }
              }
            }
          }
        </script>

        <style>
          /* RESET DE IMPRESSÃO PROFISSIONAL */
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          
          body { 
            background-color: white; 
            margin: 0; 
            padding: 0; 
            font-family: 'DM Sans', sans-serif;
            color: #1a1a1a;
          }

          /* CAIXA A4: Trava a largura para evitar texto encavalado */
          .pdf-content-wrapper {
            width: 190mm;
            margin: 0 auto;
            position: relative;
          }

          /* CONTROLE DE QUEBRA DE PÁGINA: Impede cortes no meio de assinaturas ou cláusulas */
          .clausula, .signatures-block, .parties-block, .sig-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          p { text-align: justify; text-justify: inter-word; line-height: 1.6; margin-bottom: 12px; }
          
          /* Garante que tabelas e grids flexíveis do Tailwind funcionem no PDF */
          .flex { display: flex !important; }
          .grid { display: grid !important; }
        </style>
      </head>
      <body class="p-[15mm] bg-white">
        <div class="pdf-content-wrapper">
          ${html}
        </div>
      </body>
      </html>
    `;

    // 4. DEFINE O CONTEÚDO E AGUARDA REDE FICAR OCIOSA (Carregamento do CDN)
    await page.setContent(fullHTML, { 
      waitUntil: 'networkidle' 
    });

    // 5. EMULA MÍDIA DE IMPRESSÃO E AGUARDA CARREGAMENTO DAS FONTES
    await page.emulateMedia({ media: 'print' });
    await page.evaluateHandle('document.fonts.ready');

    // 6. GERAÇÃO DO PDF EM FORMATO A4 COM MARGENS DE SEGURANÇA
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      scale: 1,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      }
    });

    // 7. GERA O DOWNLOAD PARA O USUÁRIO
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Falha na geração do PDF (Playwright):', err);
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Função Fallback para Impressão Direta no Navegador
 */
export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank');
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print { body { padding: 0; } }
          body { padding: 20mm; font-family: sans-serif; }
        </style>
      </head>
      <body>\${html}</body>
    </html>
  `);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 500);
}
