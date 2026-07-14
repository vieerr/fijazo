import { Bell, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useAuth } from '@/lib/auth'
import { useApiQuery } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { formatSignedMoney } from '@/lib/bets'

interface HeaderProps {
  breadcrumb?: string
}

export function Header({ breadcrumb }: HeaderProps) {
  const { theme, toggle } = useTheme()
  const { user, logout } = useAuth()
  const stats = useApiQuery(() => api.statistics.me(), [])
  const rank = useApiQuery(() => api.ranks.me(), [])

  const initials = (user?.username ?? '')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex items-center justify-between px-8 py-3 border-b border-border flex-shrink-0">
      {breadcrumb && (
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{breadcrumb}</p>
      )}
      <div className="ml-auto flex items-center gap-5">
        <div className="text-right">
          <p
            className={`text-base font-bold ${(stats.data?.net_profit ?? 0) >= 0 ? 'text-foreground' : 'text-red-500'}`}
          >
            {stats.data ? formatSignedMoney(stats.data.net_profit) : '—'}
          </p>
          <p className="text-xs text-muted-foreground">
            {rank.data ? `${rank.data.current.icon} ${rank.data.current.name} · ${rank.data.rank_score.toFixed(1)} pts` : '—'}
          </p>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={18} />
        </button>
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={18} />
        </button>
        <div
          title={user?.email}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs"
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
