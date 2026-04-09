// api/ia.js â€” Vercel Serverless Function
// Roda no servidor â€” a key nunca chega ao cliente

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'MÃ©todo nÃ£o permitido' });

  try {
    const { messages = [], system = '', max_tokens = 1500 } = req.body;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_KEY}`,
        'HTTP-Referer':  'https://docfacil-ia.vercel.app',
        'X-Title':       'DocFÃ¡cil IA',
      },
      body: JSON.stringify({
        model:      'openrouter/auto',
        max_tokens,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          ...messages.slice(-16),
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenRouter error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Erro na IA' });
    }

    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: [{ type: 'text', text }] });

  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
}
