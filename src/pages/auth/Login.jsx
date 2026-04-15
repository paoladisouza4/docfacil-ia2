import { useState } from 'react'
import { login } from '../../services/authService'
import { firebaseErrorMsg } from '../../services/authService'

export default function Login({ onSwitchToRegister, onClose }) {
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !pass) { setError('Preencha e-mail e senha.'); return }
    setError(''); setLoading(true)
    try {
      await login(email, pass)
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
        <label>E-mail</label>
        <input type="email" placeholder="seu@email.com" value={email}
          onChange={e => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div className="field-group">
        <label>Senha</label>
        <input type="password" placeholder="••••••••" value={pass}
          onChange={e => setPass(e.target.value)} autoComplete="current-password" />
      </div>
      {error && <div className="auth-error">{error}</div>}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar na conta'}
      </button>
    </form>
  )
}
