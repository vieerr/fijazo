import { useState, useCallback } from 'react'
import { Upload, Download, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const mappings = [
  { field: 'Evento / Deporte', column: 'Match Name', type: 'STRING', preview: '"Real Madrid vs Barcelona"', ok: true },
  { field: 'Cuota (Odds)', column: 'Price / Odds', type: 'FLOAT', preview: '1.85', ok: true },
  { field: 'Stake', column: 'Stake Amount', type: 'FLOAT', preview: '50.00', ok: true },
  { field: 'Fecha', column: '-- Seleccionar columna --', type: 'DATETIME', preview: 'Valor inválido', ok: false },
]

export function ImportarXLSX() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Importar desde Excel</h2>
          <p className="text-muted-foreground text-sm mt-1">Sincroniza masivamente tus operaciones desde archivos .xlsx o .csv</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download size={14} /> DESCARGAR PLANTILLA (.XLSX)
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upload zone */}
        <div className="col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'}`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Upload size={28} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">
                      {file ? file.name : 'Arrastra tu archivo aquí'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecciona o suelta tu archivo Excel. Solo se permiten formatos .xlsx con un tamaño máximo de 10MB.
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input type="file" accept=".xlsx,.csv" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                    <span className="px-6 py-2 border border-emerald-500 text-emerald-500 rounded-lg text-sm font-semibold hover:bg-emerald-500 hover:text-black transition-colors">
                      Seleccionar Archivo
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Column mapping */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">Vista previa / Mapeo de columnas</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Asegúrate de que las columnas de tu Excel coinciden con los campos de BetTracker.</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  ¿Autodetectar campos?
                  <div className="w-10 h-6 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </label>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-border">
                    <th className="text-left py-2 font-medium uppercase tracking-wide">Campo BetTracker</th>
                    <th className="text-left py-2 font-medium uppercase tracking-wide">Columna Excel (Origen)</th>
                    <th className="text-left py-2 font-medium uppercase tracking-wide">Tipo de Dato</th>
                    <th className="text-left py-2 font-medium uppercase tracking-wide">Vista Previa (Fila 1)</th>
                    <th className="py-2 font-medium uppercase tracking-wide">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map(m => (
                    <tr key={m.field} className="border-b border-border/50 last:border-0">
                      <td className="py-3 text-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {m.field}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 bg-secondary rounded px-2 py-1 w-fit">
                          <span className={m.ok ? 'text-foreground' : 'text-muted-foreground'}>{m.column}</span>
                          <ChevronDown size={12} className="text-muted-foreground" />
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{m.type}</td>
                      <td className={`py-3 italic ${m.ok ? 'text-foreground' : 'text-red-400'}`}>{m.preview}</td>
                      <td className="py-3 text-center">
                        {m.ok ? <CheckCircle size={16} className="text-green-400 mx-auto" /> : <XCircle size={16} className="text-red-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-xs text-muted-foreground mt-4">Se han autodetectado 3 de 4 campos requeridos.</p>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="h-fit">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">Resumen de Importación</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">EN ESPERA</span>
            </div>
            <div className="p-3 bg-secondary rounded-lg mb-4 flex gap-3">
              <span className="text-blue-400 mt-0.5">ℹ</span>
              <div>
                <p className="text-xs font-semibold text-foreground">No hay archivos cargados</p>
                <p className="text-xs text-muted-foreground mt-0.5">Sube un archivo para comenzar el análisis de datos y mapeo de columnas.</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progreso de Carga</span>
                <span>0%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Filas Totales</p>
                <p className="text-lg font-bold text-foreground mt-0.5">—</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Errores</p>
                <p className="text-lg font-bold text-foreground mt-0.5">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer actions */}
      <div className="flex justify-between items-center border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">Se han autodetectado 3 de 4 campos requeridos.</p>
        <div className="flex gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button className="bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground" disabled>Procesar Importación</Button>
        </div>
      </div>
    </div>
  )
}
