import { useState, useRef } from 'react'
import { exportPDF, exportPrint } from '../../services/pdfService'
import StatusBadge from '../../components/ui/StatusBadge'

export default function DocumentView({ document, onBack, onEdit, onDelete, onStatusChange, showNotif }) {
  const [editing,    setEditing]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const paperRef = useRef(null)

  if (!document) {
    return (
      <div className="page active">
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">Documento não encontrado</div>
          <button className="btn-sm" onClick={onBack} style={{ marginTop:16 }}>← Voltar</button>
        </div>
      </div>
    )
  }

  const handlePDF = async () => {
    setExporting(true)
    try {
      const html = paperRef.current?.innerHTML || document.html
      await exportPDF(html, document.title || 'documento')
      showNotif?.('PDF gerado com sucesso! 🎉', '✅')
    } catch {
      exportPrint(document.html, document.title)
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    const html = paperRef.current?.innerHTML || document.html
    exportPrint(html, document.title)
  }

  const handleEditToggle = () => {
    if (editing) {
      // save edited content
      const newHtml = paperRef.current?.innerHTML
      if (newHtml) onEdit?.({ ...document, html: newHtml })
      showNotif?.('Documento salvo!', '✅')
    }
    setEditing(e => !e)
  }

  const handleDelete = () => {
    if (confirmDel) {
      onDelete?.(document)
    } else {
      setConfirmDel(true)
      setTimeout(() => setConfirmDel(false), 3000)
    }
  }

  const statusCycle = { rascunho:'pending', pending:'signed', signed:'rascunho' }
  const statusLabel = { rascunho:'Marcar como Pendente', pending:'Marcar como Finalizado', signed:'Voltar para Rascunho' }

  return (
    <div className="page active">
      {/* Header */}
      <div className="doc-view-header">
        <button className="btn-action secondary" onClick={onBack}>← Voltar</button>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {document.title || 'Documento'}
          </div>
          <div style={{ fontSize:12, color:'var(--text3)', display:'flex', alignItems:'center', gap:8 }}>
            {new Date(document.createdAt).toLocaleDateString('pt-BR')}
            <StatusBadge status={document.status} />
          </div>
        </div>

        <div className="doc-view-actions">
          <button
            className={`btn-action ${editing ? 'primary' : 'secondary'}`}
            onClick={handleEditToggle}>
            {editing ? '💾 Salvar' : '✏️ Editar'}
          </button>
          <button
            className="btn-action secondary"
            onClick={() => onStatusChange?.({ ...document, status: statusCycle[document.status || 'rascunho'] })}>
            {statusLabel[document.status || 'rascunho']}
          </button>
          <button className="btn-action primary" onClick={handlePDF} disabled={exporting}>
            {exporting ? '⏳ Gerando...' : '⬇️ Baixar PDF'}
          </button>
          <button className="btn-action secondary" onClick={handlePrint}>
            🖨️ Imprimir
          </button>
          <button className={`btn-action danger${confirmDel ? '' : ''}`} onClick={handleDelete}>
            {confirmDel ? '⚠️ Confirmar exclusão' : '🗑️ Excluir'}
          </button>
        </div>
      </div>

      {editing && (
        <div style={{
          background:'rgba(201,169,110,.08)', border:'1px solid rgba(201,169,110,.2)',
          borderRadius:'var(--radius-sm)', padding:'10px 16px', marginBottom:16,
          fontSize:13, color:'var(--accent)'
        }}>
          ✏️ Modo de edição ativo — clique no texto do documento para editar diretamente. Clique em "Salvar" quando terminar.
        </div>
      )}

      {/* Document paper */}
      <div
        ref={paperRef}
        className="doc-paper"
        contentEditable={editing}
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: document.html }}
        style={{ outline: editing ? '2px solid var(--accent)' : 'none' }}
      />
    </div>
  )
}
