import { useState } from 'react'
import StatusBadge from '../../components/ui/StatusBadge'

const STATUS_FILTERS = [
  { value:'all',      label:'Todos' },
  { value:'rascunho', label:'Rascunhos' },
  { value:'pending',  label:'Pendentes' },
  { value:'signed',   label:'Finalizados' },
]

export default function MyDocuments({ documents, loading, onView, onDelete, showNotif }) {
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [confirm, setConfirm] = useState(null)

  const filtered = documents.filter(d => {
    const matchStatus = filter === 'all' || (d.status || 'rascunho') === filter
    const matchSearch = !search || (d.title || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleDelete = (doc) => {
    if (confirm === doc.fsId || confirm === doc.id) {
      onDelete?.(doc)
      setConfirm(null)
      showNotif?.('Documento excluído.', '🗑️')
    } else {
      setConfirm(doc.fsId || doc.id)
      setTimeout(() => setConfirm(null), 3000)
    }
  }

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">Meus Documentos</div>
        <div className="page-subtitle">{documents.length} documento{documents.length !== 1 ? 's' : ''} gerado{documents.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <input
          type="text"
          placeholder="🔍  Buscar documento..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding:'9px 14px', fontSize:14, background:'var(--surface)',
            border:'1px solid var(--border)', borderRadius:'var(--radius-sm)',
            color:'var(--text)', fontFamily:'inherit', outline:'none', flex:'1', minWidth:200,
          }}
        />
        <div style={{ display:'flex', gap:6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f.value}
              className={`cat-tab${filter === f.value ? ' active' : ''}`}
              style={{ padding:'7px 14px' }}
              onClick={() => setFilter(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" style={{ margin:'0 auto 12px' }} />
          <div className="empty-state-sub">Carregando documentos...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <div className="empty-state-title">
            {search || filter !== 'all' ? 'Nenhum resultado' : 'Nenhum documento ainda'}
          </div>
          <div className="empty-state-sub">
            {search || filter !== 'all' ? 'Tente outros filtros' : 'Crie seu primeiro documento clicando em "Criar Documento"'}
          </div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(doc => (
            <div key={doc.fsId || doc.id} className="doc-item" style={{ padding:'14px 16px' }}>
              <div className="doc-item-icon" style={{ fontSize:24 }}>
                {doc.typeInfo?.emoji || '📄'}
              </div>
              <div className="doc-item-info" onClick={() => onView?.(doc)} style={{ cursor:'pointer' }}>
                <div className="doc-item-name">{doc.title || doc.typeInfo?.name || 'Documento'}</div>
                <div className="doc-item-meta">
                  {new Date(doc.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })}
                  {' · '}<StatusBadge status={doc.status} />
                  {doc.pa?.nome && ` · ${doc.pa.nome}`}
                </div>
              </div>
              <div className="doc-item-actions" style={{ opacity:1 }}>
                <button className="doc-action-btn" onClick={() => onView?.(doc)}>
                  👁 Ver
                </button>
                <button
                  className={`doc-action-btn danger`}
                  onClick={() => handleDelete(doc)}
                  style={(confirm === doc.fsId || confirm === doc.id) ? { background:'var(--red-dim)', borderColor:'var(--red)', color:'var(--red)' } : {}}>
                  {(confirm === doc.fsId || confirm === doc.id) ? '⚠️ Confirmar' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
