import { useState } from 'react'
import Login    from './Login'
import Register from './Register'

export default function AuthModal({ initialTab = 'login', onClose }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="auth-logo">
          DocFácil <span>IA</span>
          <small>Documentos profissionais</small>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => setTab('login')}
          >Entrar</button>
          <button
            className={`auth-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => setTab('register')}
          >Criar conta</button>
        </div>

        {tab === 'login'
          ? <Login onSwitchToRegister={() => setTab('register')} onClose={onClose} />
          : <Register onSwitchToLogin={() => setTab('login')} onClose={onClose} />
        }

        <p className="auth-footer-note">🔒 Protegido com Firebase · Seus dados são privados</p>
      </div>
    </div>
  )
}
