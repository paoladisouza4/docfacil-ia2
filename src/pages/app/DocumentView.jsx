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
          <div className="empty-state-icon">ðŸ“„</div>
          <div className="empty-state-title">Documento nÃ£o encontrado</div>
          <button className="btn-sm" onClick={onBack} style={{ marginTop:16 }}>â† Voltar</button>
        </div>
      </div>
    )
  }

  const handlePDF = async () => {
    setExporting(true)
    try {
      // FIX: garante que sempre usa o HTML renderizado do DOM.
      // Nunca usa document.html como fallback pois pode ser Markdown/JSON cru.
      const html = paperRef.current?.innerHTML
      if (!html || html.trim() === '') {
        showNotif?.('NÃ£o foi possÃ­vel capturar o conteÃºdo do documento.', 'âŒ')
        return
      }
      await exportPDF(html, document.title || 'documento')
      showNotif?.('PDF gerado com sucesso! ðŸŽ‰', 'âœ…')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      // FIX: fallback tambÃ©m usa o HTML renderizado do DOM, nÃ£o document.html cru
      const html = paperRef.current?.innerHTML
      if (html) {
        exportPrint(html, document.title)
      } else {
        showNotif?.('Erro ao gerar PDF. Tente usar a opÃ§Ã£o Imprimir.', 'âŒ')
      }
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    // FIX: sempre usa o HTML renderizado do DOM
    const html = paperRef.current?.innerHTML
    if (!html) return
    exportPrint(html, document.title)
  }

  const handleEditToggle = () => {
    if (editing) {
      const newHtml = paperRef.current?.innerHTML
      if (newHtml) onEdit?.({ ...document, html: newHtml })
      showNotif?.('Documento salvo!', 'âœ…')
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
        <button className="btn-action secondary" onClick={onBack}>â† Voltar</button>

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
            {editing ? 'ðŸ’¾ Salvar' : 'âœï¸ Editar'}
          </button>
          <button
            className="btn-action secondary"
            onClick={() => onStatusChange?.({ ...document, status: statusCycle[document.status || 'rascunho'] })}>
            {statusLabel[document.status || 'rascunho']}
          </button>
          <button className="btn-action primary" onClick={handlePDF} disabled={exporting}>
            {exporting ? 'â³ Gerando...' : 'â¬‡ï¸ Baixar PDF'}
          </button>
          <button className="btn-action secondary" onClick={handlePrint}>
            ðŸ–¨ï¸ Imprimir
          </button>
          <button className={`btn-action danger${confirmDel ? '' : ''}`} onClick={handleDelete}>
            {confirmDel ? 'âš ï¸ Confirmar exclusÃ£o' : 'ðŸ—‘ï¸ Excluir'}
          </button>
        </div>
      </div>

      {editing && (
        <div style={{
          background:'rgba(201,169,110,.08)', border:'1px solid rgba(201,169,110,.2)',
          borderRadius:'var(--radius-sm)', padding:'10px 16px', marginBottom:16,
          fontSize:13, color:'var(--accent)'
        }}>
          âœï¸ Modo de ediÃ§Ã£o ativo â€” clique no texto do documento para editar diretamente. Clique em "Salvar" quando terminar.
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
