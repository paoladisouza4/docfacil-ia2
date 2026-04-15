import { chatCompletion } from '../api/openrouterClient'
import { IA_SYSTEM_PROMPT } from '../lib/config'

/**
 * Envia uma mensagem para o assistente IA do DocFácil.
 * @param {Array<{role:string,content:string}>} history - histórico completo
 * @param {string} userMessage - nova mensagem do usuário
 * @returns {Promise<string>} resposta da IA
 */
export async function sendMessage(history, userMessage) {
  const messages = [
    { role: 'system', content: IA_SYSTEM_PROMPT },
    ...history,
    { role: 'user', content: userMessage },
  ]
  return chatCompletion(messages, { maxTokens: 1200, temperature: 0.7 })
}

/**
 * Gera um documento completo via IA (tipos gen_*)
 * @param {string} type - tipo do documento IA (gen_curriculo, gen_carta, etc.)
 * @param {object} dados - dados preenchidos pelo usuário
 * @returns {Promise<string>} HTML do documento gerado
 */
export async function generateIADocument(type, dados) {
  const prompts = {
    gen_curriculo: `Gere um currículo profissional completo e bem estruturado em HTML para:
Nome: ${dados.nome}
Objetivo: ${dados.objetivo}
Experiência: ${dados.experiencia}
Formação: ${dados.formacao}
Habilidades: ${dados.habilidades}
Retorne apenas o HTML interno do documento (sem <html><body>), usando classes: doc-header, doc-title, clausula, clausula-title, clausula-body.`,

    gen_carta: `Gere uma carta profissional formal em português brasileiro em HTML para:
Remetente: ${dados.remetente}
Destinatário: ${dados.destinatario}
Assunto: ${dados.assunto}
Conteúdo: ${dados.conteudo}
Retorne apenas o HTML interno (sem <html><body>).`,

    gen_proposta: `Gere uma proposta comercial profissional completa em HTML para:
Empresa: ${dados.empresa}
Cliente: ${dados.cliente}
Serviço/Produto: ${dados.servico}
Valor: ${dados.valor}
Prazo: ${dados.prazo}
Retorne apenas o HTML interno (sem <html><body>).`,

    gen_email: `Gere um e-mail profissional formal em português brasileiro:
Remetente: ${dados.remetente}
Destinatário: ${dados.destinatario}
Assunto: ${dados.assunto}
Conteúdo: ${dados.conteudo}
Tom: ${dados.tom || 'formal'}
Retorne apenas o texto do e-mail formatado, sem HTML.`,

    gen_contrato_ia: `Gere um contrato profissional completo em HTML para:
Tipo: ${dados.tipo}
Parte A: ${dados.parteA}
Parte B: ${dados.parteB}
Objeto: ${dados.objeto}
Valor: ${dados.valor}
Prazo: ${dados.prazo}
Inclua: qualificação das partes, objeto, obrigações, valor, rescisão e foro.
Retorne apenas o HTML interno (sem <html><body>), usando classes doc-header, clausula, clausula-title, clausula-body, signatures-block.`,
  }

  const prompt = prompts[type]
  if (!prompt) throw new Error('Tipo de documento IA não suportado')

  const messages = [
    { role: 'system', content: 'Você é um especialista em documentos jurídicos brasileiros. Gere documentos profissionais e completos.' },
    { role: 'user', content: prompt },
  ]

  return chatCompletion(messages, { maxTokens: 2000, temperature: 0.4 })
}
