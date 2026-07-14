import { useCallback, useState } from 'react'
import { Upload, Download, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api, ApiError } from '@/lib/api'
import type { ImportSummary } from '@/types/api'

/** Columnas de la plantilla que genera el backend (`GET /bets/template`). */
const TEMPLATE_COLUMNS = [
  { name: 'Deporte', hint: 'Texto. Obligatorio.' },
  { name: 'Liga', hint: 'Texto. Obligatorio.' },
  { name: 'Evento', hint: 'Texto. Obligatorio.' },
  { name: 'Tipo de apuesta', hint: 'Simple o Parlay (desplegable).' },
  { name: 'Mercado', hint: 'Texto. Obligatorio.' },
  { name: 'Selección', hint: 'Texto. Obligatorio.' },
  { name: 'Cuota', hint: 'Número mayor que 1.' },
  { name: 'Stake', hint: 'Número mayor que 0.' },
  { name: 'Casa de apuestas', hint: 'Texto. Obligatorio.' },
  { name: 'Fecha y hora del evento', hint: 'Fecha/hora.' },
  { name: 'Estado', hint: 'Pendiente / Ganada / Perdida / Anulada (desplegable).' },
  { name: 'Notas', hint: 'Opcional.' },
  { name: 'ID de referencia', hint: 'Opcional, único dentro del archivo.' },
  { name: 'Ticket', hint: 'Filas con el mismo ticket se combinan en un parlay. Vacío = simple.' },
]

export function ImportarXLSX() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const pickFile = useCallback((picked: File | null) => {
    setFile(picked)
    setSummary(null)
    setError(picked && !picked.name.toLowerCase().endsWith('.xlsx') ? 'Solo se admiten archivos .xlsx' : null)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      pickFile(e.dataTransfer.files[0] ?? null)
    },
    [pickFile]
  )

  async function downloadTemplate() {
    setError(null)
    setDownloading(true)
    try {
      const blob = await api.bets.template()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'plantilla_apuestas.xlsx'
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo descargar la plantilla')
    } finally {
      setDownloading(false)
    }
  }

  async function runImport() {
    if (!file) return
    setError(null)
    setImporting(true)
    try {
      setSummary(await api.bets.import(file))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo importar el archivo')
    } finally {
      setImporting(false)
    }
  }

  const canImport = Boolean(file) && file!.name.toLowerCase().endsWith('.xlsx') && !importing

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Importar desde Excel</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Sincroniza masivamente tus operaciones desde un archivo .xlsx generado con la plantilla oficial.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={downloadTemplate} disabled={downloading}>
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          DESCARGAR PLANTILLA (.XLSX)
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                onDragOver={e => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'}`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Upload size={28} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{file ? file.name : 'Arrastra tu archivo aquí'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecciona o suelta tu archivo Excel. Solo se permite el formato .xlsx.
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx"
                      className="hidden"
                      onChange={e => pickFile(e.target.files?.[0] ?? null)}
                    />
                    <span className="px-6 py-2 border border-emerald-500 text-emerald-500 rounded-lg text-sm font-semibold hover:bg-emerald-500 hover:text-black transition-colors">
                      Seleccionar Archivo
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground">
                {summary ? 'Filas rechazadas' : 'Columnas esperadas por la plantilla'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 mb-4">
                {summary
                  ? 'Cada fila con error se descarta sin detener el resto de la importación.'
                  : 'El backend valida por nombre de columna: descarga la plantilla y no renombres las cabeceras.'}
              </p>

              {summary ? (
                summary.errors.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-500">
                    <CheckCircle size={16} /> Ninguna fila fue rechazada.
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left py-2 font-medium uppercase tracking-wide">Fila</th>
                        <th className="text-left py-2 font-medium uppercase tracking-wide">Campo</th>
                        <th className="text-left py-2 font-medium uppercase tracking-wide">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.errors.map((e, i) => (
                        <tr key={i} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5 text-foreground">{e.row}</td>
                          <td className="py-2.5 text-muted-foreground">{e.field}</td>
                          <td className="py-2.5 text-red-400">{e.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="text-left py-2 font-medium uppercase tracking-wide">Columna</th>
                      <th className="text-left py-2 font-medium uppercase tracking-wide">Formato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEMPLATE_COLUMNS.map(c => (
                      <tr key={c.name} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 text-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          {c.name}
                        </td>
                        <td className="py-2.5 text-muted-foreground">{c.hint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-sm">Resumen de Importación</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                {importing ? 'PROCESANDO' : summary ? 'COMPLETADO' : file ? 'LISTO' : 'EN ESPERA'}
              </span>
            </div>

            <div className="p-3 bg-secondary rounded-lg mb-4 flex gap-3">
              <span className={error ? 'text-red-400 mt-0.5' : 'text-blue-400 mt-0.5'}>{error ? '⚠' : 'ℹ'}</span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {error ? 'Error' : summary ? 'Importación finalizada' : file ? file.name : 'No hay archivos cargados'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {error ??
                    (summary
                      ? `${summary.imported} apuesta(s) importada(s), ${summary.rejected} rechazada(s).`
                      : file
                        ? 'Pulsa "Procesar Importación" para enviarlo a la API.'
                        : 'Sube un archivo para comenzar la importación.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Stat label="Filas" value={summary?.total_rows} />
              <Stat label="Importadas" value={summary?.imported} className="text-emerald-500" />
              <Stat label="Rechazadas" value={summary?.rejected} className="text-red-500" />
            </div>

            {summary && summary.imported > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                Estadísticas, ranking y logros ya se recalcularon con las nuevas apuestas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Las filas que comparten el valor de <span className="text-foreground">Ticket</span> se combinan en un parlay.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setFile(null)
              setSummary(null)
              setError(null)
            }}
          >
            Limpiar
          </Button>
          <Button
            onClick={runImport}
            disabled={!canImport}
            className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold"
          >
            {importing && <Loader2 size={14} className="animate-spin" />}
            Procesar Importación
          </Button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, className = '' }: { label: string; value?: number; className?: string }) {
  return (
    <div className="bg-secondary rounded-lg p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${value === undefined ? 'text-foreground' : className || 'text-foreground'}`}>
        {value ?? '—'}
      </p>
    </div>
  )
}
