import { useState, useCallback } from 'react'

export function useNotif() {
  const [notif, setNotif] = useState(null)

  const showNotif = useCallback((msg, icon = '✅') => {
    setNotif({ msg, icon })
    setTimeout(() => setNotif(null), 3500)
  }, [])

  return { notif, showNotif }
}
