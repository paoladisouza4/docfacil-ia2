import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { auth } from '../api/firebaseClient'

export async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: name })
  return cred.user
}

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logout() {
  await signOut(auth)
}

export async function updateUserProfile(name) {
  if (!auth.currentUser) throw new Error('Não autenticado')
  await updateProfile(auth.currentUser, { displayName: name })
}

export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser
  if (!user) throw new Error('Não autenticado')
  const credential = EmailAuthProvider.credential(user.email, currentPassword)
  await reauthenticateWithCredential(user, credential)
  await updatePassword(user, newPassword)
}

export function firebaseErrorMsg(code) {
  const msgs = {
    'auth/user-not-found':        'Usuário não encontrado.',
    'auth/wrong-password':        'Senha incorreta.',
    'auth/invalid-credential':    'E-mail ou senha inválidos.',
    'auth/email-already-in-use':  'E-mail já cadastrado.',
    'auth/invalid-email':         'E-mail inválido.',
    'auth/weak-password':         'Senha muito fraca (mínimo 6 caracteres).',
    'auth/too-many-requests':     'Muitas tentativas. Aguarde e tente novamente.',
    'auth/network-request-failed':'Erro de conexão. Verifique sua internet.',
    'auth/requires-recent-login': 'Por segurança, faça login novamente para realizar esta ação.',
  }
  return msgs[code] || 'Erro ao autenticar. Tente novamente.'
}
