const MAP = {
  signed:   { label:'Finalizado', cls:'signed' },
  pending:  { label:'Pendente',   cls:'pending' },
  rascunho: { label:'Rascunho',   cls:'draft' },
}

export default function StatusBadge({ status }) {
  const s = MAP[status] || MAP.rascunho
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>
}
