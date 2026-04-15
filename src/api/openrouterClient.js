const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL    = 'openai/gpt-4o-mini'

/**
 * Envia mensagens para o OpenRouter e retorna o texto da resposta.
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} opts  - { maxTokens, temperature }
 * @returns {Promise<string>}
 */
export async function chatCompletion(messages, opts = {}) {
  const { maxTokens = 1500, temperature = 0.7 } = opts

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
      'HTTP-Referer':  window.location.origin,
      'X-Title':       'DocFácil IA',
    },
    body: JSON.stringify({
      model:       MODEL,
      messages,
      max_tokens:  maxTokens,
      temperature,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `OpenRouter error ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
