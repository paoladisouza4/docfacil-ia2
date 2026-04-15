import { chatCompletion } from '../api/openrouterClient'
import { IA_SYSTEM_PROMPT } from '../lib/config'

// ─────────────────────────────────────────────
//  SANITIZADOR DE SAÍDA DA IA
//  Garante que QUALQUER resposta da IA vire HTML
//  limpo antes de ser salva ou exibida.
// ─────────────────────────────────────────────

/**
 * Remove blocos de código markdown que a IA às vezes insere:
 * ```html ... ``` ou ``` ... ```
 */
function stripCodeFences(text) {
  return text
    .replace(/```html\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()
}

/**
 * Verifica se o texto é HTML real (contém pelo menos uma tag).
 */
function isHTML(text) {
  return /<[a-z][\s\S]*>/i.test(text)
}

/**
 * Converte Markdown básico para HTML.
 * Cobre os casos mais comuns retornados por LLMs.
 */
function markdownToHTML(text) {
  return text
    // Títulos
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="clausula-title">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="doc-title">$1</h1>')
    // Negrito e itálico
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Listas não ordenadas
    .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
    // Listas ordenadas
    .replace(/^\s*\d+\. (.+)$/gm, '<li>$1</li>')
    // Agrupa <li> soltos em <ul>
    .replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>')
    // Linha horizontal
    .replace(/^[-*_]{3,}$/gm, '<hr/>')
    // Parágrafos: linhas em branco viram quebras de parágrafo
    .replace(/\n{2,}/g, '</p><p class="clausula-body">')
    // Quebras simples
    .replace(/\n/g, '<br/>')
    // Envolve tudo em parágrafo se não começar com tag
    .replace(/^(?!<)/, '<p class="clausula-body">')
    .replace(/(?<!>)$/, '</p>')
}

/**
 * Sanitizador principal.
 * Recebe qualquer saída da IA e retorna HTML limpo garantido.
 */
export function sanitizeIAOutput(raw) {
  if (!raw || typeof raw !== 'string') return '<p>Conteúdo não disponível.</p>'

  // 1. Remove code fences que a IA às vezes coloca em volta do HTML
  let text = stripCodeFences(raw)

  // 2. Se já for HTML válido, retorna direto (apenas sem code fences)
  if (isHTML(text)) return text

  // 3. Se for Markdown ou texto puro, converte para HTML
  return markdownToHTML(text)
}

// ─────────────────────────────────────────────
//  SERVIÇOS DE IA
// ─────────────────────────────────────────────

/**
 * Envia uma mensagem para o assistente IA do DocFácil.
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
 * Gera um documento completo via IA (tipos gen_*).
 * SEMPRE retorna HTML limpo, independente do que a IA devolver.
 */
export async function generateIADocument(type, dados) {
  const prompts = {
    gen_curriculo: `Gere um currículo profissional completo e bem estruturado em HTML para:
Nome: ${dados.nome}
Objetivo: ${dados.objetivo}
Experiência: ${dados.experiencia}
Formação: ${dados.formacao}
Habilidades: ${dados.habilidades}
IMPORTANTE: Retorne APENAS o HTML interno (sem <!DOCTYPE>, sem <html>, sem <body>, sem <head>).
Use exatamente estas classes CSS: doc-header, doc-title, clausula, clausula-title, clausula-body.
NÃO use markdown, NÃO use blocos de código, NÃO use crases.`,

    gen_carta: `Gere uma carta profissional formal em português brasileiro em HTML para:
Remetente: ${dados.remetente}
Destinatário: ${dados.destinatario}
Assunto: ${dados.assunto}
Conteúdo: ${dados.conteudo}
IMPORTANTE: Retorne APENAS o HTML interno (sem <!DOCTYPE>, sem <html>, sem <body>, sem <head>).
NÃO use markdown, NÃO use blocos de código, NÃO use crases.`,

    gen_proposta: `Gere uma proposta comercial profissional completa em HTML para:
Empresa: ${dados.empresa}
Cliente: ${dados.cliente}
Serviço/Produto: ${dados.servico}
Valor: ${dados.valor}
Prazo: ${dados.prazo}
IMPORTANTE: Retorne APENAS o HTML interno (sem <!DOCTYPE>, sem <html>, sem <body>, sem <head>).
Use as classes CSS: doc-header, doc-title, clausula, clausula-title, clausula-body.
NÃO use markdown, NÃO use blocos de código, NÃO use crases.`,

    gen_email: `Gere um e-mail profissional formal em português brasileiro em HTML para:
Remetente: ${dados.remetente}
Destinatário: ${dados.destinatario}
Assunto: ${dados.assunto}
Conteúdo: ${dados.conteudo}
Tom: ${dados.tom || 'formal'}
IMPORTANTE: Retorne APENAS o HTML interno (sem <!DOCTYPE>, sem <html>, sem <body>, sem <head>).
Use tags <p>, <strong>, <br> para formatar o e-mail.
NÃO use markdown, NÃO use blocos de código, NÃO use crases.`,

    gen_contrato_ia: `Gere um contrato profissional completo em HTML para:
Tipo: ${dados.tipo}
Parte A: ${dados.parteA}
Parte B: ${dados.parteB}
Objeto: ${dados.objeto}
Valor: ${dados.valor}
Prazo: ${dados.prazo}
Inclua: qualificação das partes, objeto, obrigações, valor, rescisão e foro.
IMPORTANTE: Retorne APENAS o HTML interno (sem <!DOCTYPE>, sem <html>, sem <body>, sem <head>).
Use exatamente estas classes CSS: doc-header, clausula, clausula-title, clausula-body, signatures-block.
NÃO use markdown, NÃO use blocos de código, NÃO use crases.`,
  }

  const prompt = prompts[type]
  if (!prompt) throw new Error('Tipo de documento IA não suportado: ' + type)

  const messages = [
    {
      role: 'system',
      content: `Você é um especialista em documentos jurídicos e profissionais brasileiros.
Gere documentos completos e profissionais SEMPRE em HTML puro.
REGRAS ABSOLUTAS:
1. Nunca use markdown (**, ##, -, *, _)
2. Nunca envolva o HTML em blocos de código (\`\`\`html ou \`\`\`)
3. Retorne apenas o HTML interno, sem <!DOCTYPE>, <html>, <body> ou <head>
4. Use apenas tags HTML válidas: <div>, <p>, <h1>-<h4>, <strong>, <em>, <ul>, <li>, <br>, <hr>
5. Use as classes CSS fornecidas no prompt`,
    },
    { role: 'user', content: prompt },
  ]

  const raw = await chatCompletion(messages, { maxTokens: 2000, temperature: 0.4 })

  // GARANTIA FINAL: sanitiza independente do que a IA retornou
  return sanitizeIAOutput(raw)
}
