export default function Notif({ notif }) {
  return (
    <div className={`notif${notif ? ' show' : ''}`}>
      <span>{notif?.icon}</span>
      <span>{notif?.msg}</span>
    </div>
  )
}
