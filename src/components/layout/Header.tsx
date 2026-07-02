import { Bell, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme'

interface HeaderProps {
  breadcrumb?: string
}

export function Header({ breadcrumb }: HeaderProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="flex items-center justify-between px-8 py-3 border-b border-border flex-shrink-0">
      {breadcrumb && (
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
          {breadcrumb}
        </p>
      )}
      <div className="ml-auto flex items-center gap-5">
        <div className="text-right">
          <p className="text-base font-bold text-foreground">$1,240.50</p>
          <p className="text-xs text-muted-foreground">ELO 1540</p>
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
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
          AT
        </div>
      </div>
    </header>
  )
}
