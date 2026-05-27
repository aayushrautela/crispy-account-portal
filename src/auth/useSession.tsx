/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { BASE_URL, setCsrfToken } from '../api/client'

interface AuthState {
  user: { id: string; email: string | null } | null
  csrfToken: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null)
  const [csrfToken, setCsrfTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE_URL}/v1/auth/portal/session`, { credentials: 'include' })
      .then((res) => res.json())
      .then((envelope) => {
        const data = envelope?.data ?? envelope
        if (data.user) {
          setUser(data.user)
          const token = data.csrfToken ?? null
          setCsrfTokenState(token)
          setCsrfToken(token)
        }
      })
      .catch(() => {
        // not authenticated
      })
      .finally(() => setLoading(false))
  }, [])

  const signOut = useCallback(async () => {
    await fetch(`${BASE_URL}/v1/auth/portal/sign-out`, {
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
    setCsrfTokenState(null)
    setCsrfToken(null)
  }, [])

  const value = useMemo(
    () => ({ user, csrfToken, loading, signOut }),
    [user, csrfToken, loading, signOut],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
