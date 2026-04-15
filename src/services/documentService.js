import {
  collection, addDoc, getDocs, getDoc,
  doc, updateDoc, deleteDoc, query, where, orderBy,
} from 'firebase/firestore'
import { db, auth } from '../api/firebaseClient'
import { sanitizeIAOutput } from './aiService'

const COL = 'documents'

function uid() {
  return auth.currentUser?.uid
}

// ─────────────────────────────────────────────────────────────
//  SANITIZAÇÃO
//  Garante que o campo `html` de qualquer documento esteja
//  sempre em HTML limpo — tanto ao salvar quanto ao carregar.
//  Protege contra documentos antigos salvos com Markdown cru.
// ─────────────────────────────────────────────────────────────

function sanitizeDoc(docObj) {
  if (!docObj) return docObj
  return {
    ...docObj,
    html: sanitizeIAOutput(docObj.html || ''),
  }
}

// ─────────────────────────────────────────────────────────────
//  FIRESTORE
// ─────────────────────────────────────────────────────────────

export async function saveDocument(docObj) {
  if (!uid()) throw new Error('Não autenticado')

  // Sanitiza antes de salvar — nunca persiste Markdown cru
  const clean = sanitizeDoc(docObj)

  const ref = await addDoc(collection(db, COL), {
    ...clean,
    userId: uid(),
    createdAt: new Date().toISOString(),
  })
  return { ...clean, fsId: ref.id }
}

export async function updateDocument(fsId, data) {
  if (!fsId) return

  // Sanitiza o html se vier junto no update
  const clean = data.html ? { ...data, html: sanitizeIAOutput(data.html) } : data

  const ref = doc(db, COL, fsId)
  await updateDoc(ref, { ...clean, updatedAt: new Date().toISOString() })
}

export async function deleteDocument(fsId) {
  if (!fsId) return
  await deleteDoc(doc(db, COL, fsId))
}

export async function loadDocuments() {
  if (!uid()) return []
  const q = query(
    collection(db, COL),
    where('userId', '==', uid()),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)

  // Sanitiza ao carregar — corrige documentos antigos salvos com Markdown
  return snap.docs.map(d => sanitizeDoc({ fsId: d.id, ...d.data() }))
}

export async function getDocument(fsId) {
  const snap = await getDoc(doc(db, COL, fsId))
  if (!snap.exists()) return null

  // Sanitiza ao carregar individualmente também
  return sanitizeDoc({ fsId: snap.id, ...snap.data() })
}

// ─────────────────────────────────────────────────────────────
//  LOCAL STORAGE FALLBACK
// ─────────────────────────────────────────────────────────────

const localKey = () => `df_docs_${uid()}`

export function saveDocLocal(docObj) {
  try {
    // Sanitiza antes de salvar localmente
    const clean = sanitizeDoc(docObj)
    const docs = getDocsLocal()
    const idx = docs.findIndex(d => d.id === clean.id)
    if (idx >= 0) docs[idx] = clean
    else docs.unshift(clean)
    localStorage.setItem(localKey(), JSON.stringify(docs))
  } catch (e) { /* storage full */ }
}

export function getDocsLocal() {
  try {
    const docs = JSON.parse(localStorage.getItem(localKey()) || '[]')
    // Sanitiza ao carregar — corrige documentos antigos no localStorage
    return docs.map(sanitizeDoc)
  } catch { return [] }
}

export function removeDocLocal(id) {
  try {
    const docs = getDocsLocal().filter(d => d.id !== id)
    localStorage.setItem(localKey(), JSON.stringify(docs))
  } catch (e) {}
}
