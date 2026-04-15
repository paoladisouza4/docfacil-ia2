import { useState, useEffect, useCallback } from 'react'
import { loadDocuments, saveDocument, updateDocument, deleteDocument, saveDocLocal, getDocsLocal } from '../services/documentService'
import { useAuth } from './useAuth'

export function useDocuments() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const fetchDocs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const docs = await loadDocuments()
      setDocuments(docs)
    } catch (e) {
      // Firestore falhou — tenta local
      const local = getDocsLocal()
      setDocuments(local)
      setError('Usando dados locais — verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const addDocument = useCallback(async (docObj) => {
    try {
      const saved = await saveDocument(docObj)
      setDocuments(prev => [saved, ...prev])
      return saved
    } catch (e) {
      // Salva localmente como fallback
      saveDocLocal(docObj)
      setDocuments(prev => [docObj, ...prev])
      return docObj
    }
  }, [])

  const editDocument = useCallback(async (fsId, data) => {
    try {
      await updateDocument(fsId, data)
      setDocuments(prev => prev.map(d => d.fsId === fsId ? { ...d, ...data } : d))
    } catch (e) { /* fallback silencioso */ }
  }, [])

  const removeDocument = useCallback(async (fsId, localId) => {
    try {
      await deleteDocument(fsId)
    } catch (e) { /* fallback */ }
    setDocuments(prev => prev.filter(d => d.fsId !== fsId && d.id !== localId))
  }, [])

  const stats = {
    total:   documents.length,
    signed:  documents.filter(d => d.status === 'signed').length,
    pending: documents.filter(d => d.status === 'pending').length,
    drafts:  documents.filter(d => !d.status || d.status === 'rascunho').length,
  }

  return { documents, loading, error, stats, fetchDocs, addDocument, editDocument, removeDocument }
}
