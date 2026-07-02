import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const breadcrumbs: Record<string, string> = {
  '/': 'Panel de Control',
  '/nuevo': 'Registrar Nuevo Pronóstico',
  '/importar-xlsx': 'Módulo de Importación',
  '/importar-imagen': 'BetTracker / Importar OCR',
  '/historial': 'Historial de Pronósticos',
  '/estadisticas': 'Análisis de Rendimiento',
  '/ranking': 'Panel de Competición',
}

export function Layout() {
  const location = useLocation()
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header breadcrumb={breadcrumbs[location.pathname]} />
        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
