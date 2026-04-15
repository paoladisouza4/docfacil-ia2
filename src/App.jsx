import { useState, useCallback } from 'react'
import { AuthProvider }   from './lib/authContext'
import { useAuth }        from './hooks/useAuth'
import { useDocuments }   from './hooks/useDocuments'
import { useNotif }       from './hooks/useNotif'
import AppLayout          from './components/layout/AppLayout'
import Landing            from './pages/Landing'
import Dashboard          from './pages/app/Dashboard'
import CreateDocument     from './pages/app/CreateDocument'
import DocumentView       from './pages/app/DocumentView'
import MyDocuments        from './pages/app/MyDocuments'
import AIAssistant        from './pages/app/AIAssistant'
import Settings           from './pages/app/Settings'

// ── Loading screen ──────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">DocFácil <span>IA</span></div>
      <div className="loading-spinner" />
      <div className="loading-text">Carregando...</div>
    </div>
  )
}

// ── Authenticated app shell ──────────────────────────────────
function AppShell() {
  const [page,        setPage]        = useState('dashboard')
  const [viewDoc,     setViewDoc]     = useState(null)
  const [quickTypeId, setQuickTypeId] = useState(null)

  const { notif, showNotif } = useNotif()
  const { documents, loading, stats, addDocument, editDocument, removeDocument } = useDocuments()

  const navigate = useCallback((target, data) => {
    if (target === 'document' && data) {
      setViewDoc(data)
      setPage('document')
    } else {
      setPage(target)
      if (target !== 'document') setViewDoc(null)
      if (target !== 'create') setQuickTypeId(null)
    }
  }, [])

  const handleQuickCreate = useCallback((typeId) => {
    setQuickTypeId(typeId)
    setPage('create')
  }, [])

  const handleDocCreated = useCallback(async (docObj) => {
    const saved = await addDocument(docObj)
    showNotif('Documento gerado com sucesso! 🎉', '✅')
    setViewDoc(saved)
    setPage('document')
  }, [addDocument, showNotif])

  const handleDocEdit = useCallback(async (docObj) => {
    if (!docObj.fsId) return
    await editDocument(docObj.fsId, { html: docObj.html, updatedAt: new Date().toISOString() })
    setViewDoc(docObj)
  }, [editDocument])

  const handleStatusChange = useCallback(async (docObj) => {
    if (docObj.fsId) {
      await editDocument(docObj.fsId, { status: docObj.status })
    }
    setViewDoc(docObj)
    // update local view
    showNotif('Status atualizado!', '✅')
  }, [editDocument, showNotif])

  const handleDocDelete = useCallback(async (docObj) => {
    await removeDocument(docObj.fsId, docObj.id)
    showNotif('Documento excluído.', '🗑️')
    setPage('mydocs')
    setViewDoc(null)
  }, [removeDocument, showNotif])

  const currentPage = page

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={navigate}
      docCount={documents.length}
      notif={notif}
    >
      {/* Each page is rendered but only the active one shown via CSS */}
      {page === 'dashboard' && (
        <Dashboard
          documents={documents}
          stats={stats}
          onNavigate={navigate}
          onQuickCreate={handleQuickCreate}
        />
      )}

      {page === 'create' && (
        <CreateDocument
          onDocumentCreated={handleDocCreated}
          quickTypeId={quickTypeId}
        />
      )}

      {page === 'document' && (
        <DocumentView
          document={viewDoc}
          onBack={() => navigate('mydocs')}
          onEdit={handleDocEdit}
          onDelete={handleDocDelete}
          onStatusChange={handleStatusChange}
          showNotif={showNotif}
        />
      )}

      {page === 'mydocs' && (
        <MyDocuments
          documents={documents}
          loading={loading}
          onView={(doc) => navigate('document', doc)}
          onDelete={handleDocDelete}
          showNotif={showNotif}
        />
      )}

      {page === 'ai' && <AIAssistant />}

      {page === 'settings' && (
        <Settings
          showNotif={showNotif}
          docCount={documents.length}
        />
      )}
    </AppLayout>
  )
}

// ── Auth guard ────────────────────────────────────────────────
function AuthGuard() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!user)   return <Landing />
  return <AppShell />
}

// ── Root ─────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  )
}
