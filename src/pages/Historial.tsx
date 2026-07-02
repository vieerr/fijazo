import { useState } from 'react'
import { Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { bets } from '@/data/mockData'

export function Historial() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos los estados')
  const [bookieFilter, setBookieFilter] = useState('Todas las casas')

  const filtered = bets.filter(b => {
    const ms = b.event.toLowerCase().includes(search.toLowerCase()) || b.market.toLowerCase().includes(search.toLowerCase())
    const mst = statusFilter === 'Todos los estados' || b.status === statusFilter
    const mb = bookieFilter === 'Todas las casas' || b.bookmaker === bookieFilter
    return ms && mst && mb
  })

  const won = bets.filter(b => b.status === 'GANADO')
  const totalStake = bets.reduce((s, b) => s + b.stake, 0)
  const totalProfit = bets.reduce((s, b) => s + b.profit, 0)
  const roi = ((totalProfit / totalStake) * 100).toFixed(1)

  return (
    <div className="h-full flex flex-col gap-3">
      <h2 className="text-2xl font-bold text-foreground flex-shrink-0">Historial de Pronósticos</h2>

      <Card className="flex-shrink-0">
        <CardContent className="p-3">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-40">
              <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input className="pl-8 h-8 text-sm" placeholder="Equipo, liga o mercado..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {[
              { val: statusFilter, set: setStatusFilter, opts: ['Todos los estados', 'GANADO', 'PERDIDO', 'PENDIENTE'] },
              { val: bookieFilter, set: setBookieFilter, opts: ['Todas las casas', 'Bet365', 'Pinnacle', 'Bwin'] },
            ].map((f, i) => (
              <select key={i} className="bg-secondary border border-border text-sm text-foreground rounded-md px-2 py-1.5 h-8 focus:outline-none focus:ring-1 focus:ring-ring"
                value={f.val} onChange={e => f.set(e.target.value)}>
                {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
            <select className="bg-secondary border border-border text-sm text-foreground rounded-md px-2 py-1.5 h-8 focus:outline-none focus:ring-1 focus:ring-ring">
              {['Últimos 30 días', 'Últimos 7 días', 'Todo'].map(o => <option key={o}>{o}</option>)}
            </select>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 ml-auto"><Download size={13} /> Exportar</Button>
            <Button variant="outline" size="icon" className="h-8 w-8"><Filter size={13} /></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 min-h-0 flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="overflow-auto flex-1 min-h-0">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card z-10">
                <tr className="border-b border-border">
                  {['Fecha', 'Deporte', 'Evento / Mercado', 'Odds', 'Stake', 'Estado', 'Ganancia/Pérd.'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs text-muted-foreground uppercase tracking-wide font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(bet => (
                  <tr key={bet.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-pre-line">{bet.date}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{bet.sportIcon} {bet.sport}</td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-foreground text-xs">{bet.event}</p>
                      <p className="text-xs text-muted-foreground">{bet.market}</p>
                    </td>
                    <td className="px-4 py-2.5 text-foreground text-xs font-medium">{bet.odds}</td>
                    <td className="px-4 py-2.5 text-foreground text-xs">${bet.stake.toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={bet.status === 'GANADO' ? 'won' : bet.status === 'PERDIDO' ? 'lost' : 'pending'}>{bet.status}</Badge>
                    </td>
                    <td className={`px-4 py-2.5 text-xs font-semibold ${bet.profit > 0 ? 'text-emerald-500' : bet.profit < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {bet.profit > 0 ? `+$${bet.profit.toFixed(2)}` : bet.profit < 0 ? `$${bet.profit.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border flex-shrink-0">
            <p className="text-xs text-muted-foreground">Mostrando 1-{filtered.length} de 1,240 resultados</p>
            <div className="flex items-center gap-1">
              {[<ChevronLeft size={13} />, '1', '2', '3', <ChevronRight size={13} />].map((item, i) => (
                <button key={i} className={`w-6 h-6 rounded text-xs font-medium flex items-center justify-center transition-colors ${item === '1' ? 'bg-blue-600 text-white' : 'text-muted-foreground border border-border hover:text-foreground'}`}>{item}</button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        {[
          { label: 'Win Rate Total', value: `${Math.round((won.length / bets.filter(b=>b.status!=='PENDIENTE').length)*100)}.4%`, sub: '↑+2.1%', vc: 'text-foreground' },
          { label: 'Total Stake', value: `$${totalStake.toLocaleString()}`, sub: '', vc: 'text-foreground' },
          { label: 'ROI Acumulado', value: `+${roi}%`, sub: '', vc: 'text-emerald-500' },
          { label: 'Racha Actual', value: null },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            {s.value ? (
              <p className={`text-xl font-bold ${s.vc}`}>{s.value}</p>
            ) : (
              <div className="flex gap-1 mt-1">
                {['W','W','W','L','?'].map((r, j) => (
                  <span key={j} className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${r==='W'?'bg-emerald-100 border border-emerald-400 text-emerald-600':r==='L'?'bg-red-100 border border-red-400 text-red-600':'bg-secondary border border-border text-muted-foreground'}`}>{r}</span>
                ))}
              </div>
            )}
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
