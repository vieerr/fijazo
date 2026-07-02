import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { benefitsData } from '@/data/mockData'

export function Estadísticas() {
  const [period, setPeriod] = useState<'Dia' | 'Semana'>('Dia')

  const bookies = [
    { name: 'Bet365', yield: 12.5 },
    { name: 'Pinnacle', yield: 8.2 },
    { name: 'Bwin', yield: -2.1 },
  ]

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[
          { label: 'Proyected ROI', value: '+14.2%', sub: '↑ 3.1% este mes', subColor: 'text-emerald-500', vc: 'text-foreground', icon: '📈' },
          { label: 'Racha Actual', value: '5-WINS', sub: 'Nivel: "En Fuego"', subColor: 'text-muted-foreground', vc: 'text-emerald-500', icon: '🔥' },
          { label: 'Cuota Promedio', value: '1.84', sub: 'Perfil: Riesgo Moderado', subColor: 'text-muted-foreground', vc: 'text-foreground', icon: '📊' },
          { label: 'Stake Promedio', value: '$45.00', sub: '2.4% de Bankroll', subColor: 'text-muted-foreground', vc: 'text-foreground', icon: '💰' },
        ].map(({ label, value, sub, subColor, vc, icon }) => (
          <Card key={label}><CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
              <span className="text-base">{icon}</span>
            </div>
            <p className={`text-2xl font-bold ${vc}`}>{value}</p>
            <p className={`text-xs ${subColor} mt-0.5`}>{sub}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
        <Card className="col-span-2 flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-sm font-semibold text-foreground">Distribución de Beneficios (30d)</h3>
              <div className="flex gap-1">
                {(['Dia', 'Semana'] as const).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${period === p ? 'bg-emerald-500 text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benefitsData} barGap={2}>
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>{benefitsData.map((_, i) => <Cell key={i} fill="#22c55e" opacity={0.8} />)}</Bar>
                  <Bar dataKey="loss" radius={[2, 2, 0, 0]}>{benefitsData.map((_, i) => <Cell key={i} fill="#ef4444" opacity={0.6} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex-shrink-0">Yield por Bookie</h3>
            <div className="space-y-4 flex-1">
              {bookies.map(b => (
                <div key={b.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground">{b.name}</span>
                    <span className={b.yield > 0 ? 'text-emerald-500 font-semibold' : 'text-red-500 font-semibold'}>{b.yield > 0 ? '+' : ''}{b.yield}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.abs(b.yield) * 6}%`, background: b.yield > 0 ? '#22c55e' : '#ef4444' }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs text-muted-foreground hover:text-foreground uppercase tracking-wide transition-colors flex-shrink-0">Ver Detalle Completo</button>
          </CardContent>
        </Card>
      </div>

      <div className="flex-shrink-0">
        <h3 className="text-sm font-semibold text-foreground mb-2">Rendimiento por Categoría</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '⚽', title: 'Por Deporte', label: 'Fútbol', value: '+18.5%', sub: 'Win Rate: 68%' },
            { icon: null, title: 'Tipo de Apuesta', label: 'Simple', value: '+9.4%', sub: '75% Vol.' },
            { icon: '🏆', title: 'Top Market', label: 'Ambos Marcan', value: null, sub: 'Mercado más rentable' },
          ].map(({ icon, title, label, value, sub }) => (
            <Card key={title}><CardContent className="p-3 flex gap-3">
              <div>
                {icon ? <span>{icon}</span> : <TrendingUp size={16} className="text-emerald-500 mt-0.5" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">{title}</p>
                <div className="border-l-2 border-emerald-500 pl-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-foreground">{label}</span>
                    {value && <span className="text-emerald-500 font-semibold text-sm">{value}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      </div>
    </div>
  )
}
