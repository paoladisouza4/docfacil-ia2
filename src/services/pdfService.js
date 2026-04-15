import { downloadPDF, printDocument } from '../lib/generatePDF'

export async function exportPDF(html, title) {
  await downloadPDF(html, title)
}

export function exportPrint(html, title) {
  printDocument(html, title)
}
