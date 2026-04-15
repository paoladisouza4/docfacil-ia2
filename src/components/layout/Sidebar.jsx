import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ currentPage, onNavigate, docCount, mobileOpen, onClose }) {
  const { user } = useAuth()
  const name   = user?.displayName || user?.email?.split('@')[0] || 'Usuário'
  const avatar = name[0]?.toUpperCase()

  const navItem = (page, icon, label, badge) => (
    <button
      className={`nav-item${currentPage === page ? ' active' : ''}`}
      onClick={() => { onNavigate(page); onClose?.() }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        dangerouslySetInnerHTML={{ __html: icon }} />
      {label}
      {badge != null && <span className="nav-badge">{badge}</span>}
    </button>
  )

  return (
    <>
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          DocFácil <span>IA</span>
          <small>Documentos Profissionais</small>
        </div>

        <div className="sidebar-section">Principal</div>
        <nav className="sidebar-nav">
          {navItem('dashboard',
            '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
            'Dashboard')}
          {navItem('create',
            '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
            'Criar Documento')}
          {navItem('ai',
            '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
            'Assistente IA', 'IA')}
        </nav>

        <div className="sidebar-section">Documentos</div>
        <nav className="sidebar-nav">
          {navItem('mydocs',
            '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
            'Meus Documentos', docCount)}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={() => { onNavigate('settings'); onClose?.() }}>
            <div className="user-avatar">{avatar}</div>
            <div className="user-info">
              <div className="user-name">{name}</div>
              <div className="user-plan">✦ Conta Gratuita</div>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          style={{ display:'block' }}
          onClick={onClose}
        />
      )}
    </>
  )
}
