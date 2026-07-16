import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Loading, ErrorState, EmptyState } from '@/components/ui/states'
import { useApiQuery } from '@/hooks/useApi'
import { api } from '@/lib/api'
import {
  dailyProfitSeries,
  formatMoney,
  formatSignedMoney,
  formatSignedPercent,
  sportIcon,
  yieldByField,
} from '@/lib/bets'

const BETS_PAGE_SIZE = 100

export function Estadísticas() {
  const stats = useApiQuery(() => api.statistics.me(), [])
  const betsQuery = useApiQuery(() => api.bets.list({ page: 1, page_size: BETS_PAGE_SIZE }), [])

  const bets = useMemo(() => betsQuery.data?.items ?? [], [betsQuery.data])
  const profitSeries = useMemo(() => dailyProfitSeries(bets), [bets])
  const byBookmaker = useMemo(() => yieldByField(bets, 'bookmaker'), [bets])
  const bySport = useMemo(() => yieldByField(bets, 'sport'), [bets])
  const byType = useMemo(() => yieldByField(bets, 'bet_type'), [bets])

  if (stats.loading || betsQuery.loading) return <Loading className="h-full" label="Cargando estadísticas…" />
  if (stats.error || betsQuery.error) {
    return (
      <ErrorState
        className="h-full"
        message={stats.error ?? betsQuery.error ?? ''}
        onRetry={() => {
          stats.reload()
          betsQuery.reload()
        }}
      />
    )
  }

  const s = stats.data!
  const streakLabel =
    s.current_streak === 0
      ? 'Sin racha'
      : `${Math.abs(s.current_streak)}-${s.current_streak > 0 ? 'WINS' : 'LOSSES'}`

  const kpis = [
    {
      label: 'ROI',
      value: formatSignedPercent(s.roi),
      sub: `Beneficio neto: ${formatSignedMoney(s.net_profit)}`,
      vc: s.roi >= 0 ? 'text-emerald-500' : 'text-red-500',
      icon: '📈',
    },
    {
      label: 'Racha Actual',
      value: streakLabel,
      sub: `Mejor racha: ${s.best_streak}`,
      vc: s.current_streak > 0 ? 'text-emerald-500' : s.current_streak < 0 ? 'text-red-500' : 'text-foreground',
      icon: '🔥',
    },
    {
      label: 'Cuota Promedio',
      value: s.avg_odds.toFixed(2),
      sub: `Consistencia: ${s.consistency.toFixed(0)}/100`,
      vc: 'text-foreground',
      icon: '📊',
    },
    {
      label: 'Stake Promedio',
      value: formatMoney(s.avg_stake),
      sub: `Total apostado: ${formatMoney(s.total_stake)}`,
      vc: 'text-foreground',
      icon: '💰',
    },
  ]

  const topSport = bySport[0]
  const topType = byType[0]
  const bestBet = bets
    .filter(b => b.status === 'WON')
    .sort((a, b) => b.stake * (b.combined_odds - 1) - a.stake * (a.combined_odds - 1))[0]

  const maxYield = Math.max(1, ...byBookmaker.map(b => Math.abs(b.yield)))

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {kpis.map(({ label, value, sub, vc, icon }) => (
          <Card key={label}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <span className="text-base">{icon}</span>
              </div>
              <p className={`text-2xl font-bold ${vc}`}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        <Card className="col-span-2 flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-sm font-semibold text-foreground">Distribución de Beneficios por Día</h3>
              <span className="text-xs text-muted-foreground">Últimas {bets.length} apuestas</span>
            </div>
            <div className="flex-1 min-h-0">
              {profitSeries.length === 0 ? (
                <EmptyState message="Todavía no hay apuestas resueltas." className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitSeries} barGap={2}>
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value, name) => [
                        formatSignedMoney(Number(value)),
                        name === 'value' ? 'Ganado' : 'Perdido',
                      ]}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {profitSeries.map((_, i) => (
                        <Cell key={i} fill="#22c55e" opacity={0.8} />
                      ))}
                    </Bar>
                    <Bar dataKey="loss" radius={[2, 2, 0, 0]}>
                      {profitSeries.map((_, i) => (
                        <Cell key={i} fill="#ef4444" opacity={0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex-shrink-0">Yield por Bookie</h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              {byBookmaker.length === 0 && <EmptyState message="Sin apuestas resueltas." />}
              {byBookmaker.map(b => (
                <div key={b.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground truncate mr-2">{b.name}</span>
                    <span className={b.yield >= 0 ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>
                      {formatSignedPercent(b.yield)}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(Math.abs(b.yield) / maxYield) * 100}%`,
                        background: b.yield >= 0 ? '#22c55e' : '#ef4444',
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {b.bets} apuesta(s) · {formatSignedMoney(b.profit)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground flex-shrink-0">
              {s.distinct_bookmakers} casa(s) distintas · {s.distinct_sports} deporte(s)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground mb-2">Rendimiento por Categoría</h3>
        <div className="grid grid-cols-3 gap-3">
          <CategoryCard
            icon={topSport ? sportIcon(topSport.name) : '🏅'}
            title="Mejor Deporte"
            label={topSport?.name ?? '—'}
            value={topSport ? formatSignedPercent(topSport.yield) : null}
            sub={topSport ? `${topSport.bets} apuesta(s) resueltas` : 'Sin datos todavía'}
          />
          <CategoryCard
            icon={null}
            title="Mejor Tipo de Apuesta"
            label={topType ? (topType.name === 'SIMPLE' ? 'Simple' : 'Parlay') : '—'}
            value={topType ? formatSignedPercent(topType.yield) : null}
            sub={topType ? `${topType.bets} apuesta(s) resueltas` : 'Sin datos todavía'}
          />
          <CategoryCard
            icon="🏆"
            title="Mayor Ganancia"
            label={bestBet?.event ?? '—'}
            value={s.biggest_win > 0 ? formatSignedMoney(s.biggest_win) : null}
            sub={bestBet ? `${bestBet.market}: ${bestBet.selection}` : 'Sin apuestas ganadas'}
          />
        </div>
      </div>
    </div>
  )
}

function CategoryCard({
  icon,
  title,
  label,
  value,
  sub,
}: {
  icon: string | null
  title: string
  label: string
  value: string | null
  sub: string
}) {
  return (
    <Card>
      <CardContent className="p-3 flex gap-3">
        <div>{icon ? <span>{icon}</span> : <TrendingUp size={16} className="text-emerald-500 mt-0.5" />}</div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground mb-1">{title}</p>
          <div className="border-l-2 border-emerald-500 pl-2">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-foreground truncate">{label}</span>
              {value && <span className="text-emerald-500 font-semibold text-sm">{value}</span>}
            </div>
            <p className="text-xs text-muted-foreground truncate">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
