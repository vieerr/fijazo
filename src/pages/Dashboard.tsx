import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Award, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { bets, bankrollData } from '@/data/mockData'

const periods = ['7 DIAS', '30 DIAS', 'TODO']

export function Dashboard() {
  const [period, setPeriod] = useState('30 DIAS')
  const won = bets.filter(b => b.status === 'GANADO')
  const lost = bets.filter(b => b.status === 'PERDIDO')
  const totalStake = bets.reduce((s, b) => s + b.stake, 0)
  const netBalance = bets.reduce((s, b) => s + b.profit, 0)
  const winRate = Math.round((won.length / (won.length + lost.length)) * 100)
  const recent = bets.slice(0, 3)

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Resumen General</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Visualización en tiempo real de tu cartera de inversiones deportivas.</p>
        </div>
        <div className="flex gap-2">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${period === p ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 flex-shrink-0">
        {[
          { label: 'Balance Neto', value: `+$${netBalance.toFixed(2)}`, sub: '+12.5% vs mes ant.', vc: 'text-emerald-500' },
          { label: 'Total Apostado', value: `$${totalStake.toFixed(2)}`, sub: '', vc: 'text-foreground' },
          { label: 'Ganadas / Perdidas', value: `${won.length} / ${lost.length}`, sub: '60 pronósticos totales', vc: 'text-foreground' },
          { label: 'Win Rate', value: `${winRate}.0%`, sub: 'Consistencia: Alta', vc: 'text-foreground' },
          { label: 'ROI', value: '+13.1%', sub: 'Retorno de inversión', vc: 'text-emerald-500' },
        ].map((k, i) => (
          <Card key={i}><CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-xl font-bold ${k.vc}`}>{k.value}</p>
            {k.sub && <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>}
            <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${55 + i * 9}%` }} />
            </div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        <Card className="col-span-2 flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex-shrink-0">Evolución del Bankroll</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bankrollData}>
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
                    formatter={(v: number) => [`$${v}`, 'Bankroll']} />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-foreground mb-2 flex-shrink-0">Hitos de Temporada</h3>
            <div className="flex-1 space-y-2">
              {[
                { icon: Award, title: '5-Match Streak', sub: 'Conseguido ayer', color: 'text-emerald-500' },
                { icon: TrendingUp, title: 'ROI Record 15%', sub: 'Alcanzado en Mundial 2026', color: 'text-emerald-500' },
                { icon: Shield, title: 'Bankroll Safe', sub: 'Gestión de riesgo: A+', color: 'text-blue-400' },
              ].map(({ icon: Icon, title, sub, color }) => (
                <div key={title} className="flex items-center gap-2.5 p-2.5 bg-secondary rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className={color} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 border border-border rounded-lg py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Ver todos los logros
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground">Últimos Pronósticos (World Cup 2026)</h3>
          <Link to="/historial" className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wide">Ver Historial Completo</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {recent.map(bet => (
            <Card key={bet.id}><CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide truncate mr-2">{bet.competition}</p>
                <Badge variant={bet.status === 'GANADO' ? 'won' : bet.status === 'PERDIDO' ? 'lost' : 'pending'}>{bet.status}</Badge>
              </div>
              <p className="font-semibold text-foreground text-sm mb-2">{bet.event}</p>
              <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                <span>Mercado:</span><span className="text-foreground truncate ml-2">{bet.market}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Cuota:</span><span className="text-foreground">{bet.odds}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">STAKE</p>
                  <p className="text-sm font-semibold text-foreground">${bet.stake.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{bet.status === 'PENDIENTE' ? 'POTENCIAL' : bet.status === 'GANADO' ? 'RETORNO' : 'PÉRDIDA'}</p>
                  <p className={`text-sm font-semibold ${bet.profit > 0 ? 'text-emerald-500' : bet.profit < 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {bet.status === 'PENDIENTE' ? `$${(bet.stake * bet.odds).toFixed(2)}` : bet.profit > 0 ? `$${(bet.stake + bet.profit).toFixed(2)}` : `$${bet.profit.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      </div>
    </div>
  )
}
