import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, SESSION_EXPIRED_EVENT, tokenStorage } from '@/lib/api'
import type { User } from '@/types/api'

interface AuthValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  // Al arrancar, si hay token guardado se valida contra /users/me.
  useEffect(() => {
    if (!tokenStorage.get()) {
      setLoading(false)
      return
    }
    api.users
      .me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onExpired = () => logout()
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await api.auth.login({ email, password })
    tokenStorage.set(access_token)
    setUser(await api.users.me())
  }, [])

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await api.auth.register({ username, email, password })
      await login(email, password)
    },
    [login]
  )

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
