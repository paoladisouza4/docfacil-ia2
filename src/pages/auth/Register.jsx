import { useState } from 'react'
import { register, firebaseErrorMsg } from '../../services/authService'

export default function Register({ onSwitchToLogin, onClose }) {
  const [name,  setName]  = useState('')
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !pass) { setError('Preencha todos os campos.'); return }
    if (pass.length < 6) { setError('Senha mínimo 6 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      await register(name, email, pass)
      onClose?.()
    } catch (err) {
      setError(firebaseErrorMsg(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-group">
        <label>Nome completo</label>
        <input type="text" placeholder="Seu nome" value={name}
          onChange={e => setName(e.target.value)} autoComplete="name" />
      </div>
      <div className="field-group">
        <label>E-mail</label>
        <input type="email" placeholder="seu@email.com" value={email}
          onChange={e => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div className="field-group">
        <label>Senha <small style={{ color:'var(--text3)' }}>(mín. 6 caracteres)</small></label>
        <input type="password" placeholder="••••••••" value={pass}
          onChange={e => setPass(e.target.value)} autoComplete="new-password" />
      </div>
      {error && <div className="auth-error">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Criando conta...' : 'Criar conta grátis'}
      </button>
    </form>
  )
}
