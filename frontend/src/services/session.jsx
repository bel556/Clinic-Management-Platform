/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { STAFF } from './mockDb'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const [signedIn, setSignedIn] = useState(true)
  const [presence, setPresence] = useState('Present')
  const [availability, setAvailability] = useState(true)

  const logIn = useCallback(() => setSignedIn(true), [])
  const logOut = useCallback(() => setSignedIn(false), [])

  const value = useMemo(
    () => ({
      users: STAFF,
      signedIn,
      presence,
      availability,
      setPresence,
      setAvailability,
      logIn,
      logOut,
    }),
    [signedIn, presence, availability, logIn, logOut],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside <SessionProvider>')
  return context
}
