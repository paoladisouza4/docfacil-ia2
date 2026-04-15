import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../../services/aiService'

const SUGGESTIONS = [
  'Como faço um contrato de prestação de serviços?',
  'O que é cláusula de rescisão?',
  'Qual a diferença entre locação residencial e comercial?',
  'Como funciona o NDA (acordo de confidencialidade)?',
  'Quando devo usar um termo de quitação?',
  'Quais documentos preciso para abrir uma empresa?',
]

export default function AIAssistant() {
  const [history,  setHistory]  = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [history, loading])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role:'user', content:msg }
    setHistory(h => [...h, userMsg])
    setLoading(true)

    try {
      const reply = await sendMessage(history, msg)
      setHistory(h => [...h, { role:'assistant', content:reply }])
    } catch (err) {
      setHistory(h => [...h, {
        role:'assistant',
        content:'Desculpe, ocorreu um erro ao conectar com a IA. Verifique sua conexão e tente novamente.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const clearChat = () => setHistory([])

  return (
    <div className="page active">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <div className="page-title">🤖 Assistente IA</div>
            <div className="page-subtitle">Tire dúvidas sobre documentos, cláusulas e como preencher cada campo</div>
          </div>
          {history.length > 0 && (
            <button className="btn-outline" onClick={clearChat} style={{ fontSize:12 }}>
              🗑️ Limpar conversa
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {history.length === 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text3)', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>
            Sugestões
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i}
                style={{
                  padding:'8px 14px', fontSize:13, color:'var(--text2)',
                  background:'var(--surface)', border:'1px solid var(--border)',
                  borderRadius:20, cursor:'pointer', fontFamily:'inherit', transition:'all .2s',
                }}
                onClick={() => send(s)}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="ia-chat">
        <div className="ia-messages">
          {history.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🤖</div>
              <div style={{ fontSize:14 }}>Olá! Sou o Assistente IA do DocFácil.</div>
              <div style={{ fontSize:13, marginTop:4 }}>Faça uma pergunta sobre documentos ou escolha uma sugestão acima.</div>
            </div>
          )}
          {history.map((msg, i) => (
            <div key={i} className={`ia-msg ${msg.role === 'user' ? 'user' : 'ai'}`}>
              <div className="ia-msg-bubble">
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="ia-msg ai">
              <div className="ia-msg-bubble" style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ animation:'blink 1s infinite' }}>●</span>
                <span style={{ animation:'blink 1s infinite', animationDelay:'.2s' }}>●</span>
                <span style={{ animation:'blink 1s infinite', animationDelay:'.4s' }}>●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ia-input-row">
          <textarea
            className="ia-input"
            rows={1}
            placeholder="Digite sua dúvida sobre documentos..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="ia-send" onClick={() => send()} disabled={loading || !input.trim()}>
            {loading ? '⏳' : '→'}
          </button>
        </div>
      </div>

      <div style={{ fontSize:11, color:'var(--text3)', textAlign:'center', marginTop:12, lineHeight:1.5 }}>
        ⚠️ O assistente fornece orientações gerais sobre documentos. Para situações específicas, consulte um profissional habilitado.
      </div>

      <style>{`@keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }`}</style>
    </div>
  )
}
