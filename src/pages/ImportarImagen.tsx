import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Wand2, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const queue = [
  { id: 1, status: 'processing' },
  { id: 2, status: 'done' },
  { id: 3, status: 'done' },
  { id: 4, status: 'empty' },
]

export function ImportarImagen() {
  const [dragging, setDragging] = useState(false)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Importar desde Imagen</h2>
        <p className="text-muted-foreground text-sm mt-1">Sube tus capturas de pantalla para extraer datos automáticamente con IA.</p>
      </div>

      {/* La API todavía no expone un endpoint de OCR: esta pantalla es una maqueta. */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
        <span className="text-amber-500">⚠</span>
        <div>
          <p className="text-sm font-semibold text-foreground">Vista previa: sin conexión con la API</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            El backend no ofrece todavía importación por imagen (OCR). Para cargar apuestas de forma masiva usa{' '}
            <Link to="/importar-xlsx" className="text-emerald-500 hover:underline">
              Importar XLSX
            </Link>
            , que sí está conectado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: upload + queue */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'}`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                    <Upload size={24} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Arrastra tus capturas aquí</p>
                    <p className="text-xs text-muted-foreground mt-1">Compatible con PNG, JPG de casas de apuestas (Bet365, Winamax, etc.)</p>
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" multiple className="hidden" />
                    <span className="px-6 py-2 border border-border text-foreground rounded-lg text-sm font-semibold hover:border-emerald-500 hover:text-emerald-500 transition-colors">
                      Seleccionar Archivos
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Cola de Procesamiento (3)</h3>
                <span className="text-xs text-emerald-500 font-medium animate-pulse">PROCESANDO...</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {queue.map(item => (
                  <div
                    key={item.id}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center ${item.status === 'processing' ? 'border-emerald-500 bg-emerald-500/10' : item.status === 'empty' ? 'border-dashed border-border' : 'border-green-600/50 bg-green-900/20'}`}
                  >
                    {item.status === 'processing' ? (
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-emerald-500 mt-1">OCR</p>
                      </div>
                    ) : item.status === 'empty' ? (
                      <Plus size={20} className="text-muted-foreground" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-md flex items-center justify-center">
                        <span className="text-xl">📱</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: OCR result form */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 size={16} className="text-emerald-500" />
                <span className="text-sm font-semibold text-foreground">Extracción Automática (OCR)</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Descartar</Button>
                <Button size="sm" className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold">Guardar Apuesta</Button>
              </div>
            </div>

            {/* Preview image placeholder */}
            <div className="w-full h-32 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-border flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl">🎰</span>
                <p className="text-xs text-muted-foreground mt-1">Vista previa imagen</p>
              </div>
            </div>

            {/* Extracted fields */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Evento</label>
              <div className="relative">
                <Input defaultValue="Real Madrid vs Barcelona" />
                <span className="absolute right-2 top-2 text-xs bg-green-900/50 text-green-400 border border-green-600 rounded px-1">96% CONF.</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Cuota (Odds)</label>
                <Input defaultValue="1.85" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Importe (Amount)</label>
                <div className="relative">
                  <Input defaultValue="100.00 €" />
                  <span className="absolute right-2 top-2 text-xs text-emerald-500">▲</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Fecha</label>
                <Input defaultValue="10/28/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">ID Ticket</label>
                <Input defaultValue="TX-9920114" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Casa de Apuestas</label>
              <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                <span className="text-sm text-foreground">Manual / Auto-detect</span>
              </div>
            </div>

            {/* Vista previa */}
            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Vista Previa del Registro</p>
                <Badge variant="won">GANADA</Badge>
              </div>
              <p className="font-semibold text-foreground">Real Madrid vs Barcelona</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Retorno Potencial</p>
                  <p className="text-sm font-semibold text-foreground">185.00 €</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Beneficio Neto</p>
                  <p className="text-sm font-semibold text-green-400">+85.00 €</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              ESCANEANDO CAMPOS...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
