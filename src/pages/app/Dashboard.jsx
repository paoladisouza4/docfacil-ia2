import { useAuth } from '../../hooks/useAuth'
import { getGreeting } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'

const QUICK_TYPES = [
  { id:'servico',        icon:'🛠️', name:'Prestação de Serviços' },
  { id:'aluguel_res',    icon:'🏠', name:'Aluguel Residencial' },
  { id:'freelancer',     icon:'💻', name:'Freelancer' },
  { id:'recibo',         icon:'🧾', name:'Recibo' },
  { id:'nda',            icon:'🔒', name:'NDA' },
  { id:'decl_residencia',icon:'📋', name:'Declaração' },
]

export default function Dashboard({ documents, stats, onNavigate, onQuickCreate }) {
  const { user } = useAuth()
  const firstName = (user?.displayName || user?.email || 'Usuário').split(' ')[0]
  const recent = documents.slice(0, 5)

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">{getGreeting()}, {firstName} 👋</div>
        <div className="page-subtitle">Crie, edite e baixe seus documentos profissionais</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card gold">
          <div className="stat-icon">📄</div>
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-change">documentos</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Prontos</div>
          <div className="stat-value">{stats.signed}</div>
          <div className="stat-change">finalizados</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">⏳</div>
          <div className="stat-label">Pendentes</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-change">aguardando</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">📝</div>
          <div className="stat-label">Rascunhos</div>
          <div className="stat-value">{stats.drafts}</div>
          <div className="stat-change">em edição</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Documentos Recentes</div>
            <span className="card-action" onClick={() => onNavigate('mydocs')}>Ver todos →</span>
          </div>
          <div className="doc-list">
            {recent.length === 0 ? (
              <div className="empty-state" style={{ padding:'30px 0' }}>
                <div style={{ fontSize:28 }}>📂</div>
                <div style={{ fontSize:13, color:'var(--text3)', marginTop:8 }}>Nenhum documento ainda</div>
              </div>
            ) : recent.map(d => (
              <div key={d.fsId || d.id} className="doc-item" onClick={() => onNavigate('document', d)}>
                <div className="doc-item-icon">{d.typeInfo?.emoji || '📄'}</div>
                <div className="doc-item-info">
                  <div className="doc-item-name">{d.title || d.typeInfo?.name || 'Documento'}</div>
                  <div className="doc-item-meta">
                    {new Date(d.createdAt).toLocaleDateString('pt-BR')}
                    {' · '}<StatusBadge status={d.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Criar Rapidamente</div>
            <span className="card-action" onClick={() => onNavigate('create')}>Todos →</span>
          </div>
          <div className="quick-types">
            {QUICK_TYPES.map(t => (
              <div key={t.id} className="quick-type" onClick={() => onQuickCreate(t.id)}>
                <div className="quick-type-icon">{t.icon}</div>
                <div className="quick-type-name">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ia-banner" onClick={() => onNavigate('ai')}>
        <div className="ia-banner-icon">🤖</div>
        <div className="ia-banner-content">
          <div className="ia-banner-title">Assistente IA disponível</div>
          <div className="ia-banner-sub">Peça ajuda para redigir, revise campos e gere modelos personalizados</div>
        </div>
        <div className="ia-banner-cta">Usar IA →</div>
      </div>
    </div>
  )
}
