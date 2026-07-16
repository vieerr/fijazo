import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { ApiError } from '@/lib/api'

type Mode = 'login' | 'register'

export function Login() {
  const { user, loading: bootLoading, login, register } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (bootLoading) return null
  if (user) return <Navigate to="/" replace />

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(username, email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado')
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

              <Button
                type="submit"
                disabled={submitting}
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
