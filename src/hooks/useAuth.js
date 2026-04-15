import { useAuthContext } from '../lib/authContext'

export function useAuth() {
  return useAuthContext()
}
