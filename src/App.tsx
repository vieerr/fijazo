import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { NuevoPronóstico } from '@/pages/NuevoPronóstico'
import { ImportarXLSX } from '@/pages/ImportarXLSX'
import { ImportarImagen } from '@/pages/ImportarImagen'
import { Historial } from '@/pages/Historial'
import { Estadísticas } from '@/pages/Estadísticas'
import { Ranking } from '@/pages/Ranking'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/nuevo" element={<NuevoPronóstico />} />
                <Route path="/importar-xlsx" element={<ImportarXLSX />} />
                <Route path="/importar-imagen" element={<ImportarImagen />} />
                <Route path="/historial" element={<Historial />} />
                <Route path="/estadisticas" element={<Estadísticas />} />
                <Route path="/ranking" element={<Ranking />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
