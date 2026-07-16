import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'

type Mode = 'login' | 'register'

const LOCK_KEY = 'login_lockout'
const FREE_ATTEMPTS = 3
const BASE_LOCK_SECONDS = 5
const MAX_LOCK_SECONDS = 300

function readLockState(): { attempts: number; lockUntil: number } {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) || '') || { attempts: 0, lockUntil: 0 }
  } catch {
    return { attempts: 0, lockUntil: 0 }
  }
}

function writeLockState(state: { attempts: number; lockUntil: number }) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(state))
}

export function Login() {
  const { user, loading: bootLoading, login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lockRemaining, setLockRemaining] = useState(0)

  useEffect(() => {
    if (tickLock() <= 0) return
    const iv = setInterval(() => {
      if (tickLock() <= 0) clearInterval(iv)
    }, 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (bootLoading) return null
  if (user) return <Navigate to="/" replace />

  function tickLock() {
    const { lockUntil } = readLockState()
    const remaining = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000))
    setLockRemaining(remaining)
    return remaining
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'login' && tickLock() > 0) {
      const iv = setInterval(() => {
        if (tickLock() <= 0) clearInterval(iv)
      }, 1000)
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        writeLockState({ attempts: 0, lockUntil: 0 })
      } else {
        await register(username, email, password)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
      if (mode === 'login') {
        const { attempts } = readLockState()
        const nextAttempts = attempts + 1
        let lockUntil = 0
        if (nextAttempts >= FREE_ATTEMPTS) {
          const seconds = Math.min(
            BASE_LOCK_SECONDS * 2 ** (nextAttempts - FREE_ATTEMPTS),
            MAX_LOCK_SECONDS,
          )
          lockUntil = Date.now() + seconds * 1000
        }
        writeLockState({ attempts: nextAttempts, lockUntil })
        tickLock()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">BetTracker</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Accede a tu cartera de pronósticos' : 'Crea tu cuenta para empezar'}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Usuario
                  </label>
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="carlos"
                    minLength={3}
                    maxLength={15}
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="carlos@mail.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">
                  Contraseña
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="········"
                  minLength={8}
                  maxLength={64}
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              {mode === 'login' && lockRemaining > 0 && (
                <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                  Demasiados intentos fallidos. Intenta de nuevo en {lockRemaining}s.
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting || (mode === 'login' && lockRemaining > 0)}
                className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
              }}
              className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
