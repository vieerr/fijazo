import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusSquare, FileSpreadsheet, Image, History, BarChart2, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApiQuery } from '@/hooks/useApi'
import { api } from '@/lib/api'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Nuevo pronóstico', icon: PlusSquare, path: '/nuevo' },
  { label: 'Importar XLSX', icon: FileSpreadsheet, path: '/importar-xlsx' },
  { label: 'Importar Imagen', icon: Image, path: '/importar-imagen' },
  { label: 'Historial', icon: History, path: '/historial' },
  { label: 'Estadísticas', icon: BarChart2, path: '/estadisticas' },
  { label: 'Ranking', icon: Trophy, path: '/ranking' },
]

export function Sidebar() {
  const location = useLocation()
  const rank = useApiQuery(() => api.ranks.me(), [])

  return (
    <aside className="flex flex-col w-64 h-screen bg-card border-r border-border flex-shrink-0">
      <div className="px-6 py-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">BetTracker</h1>
        <p className="text-xs text-emerald-500 font-medium mt-0.5">
          {rank.data ? `${rank.data.current.icon} ${rank.data.current.name}` : '—'}
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-6">
        <Link to="/nuevo">
          <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors">
            <span className="text-lg">+</span> Nuevo Pronóstico
          </button>
        </Link>
      </div>
    </aside>
  )
}
