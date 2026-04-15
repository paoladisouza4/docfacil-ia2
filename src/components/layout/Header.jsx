import { logout } from '../../services/authService'

const PAGE_TITLES = {
  dashboard:'Dashboard', create:'Criar Documento',
  mydocs:'Meus Documentos', ai:'Assistente IA',
  settings:'Configurações', document:'Visualizar Documento',
}

export default function Header({ currentPage, onNavigate, onToggleSidebar }) {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="header">
      <button className="header-burger" onClick={onToggleSidebar} style={{ display:'flex' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="header-title">
        {PAGE_TITLES[currentPage] || ''}
      </div>

      <div className="header-actions">
        <button className="btn-sm" onClick={() => onNavigate('create')}>+ Novo Doc</button>
        <button className="btn-outline" onClick={handleLogout}>Sair</button>
      </div>
    </header>
  )
}
