import {
  collection, addDoc, getDocs, getDoc,
  doc, updateDoc, deleteDoc, query, where, orderBy,
} from 'firebase/firestore'
import { db, auth } from '../api/firebaseClient'

const COL = 'documents'

function uid() {
  return auth.currentUser?.uid
}

export async function saveDocument(docObj) {
  if (!uid()) throw new Error('Não autenticado')
  const ref = await addDoc(collection(db, COL), {
    ...docObj,
    userId: uid(),
    createdAt: new Date().toISOString(),
  })
  return { ...docObj, fsId: ref.id }
}

export async function updateDocument(fsId, data) {
  if (!fsId) return
  const ref = doc(db, COL, fsId)
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() })
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
  return snap.docs.map(d => ({ fsId: d.id, ...d.data() }))
}

export async function getDocument(fsId) {
  const snap = await getDoc(doc(db, COL, fsId))
  if (!snap.exists()) return null
  return { fsId: snap.id, ...snap.data() }
}

// ── Local storage fallback ───────────────────────────────────
const localKey = () => `df_docs_${uid()}`

export function saveDocLocal(docObj) {
  try {
    const docs = getDocsLocal()
    const idx = docs.findIndex(d => d.id === docObj.id)
    if (idx >= 0) docs[idx] = docObj
    else docs.unshift(docObj)
    localStorage.setItem(localKey(), JSON.stringify(docs))
  } catch (e) { /* storage full */ }
}

export function getDocsLocal() {
  try {
    return JSON.parse(localStorage.getItem(localKey()) || '[]')
  } catch { return [] }
}

export function removeDocLocal(id) {
  try {
    const docs = getDocsLocal().filter(d => d.id !== id)
    localStorage.setItem(localKey(), JSON.stringify(docs))
  } catch (e) {}
}
