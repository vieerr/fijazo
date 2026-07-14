import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, EmptyState } from '@/components/ui/states'
import { useApiQuery } from '@/hooks/useApi'
import { api, ApiError } from '@/lib/api'
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  betProfit,
  formatDateTime,
  formatMoney,
  formatPercent,
  formatSignedMoney,
  formatSignedPercent,
  recentForm,
  sportIcon,
} from '@/lib/bets'
import type { BetStatus, BetType } from '@/types/api'

const PAGE_SIZE = 20

export function Historial() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BetStatus | ''>('')
  const [betType, setBetType] = useState<BetType | ''>('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const betsQuery = useApiQuery(
    () => api.bets.list({ page, page_size: PAGE_SIZE, status: status || undefined, bet_type: betType || undefined }),
    [page, status, betType]
  )
  const stats = useApiQuery(() => api.statistics.me(), [])

  const items = useMemo(() => betsQuery.data?.items ?? [], [betsQuery.data])

  // El backend no ofrece búsqueda de texto: filtramos la página actual en cliente.
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter(b =>
      [b.event, b.market, b.selection, b.league, b.sport, b.bookmaker].some(field =>
        field.toLowerCase().includes(term)
      )
    )
  }, [items, search])

  const total = betsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, total)

  async function onDelete(id: string) {
    if (!window.confirm('¿Eliminar esta apuesta? Se recalcularán tus estadísticas.')) return
    setActionError(null)
    setDeleting(id)
    try {
      await api.bets.remove(id)
      betsQuery.reload()
      stats.reload()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'No se pudo eliminar la apuesta')
    } finally {
      setDeleting(null)
    }
  }

  const s = stats.data

  return (
    <div className="h-full flex flex-col gap-3">
      <h2 className="text-2xl font-bold text-foreground flex-shrink-0">Historial de Pronósticos</h2>

      <Card className="flex-shrink-0">
        <CardContent className="p-3">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Evento, liga, mercado o casa… (en esta página)"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-secondary border border-border text-sm text-foreground rounded-md px-2 py-1.5 h-8 focus:outline-none focus:ring-1 focus:ring-ring"
              value={status}
              onChange={e => {
                setStatus(e.target.value as BetStatus | '')
                setPage(1)
              }}
            >
              <option value="">Todos los estados</option>
              {(['PENDING', 'WON', 'LOST', 'VOID'] as BetStatus[]).map(o => (
                <option key={o} value={o}>
                  {STATUS_LABEL[o]}
                </option>
              ))}
            </select>
            <select
              className="bg-secondary border border-border text-sm text-foreground rounded-md px-2 py-1.5 h-8 focus:outline-none focus:ring-1 focus:ring-ring"
              value={betType}
              onChange={e => {
                setBetType(e.target.value as BetType | '')
                setPage(1)
              }}
            >
              <option value="">Todos los tipos</option>
              <option value="SIMPLE">Simple</option>
              <option value="PARLAY">Parlay</option>
            </select>
          </div>
          {actionError && <p className="text-xs text-red-500 mt-2">{actionError}</p>}
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="overflow-auto flex-1 min-h-0">
            {betsQuery.loading ? (
              <Loading label="Cargando apuestas…" />
            ) : betsQuery.error ? (
              <ErrorState message={betsQuery.error} onRetry={betsQuery.reload} />
            ) : filtered.length === 0 ? (
              <EmptyState message="No hay apuestas que coincidan con los filtros." />
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border">
                    {['Fecha', 'Deporte', 'Evento / Mercado', 'Odds', 'Stake', 'Estado', 'Ganancia/Pérd.', ''].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(bet => {
                    const profit = betProfit(bet)
                    return (
                      <tr key={bet.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-pre-line">
                          {formatDateTime(bet.event_datetime)}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {sportIcon(bet.sport)} {bet.sport}
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-foreground text-xs">
                            {bet.event}
                            {bet.bet_type === 'PARLAY' && (
                              <span className="ml-1.5 text-[10px] text-muted-foreground">
                                PARLAY ×{bet.legs.length + 1}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bet.market}: {bet.selection}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-foreground text-xs font-medium">
                          {bet.combined_odds.toFixed(2)}
                        </td>
                        <td className="px-4 py-2.5 text-foreground text-xs">{formatMoney(bet.stake)}</td>
                        <td className="px-4 py-2.5">
                          <Badge variant={STATUS_VARIANT[bet.status]}>{STATUS_LABEL[bet.status]}</Badge>
                        </td>
                        <td
                          className={`px-4 py-2.5 text-xs font-semibold ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                        >
                          {bet.status === 'PENDING' || bet.status === 'VOID' ? '—' : formatSignedMoney(profit)}
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => onDelete(bet.id)}
                            disabled={deleting === bet.id}
                            title="Eliminar apuesta"
                            className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
                          >
                            {deleting === bet.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              Mostrando {from}-{to} de {total} resultados
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-6 h-6 rounded text-xs flex items-center justify-center text-muted-foreground border border-border hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="px-2 text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="w-6 h-6 rounded text-xs flex items-center justify-center text-muted-foreground border border-border hover:text-foreground disabled:opacity-40"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Win Rate Total</p>
            <p className="text-xl font-bold text-foreground">{s ? formatPercent(s.win_rate) : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Stake</p>
            <p className="text-xl font-bold text-foreground">{s ? formatMoney(s.total_stake) : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">ROI Acumulado</p>
            <p className={`text-xl font-bold ${(s?.roi ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {s ? formatSignedPercent(s.roi) : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Racha Actual</p>
            <div className="flex gap-1 mt-1">
              {recentForm(items).map((r, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${r === 'W' ? 'bg-emerald-100 border border-emerald-400 text-emerald-600' : r === 'L' ? 'bg-red-100 border border-red-400 text-red-600' : 'bg-secondary border border-border text-muted-foreground'}`}
                >
                  {r}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
