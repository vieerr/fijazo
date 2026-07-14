import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Loader2, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api, ApiError } from '@/lib/api'
import { formatMoney } from '@/lib/bets'
import type { BetStatus, BetType, Leg } from '@/types/api'

const emptyLeg: Leg = { sport: '', league: '', event: '', market: '', selection: '', odds: 2 }

/** Convierte el valor de <input type="datetime-local"> a ISO UTC para el backend. */
function toIsoUtc(local: string): string {
  return new Date(local).toISOString()
}

export function NuevoPronóstico() {
  const navigate = useNavigate()

  const [betType, setBetType] = useState<BetType>('SIMPLE')
  const [status, setStatus] = useState<BetStatus>('PENDING')
  const [sport, setSport] = useState('Fútbol')
  const [league, setLeague] = useState('')
  const [event, setEvent] = useState('')
  const [market, setMarket] = useState('')
  const [selection, setSelection] = useState('')
  const [odds, setOdds] = useState('1.85')
  const [stake, setStake] = useState('50.00')
  const [bookmaker, setBookmaker] = useState('Bet365')
  const [eventDatetime, setEventDatetime] = useState('')
  const [notes, setNotes] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [legs, setLegs] = useState<Leg[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const oddsNum = parseFloat(odds) || 0
  const stakeNum = parseFloat(stake) || 0
  // Mismo cálculo que el backend: la cuota combinada multiplica la principal por la de cada leg.
  const combinedOdds = legs.reduce((acc, leg) => acc * (Number(leg.odds) || 1), oddsNum)
  const retorno = stakeNum * combinedOdds
  const prob = combinedOdds > 0 ? (1 / combinedOdds) * 100 : 0

  function switchType(type: BetType) {
    setBetType(type)
    // El backend exige legs vacías en SIMPLE y al menos una en PARLAY.
    setLegs(type === 'PARLAY' ? (legs.length ? legs : [{ ...emptyLeg }]) : [])
  }

  function updateLeg(index: number, patch: Partial<Leg>) {
    setLegs(current => current.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)))
  }

  async function onSubmit() {
    setError(null)

    if (!eventDatetime) {
      setError('Indica la fecha y hora del evento.')
      return
    }
    if (betType === 'PARLAY' && legs.length === 0) {
      setError('Un parlay necesita al menos una selección adicional.')
      return
    }

    setSubmitting(true)
    try {
      await api.bets.create({
        sport,
        league,
        event,
        bet_type: betType,
        market,
        selection,
        odds: oddsNum,
        stake: stakeNum,
        bookmaker,
        event_datetime: toIsoUtc(eventDatetime),
        status,
        notes: notes || null,
        reference_id: referenceId || null,
        legs: betType === 'PARLAY' ? legs.map(leg => ({ ...leg, odds: Number(leg.odds) })) : [],
      })
      navigate('/historial')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar el pronóstico')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Nuevo Pronóstico</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Ingresa los detalles de tu próxima inversión deportiva para mantener el control de tu bankroll.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-4 gap-4">
            <Field label="Deporte">
              <Input value={sport} onChange={e => setSport(e.target.value)} placeholder="Fútbol" />
            </Field>
            <Field label="Liga / Competición">
              <Input value={league} onChange={e => setLeague(e.target.value)} placeholder="LaLiga" />
            </Field>
            <Field label="Evento">
              <Input value={event} onChange={e => setEvent(e.target.value)} placeholder="Real Madrid vs Barcelona" />
            </Field>
            <Field label="Tipo de Apuesta">
              <div className="flex gap-2">
                {(['SIMPLE', 'PARLAY'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => switchType(t)}
                    className={`flex-1 py-2 rounded text-sm font-semibold transition-colors ${betType === t ? 'bg-emerald-500 text-black' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                  >
                    {t === 'SIMPLE' ? 'Simple' : 'Parlay'}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Field label="Mercado">
              <Input value={market} onChange={e => setMarket(e.target.value)} placeholder="1X2" />
            </Field>
            <Field label="Selección">
              <Input value={selection} onChange={e => setSelection(e.target.value)} placeholder="Real Madrid" />
            </Field>
            <Field label="Cuota (Odds)">
              <div className="relative">
                <Input type="number" step="0.01" min="1.01" value={odds} onChange={e => setOdds(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">x</span>
              </div>
            </Field>
            <Field label="Stake / Inversión">
              <div className="relative">
                <Input type="number" step="0.01" min="0.01" value={stake} onChange={e => setStake(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-muted-foreground text-xs">$</span>
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Casa de Apuestas">
              <Input value={bookmaker} onChange={e => setBookmaker(e.target.value)} placeholder="Bet365" />
            </Field>
            <Field label="Fecha y Hora del Evento">
              <div className="relative">
                <Input
                  type="datetime-local"
                  value={eventDatetime}
                  onChange={e => setEventDatetime(e.target.value)}
                />
                <Calendar size={14} className="absolute right-3 top-2.5 text-muted-foreground pointer-events-none" />
              </div>
            </Field>
            <Field label="ID de Referencia (opcional)">
              <Input value={referenceId} onChange={e => setReferenceId(e.target.value)} placeholder="#BT-99021" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Notas Adicionales (opcional)">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full h-28 rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                placeholder="Escribe aquí tu análisis o detalles específicos de la apuesta..."
              />
            </Field>
            <Field label="Estado Inicial">
              <div className="space-y-2">
                <button
                  onClick={() => setStatus('PENDING')}
                  className={`w-full py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${status === 'PENDING' ? 'bg-emerald-100 border border-emerald-500 text-emerald-500' : 'bg-secondary text-muted-foreground'}`}
                >
                  <Clock size={14} /> PENDIENTE
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setStatus('WON')}
                    className={`py-2 rounded text-xs font-semibold transition-colors ${status === 'WON' ? 'bg-green-900/40 border border-green-600 text-green-400' : 'bg-secondary text-muted-foreground'}`}
                  >
                    GANADO
                  </button>
                  <button
                    onClick={() => setStatus('LOST')}
                    className={`py-2 rounded text-xs font-semibold transition-colors ${status === 'LOST' ? 'bg-red-900/40 border border-red-600 text-red-400' : 'bg-secondary text-muted-foreground'}`}
                  >
                    PERDIDO
                  </button>
                  <button
                    onClick={() => setStatus('VOID')}
                    className={`py-2 rounded text-xs font-semibold transition-colors ${status === 'VOID' ? 'bg-secondary border border-foreground/40 text-foreground' : 'bg-secondary text-muted-foreground'}`}
                  >
                    ANULADO
                  </button>
                </div>
              </div>
            </Field>
          </div>
        </CardContent>
      </Card>

      {betType === 'PARLAY' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-sm">Selecciones adicionales del parlay</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  La selección principal de arriba cuenta como la primera del combinado.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLegs([...legs, { ...emptyLeg }])}>
                <Plus size={13} /> Añadir selección
              </Button>
            </div>

            {legs.map((leg, i) => (
              <div key={i} className="grid grid-cols-7 gap-2 items-end border-t border-border pt-3">
                <Field label="Deporte">
                  <Input value={leg.sport} onChange={e => updateLeg(i, { sport: e.target.value })} />
                </Field>
                <Field label="Liga">
                  <Input value={leg.league} onChange={e => updateLeg(i, { league: e.target.value })} />
                </Field>
                <Field label="Evento">
                  <Input value={leg.event} onChange={e => updateLeg(i, { event: e.target.value })} />
                </Field>
                <Field label="Mercado">
                  <Input value={leg.market} onChange={e => updateLeg(i, { market: e.target.value })} />
                </Field>
                <Field label="Selección">
                  <Input value={leg.selection} onChange={e => updateLeg(i, { selection: e.target.value })} />
                </Field>
                <Field label="Cuota">
                  <Input
                    type="number"
                    step="0.01"
                    min="1.01"
                    value={leg.odds}
                    onChange={e => updateLeg(i, { odds: parseFloat(e.target.value) || 0 })}
                  />
                </Field>
                <button
                  onClick={() => setLegs(legs.filter((_, j) => j !== i))}
                  className="h-9 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
                  title="Quitar selección"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && (
        <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Cuota Combinada</p>
            <p className="text-xl font-bold text-foreground">{combinedOdds.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Retorno Potencial</p>
            <p className="text-xl font-bold text-green-400">{formatMoney(retorno)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Probabilidad Implícita</p>
            <p className="text-xl font-bold text-foreground">{prob.toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/')} disabled={submitting}>
            CANCELAR
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="bg-emerald-500 text-black hover:bg-emerald-400 font-semibold px-6"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            REGISTRAR PRONÓSTICO
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">{label}</label>
      {children}
    </div>
  )
}
