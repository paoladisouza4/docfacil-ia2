import { downloadPDF, printDocument } from '../lib/generatePDF';

/**
 * Serviço global de exportação do DocFácil IA.
 */
export async function exportPDF(html, title) {
  if (!html) {
    console.error("Conteúdo HTML vazio para exportação.");
    return;
  }
  await downloadPDF(html, title);
}

export function exportPrint(html, title) {
  printDocument(html, title);
}
