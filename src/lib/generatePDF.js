// ══════════════════════════════════════════════════════════
//  generatePDF.js — Versão Final Robusta (DocFácil IA)
//  Gera PDF com fidelidade total em Celular, PC e Tablet
// ══════════════════════════════════════════════════════════

import html2pdf from 'html2pdf.js';

/**
 * Baixa o documento como PDF mantendo a estrutura profissional.
 */
export async function downloadPDF(html, title = 'documento') {
  try {
    const element = document.createElement('div');
    
    // Injetamos o CSS detalhado para garantir a organização em qualquer console
    element.innerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'DM Sans', sans-serif; 
            font-size: 12px; 
            color: #1a1a1a; 
            background: white;
          }
          .pdf-wrapper { 
            width: 190mm; 
            padding: 16mm 20mm; 
            margin: 0 auto;
          }
          .doc-header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #1a1a1a; }
          .doc-title { font-family: 'DM Serif Display', serif; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
          .doc-subtitle { font-size: 11px; color: #555; }
          .doc-num { font-size: 10px; color: #888; margin-top: 3px; font-weight: 600; }
          .parties-block { background: #f8f8f6; border: 1px solid #e5e3dc; border-radius: 6px; padding: 14px 18px; margin: 18px 0; }
          .parties-title { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #888; margin-bottom: 10px; }
          .party { margin-bottom: 8px; }
          .party-role { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #555; margin-bottom: 2px; }
          .party p { font-size: 11px; color: #1a1a1a; line-height: 1.5; }
          p { font-size: 12px; color: #333; line-height: 1.7; margin-bottom: 6px; text-align: justify; }
          .clausula { margin: 14px 0; page-break-inside: avoid; }
          .clausula-title { font-size: 11px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .5px; }
          strong { font-weight: 700; }
          .signatures-block { margin-top: 36px; padding-top: 18px; border-top: 1px solid #ddd; page-break-inside: avoid; }
          .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          .sig-item { text-align: center; }
          .sig-line { border-top: 1px solid #1a1a1a; margin-bottom: 6px; }
          .sig-name { font-size: 11px; font-weight: 600; }
          .sig-role { font-size: 9px; color: #555; text-transform: uppercase; }
          .doc-aviso { font-size: 9px; color: #aaa; text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="pdf-wrapper">
          ${html}
        </div>
      </body>
      </html>
    `;

    const opt = {
      margin: 0,
      filename: `${title.replace(/[^a-zA-Z0-9\-_]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        windowWidth: 800 
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(element).save();

  } catch (err) {
    console.error('Erro detalhado na geração do PDF:', err);
    printDocument(html, title);
  }
}

export function printDocument(html, title = 'documento') {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>body { font-family: sans-serif; padding: 20mm; }</style>
      </head>
      <body>
        ${html}
        <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
      </body>
    </html>
  `);
  win.document.close();
}
