import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Copy, Clock, TrendingUp, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function NuevoPronóstico() {
  const navigate = useNavigate()
  const [betType, setBetType] = useState<'Simple' | 'Parlay'>('Simple')
  const [status, setStatus] = useState<'PENDIENTE' | 'GANADO' | 'PERDIDO'>('PENDIENTE')
  const [odds, setOdds] = useState('1.85')
  const [stake, setStake] = useState('50.00')

  const retorno = (parseFloat(odds) * parseFloat(stake)).toFixed(2)
  const prob = Math.round((1 / parseFloat(odds)) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Nuevo Pronóstico</h2>
          <p className="text-muted-foreground text-sm mt-1">Ingresa los detalles de tu próxima inversión deportiva para mantener el control de tu bankroll.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={status === 'ABIERTO' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('PENDIENTE')}>ABIERTO</Button>
          <Button variant={status === 'GANADO' ? 'default' : 'outline'} size="sm" onClick={() => setStatus('GANADO')}>RESUELTO</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Deporte</label>
              <div className="relative">
                <Input defaultValue="Football" className="pr-10" />
                <span className="absolute right-3 top-2.5 text-muted-foreground">⚽</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Evento / Competición</label>
              <div className="relative">
                <Input placeholder="World Cup 2026" className="pr-10" />
                <span className="absolute right-3 top-2.5 text-muted-foreground">🏆</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Tipo de Apuesta</label>
              <div className="flex gap-2">
                {(['Simple', 'Parlay'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setBetType(t)}
                    className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${betType === t ? 'bg-emerald-500 text-black' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Cuota (Odds)</label>
              <div className="relative">
                <Input value={odds} onChange={e => setOdds(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">x</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Stake / Inversión</label>
              <div className="relative">
                <Input value={stake} onChange={e => setStake(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">$</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Casa de Apuestas</label>
              <div className="relative">
                <Input defaultValue="Bet365" />
                <Copy size={14} className="absolute right-3 top-2.5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Fecha y Hora</label>
              <div className="relative">
                <Input placeholder="mm/dd/yyyy" type="datetime-local" />
                <Calendar size={14} className="absolute right-3 top-2.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Notas Adicionales</label>
              <textarea
                className="w-full h-28 rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                placeholder="Escribe aquí tu análisis o detalles específicos de la apuesta..."
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">ID de Referencia</label>
                <Input defaultValue="#BT-99021" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Estado Inicial</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setStatus('PENDIENTE')}
                    className={`w-full py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${status === 'PENDIENTE' ? 'bg-emerald-100 border border-emerald-500 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}
                  >
                    <Clock size={14} /> PENDIENTE
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStatus('GANADO')}
                      className={`py-2 rounded text-xs font-semibold transition-colors ${status === 'GANADO' ? 'bg-green-900/40 border border-green-600 text-green-400' : 'bg-secondary text-muted-foreground'}`}
                    >
                      GANADO
                    </button>
                    <button
                      onClick={() => setStatus('PERDIDO')}
                      className={`py-2 rounded text-xs font-semibold transition-colors ${status === 'PERDIDO' ? 'bg-red-900/40 border border-red-600 text-red-400' : 'bg-secondary text-muted-foreground'}`}
                    >
                      PERDIDO
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Retorno Potencial</p>
            <p className="text-xl font-bold text-green-400">${retorno}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Probabilidad</p>
            <p className="text-xl font-bold text-foreground">{prob}%</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>CANCELAR</Button>
          <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold px-6">
            REGISTRAR PRONÓSTICO
          </Button>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '📊', title: 'Insight de Mercado', desc: 'Cuota promedio del mercado: 1.92. Tu cuota es favorable.' },
          { icon: '📈', title: 'Rendimiento Histórico', desc: 'Win Rate en Fútbol: 72%. Buena selección.' },
          { icon: '🛡️', title: 'Gestión de Riesgo', desc: 'Stake recomendado: 2-3% del bankroll ($24-37).' },
        ].map(({ icon, title, desc }) => (
          <Card key={title}>
            <CardContent className="p-4 flex gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
