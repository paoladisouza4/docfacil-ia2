import { useState } from 'react'
import Sidebar from './Sidebar'
import Header  from './Header'
import Notif   from '../ui/Notif'

export default function AppLayout({ currentPage, onNavigate, docCount, children, notif }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        docCount={docCount}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Header
        currentPage={currentPage}
        onNavigate={onNavigate}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
      />

      <main className="main">
        {children}
      </main>

      <Notif notif={notif} />
    </div>
  )
}
