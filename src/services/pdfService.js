import { downloadPDF, printDocument } from '../lib/generatePDF'

export async function exportPDF(html, title) {
  if (!html || typeof html !== 'string' || html.trim() === '') {
    console.error('exportPDF: html inválido ou vazio')
    return
  }
  await downloadPDF(html, title)
}

export function exportPrint(html, title) {
  if (!html || typeof html !== 'string' || html.trim() === '') {
    console.error('exportPrint: html inválido ou vazio')
    return
  }
  printDocument(html, title)
}
