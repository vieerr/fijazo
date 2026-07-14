import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading, ErrorState, EmptyState } from '@/components/ui/states'
import { useApiQuery } from '@/hooks/useApi'
import { api } from '@/lib/api'
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  bankrollSeries,
  betProfit,
  formatMoney,
  formatPercent,
  formatSignedMoney,
  formatSignedPercent,
} from '@/lib/bets'
import type { Bet } from '@/types/api'

const periods = [
  { label: '7 DIAS', days: 7 },
  { label: '30 DIAS', days: 30 },
  { label: 'TODO', days: null },
] as const

/** Nº de apuestas que traemos para alimentar gráficos y últimos pronósticos. */
const BETS_PAGE_SIZE = 100

export function Dashboard() {
  const [period, setPeriod] = useState<(typeof periods)[number]>(periods[1])

  const stats = useApiQuery(() => api.statistics.me(), [])
  const betsQuery = useApiQuery(() => api.bets.list({ page: 1, page_size: BETS_PAGE_SIZE }), [])

  const allBets = useMemo(() => betsQuery.data?.items ?? [], [betsQuery.data])

  // El backend no filtra por rango de fechas: recortamos en cliente sobre la página cargada.
  const bets = useMemo(() => {
    if (period.days === null) return allBets
    const since = Date.now() - period.days * 24 * 60 * 60 * 1000
    return allBets.filter(b => new Date(b.event_datetime).getTime() >= since)
  }, [allBets, period])

  const chartData = useMemo(() => bankrollSeries(bets), [bets])

  const recent = useMemo(
    () =>
      bets
        .slice()
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 3),
    [bets]
  )

  const achievements = useApiQuery(() => api.achievements.me(), [])
  const unlocked = useMemo(
    () => (achievements.data?.achievements ?? []).filter(a => a.unlocked).slice(0, 3),
    [achievements.data]
  )

  if (stats.loading || betsQuery.loading) return <Loading className="h-full" label="Cargando resumen…" />
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
  const periodProfit = bets.reduce((sum, b) => sum + betProfit(b), 0)
  const periodStake = bets.reduce((sum, b) => sum + b.stake, 0)

  const kpis = [
    {
      label: 'Balance Neto',
      value: formatSignedMoney(s.net_profit),
      sub: `${formatSignedMoney(periodProfit)} en ${period.label.toLowerCase()}`,
      vc: s.net_profit >= 0 ? 'text-emerald-500' : 'text-red-500',
      pct: Math.min(100, Math.abs(s.roi)),
    },
    {
      label: 'Total Apostado',
      value: formatMoney(s.total_stake),
      sub: `${formatMoney(periodStake)} en ${period.label.toLowerCase()}`,
      vc: 'text-foreground',
      pct: 100,
    },
    {
      label: 'Ganadas / Perdidas',
      value: `${s.won} / ${s.lost}`,
      sub: `${s.total_bets} pronósticos totales`,
      vc: 'text-foreground',
      pct: s.total_bets > 0 ? ((s.won + s.lost) / s.total_bets) * 100 : 0,
    },
    {
      label: 'Win Rate',
      value: formatPercent(s.win_rate),
      sub: `Consistencia: ${s.consistency.toFixed(0)}/100`,
      vc: 'text-foreground',
      pct: s.win_rate,
    },
    {
      label: 'ROI',
      value: formatSignedPercent(s.roi),
      sub: 'Retorno de inversión',
      vc: s.roi >= 0 ? 'text-emerald-500' : 'text-red-500',
      pct: Math.min(100, Math.abs(s.roi)),
    },
  ]

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Resumen General</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Visualización en tiempo real de tu cartera de inversiones deportivas.
          </p>
        </div>
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.label}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${period.label === p.label ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {kpis.map(k => (
          <Card key={k.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{k.label}</p>
              <p className={`text-xl font-bold ${k.vc}`}>{k.value}</p>
              {k.sub && <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>}
              <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${k.pct}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        <Card className="col-span-2 flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex-shrink-0">
              Evolución del Bankroll
            </h3>
            <div className="flex-1 min-h-0">
              {chartData.length === 0 ? (
                <EmptyState message="Sin apuestas resueltas en este periodo." className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={value => [formatSignedMoney(Number(value)), 'Acumulado']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex-shrink-0">Hitos de Temporada</h3>
            <div className="flex-1 space-y-2">
              {achievements.loading && <Loading label="Cargando logros…" />}
              {!achievements.loading && unlocked.length === 0 && (
                <EmptyState message="Todavía no has desbloqueado logros." />
              )}
              {unlocked.map(a => (
                <div key={a.id} className="flex items-center gap-2.5 p-2.5 bg-secondary rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-base">
                    {a.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/ranking"
              className="mt-2 border border-border rounded-lg py-1.5 text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              Ver todos los logros
              {achievements.data && ` (${achievements.data.unlocked_count}/${achievements.data.total})`}
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Últimos Pronósticos</h3>
          <Link
            to="/historial"
            className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wide"
          >
            Ver Historial Completo
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="p-3">
              <EmptyState message="Aún no has registrado pronósticos en este periodo." />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {recent.map(bet => (
              <RecentBetCard key={bet.id} bet={bet} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecentBetCard({ bet }: { bet: Bet }) {
  const profit = betProfit(bet)
  const outcomeLabel =
    bet.status === 'PENDING' ? 'POTENCIAL' : bet.status === 'WON' ? 'RETORNO' : bet.status === 'LOST' ? 'PÉRDIDA' : 'DEVUELTO'
  const outcomeValue =
    bet.status === 'PENDING'
      ? formatMoney(bet.potential_return)
      : bet.status === 'WON'
        ? formatMoney(bet.stake + profit)
        : bet.status === 'LOST'
          ? formatMoney(profit)
          : formatMoney(bet.stake)

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide truncate mr-2">{bet.league}</p>
          <Badge variant={STATUS_VARIANT[bet.status]}>{STATUS_LABEL[bet.status]}</Badge>
        </div>
        <p className="font-semibold text-foreground text-sm mb-2 truncate">{bet.event}</p>
        <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
          <span>Mercado:</span>
          <span className="text-foreground truncate ml-2">
            {bet.market}: {bet.selection}
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Cuota:</span>
          <span className="text-foreground">
            {bet.combined_odds.toFixed(2)}
            {bet.bet_type === 'PARLAY' && ` · ${bet.legs.length + 1} selecciones`}
          </span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <div>
            <p className="text-xs text-muted-foreground">STAKE</p>
            <p className="text-sm font-semibold text-foreground">{formatMoney(bet.stake)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{outcomeLabel}</p>
            <p
              className={`text-sm font-semibold ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-amber-500'}`}
            >
              {outcomeValue}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
