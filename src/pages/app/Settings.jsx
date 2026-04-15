import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateUserProfile, changePassword } from '../../services/authService'
import { logout } from '../../services/authService'

export default function Settings({ showNotif, docCount }) {
  const { user } = useAuth()
  const [name,    setName]    = useState(user?.displayName || '')
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [passErr, setPassErr] = useState('')

  const handleSaveName = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await updateUserProfile(name.trim())
      showNotif?.('Nome atualizado com sucesso!', '✅')
    } catch {
      showNotif?.('Erro ao atualizar nome.', '⚠️')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePass = async () => {
    if (!oldPass || !newPass) { setPassErr('Preencha os dois campos.'); return }
    if (newPass.length < 6) { setPassErr('Nova senha deve ter mínimo 6 caracteres.'); return }
    setPassErr('')
    setSaving(true)
    try {
      await changePassword(oldPass, newPass)
      setOldPass(''); setNewPass('')
      showNotif?.('Senha alterada com sucesso!', '✅')
    } catch (err) {
      setPassErr(err.message || 'Senha atual incorreta.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => logout()

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">Configurações</div>
        <div className="page-subtitle">Gerencie sua conta e preferências</div>
      </div>

      <div className="settings-grid">

        {/* Perfil */}
        <div className="settings-card">
          <h3>👤 Perfil</h3>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
            <div className="user-avatar" style={{ width:48, height:48, fontSize:20 }}>
              {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:600, color:'var(--text)' }}>{user?.displayName || '—'}</div>
              <div style={{ fontSize:13, color:'var(--text3)' }}>{user?.email}</div>
            </div>
          </div>
          <div className="field-group">
            <label>Nome de exibição</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <button className="btn-primary" onClick={handleSaveName} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar nome'}
          </button>
        </div>

        {/* Segurança */}
        <div className="settings-card">
          <h3>🔒 Segurança</h3>
          <div className="field-group">
            <label>Senha atual</label>
            <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="field-group">
            <label>Nova senha</label>
            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nova senha (mín. 6 caracteres)" />
          </div>
          {passErr && <div className="auth-error">{passErr}</div>}
          <button className="btn-primary" onClick={handleChangePass} disabled={saving}>
            {saving ? 'Alterando...' : 'Alterar senha'}
          </button>
        </div>

        {/* Resumo da conta */}
        <div className="settings-card">
          <h3>📊 Minha conta</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
              <span style={{ color:'var(--text2)' }}>Plano</span>
              <span style={{ color:'var(--accent)', fontWeight:600 }}>✦ Gratuito</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
              <span style={{ color:'var(--text2)' }}>Documentos gerados</span>
              <span style={{ color:'var(--text)', fontWeight:600 }}>{docCount}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
              <span style={{ color:'var(--text2)' }}>E-mail verificado</span>
              <span style={{ color: user?.emailVerified ? 'var(--green)' : 'var(--text3)', fontWeight:600 }}>
                {user?.emailVerified ? '✓ Sim' : '— Não'}
              </span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14 }}>
              <span style={{ color:'var(--text2)' }}>Conta criada</span>
              <span style={{ color:'var(--text)' }}>
                {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Sair */}
        <div className="settings-card">
          <h3>🚪 Sessão</h3>
          <p style={{ fontSize:13, color:'var(--text2)', marginBottom:16, lineHeight:1.6 }}>
            Ao sair, você precisará fazer login novamente para acessar seus documentos.
          </p>
          <button
            className="btn-action danger"
            style={{ width:'100%', justifyContent:'center' }}
            onClick={handleLogout}>
            Sair da conta
          </button>
          <div style={{ marginTop:16, padding:'12px 14px', background:'var(--surface2)', borderRadius:'var(--radius-sm)', fontSize:12, color:'var(--text3)', lineHeight:1.6 }}>
            ⚠️ O DocFácil gera modelos de referência e não presta assessoria ou consultoria de qualquer natureza.
          </div>
        </div>

      </div>
    </div>
  )
}
