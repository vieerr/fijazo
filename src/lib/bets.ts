import type { Bet, BetStatus } from '@/types/api'

/** Etiquetas en español para los estados del backend. */
export const STATUS_LABEL: Record<BetStatus, string> = {
  PENDING: 'PENDIENTE',
  WON: 'GANADO',
  LOST: 'PERDIDO',
  VOID: 'ANULADO',
}

export const STATUS_VARIANT: Record<BetStatus, 'pending' | 'won' | 'lost' | 'secondary'> = {
  PENDING: 'pending',
  WON: 'won',
  LOST: 'lost',
  VOID: 'secondary',
}

const SPORT_ICONS: Record<string, string> = {
  futbol: '⚽',
  football: '⚽',
  soccer: '⚽',
  baloncesto: '🏀',
  basketball: '🏀',
  nba: '🏀',
  tenis: '🎾',
  tennis: '🎾',
  beisbol: '⚾',
  baseball: '⚾',
  hockey: '🏒',
  boxeo: '🥊',
  mma: '🥊',
  ufc: '🥊',
  esports: '🎮',
  formula1: '🏎️',
  f1: '🏎️',
  golf: '⛳',
  ciclismo: '🚴',
}

export function sportIcon(sport: string): string {
  const key = sport
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
  return SPORT_ICONS[key] ?? '🏅'
}

/**
 * Beneficio realizado de una apuesta. Coincide con el cálculo del backend:
 * WON gana `stake × (combined_odds − 1)`, LOST pierde el stake, VOID devuelve 0
 * y PENDING todavía no aporta nada.
 */
export function betProfit(bet: Bet): number {
  switch (bet.status) {
    case 'WON':
      return bet.stake * (bet.combined_odds - 1)
    case 'LOST':
      return -bet.stake
    default:
      return 0
  }
}

/** ¿La apuesta ya está decidida? (VOID y PENDING no cuentan para win rate). */
export function isSettled(bet: Bet): boolean {
  return bet.status === 'WON' || bet.status === 'LOST'
}

export function formatMoney(value: number): string {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export function formatSignedMoney(value: number): string {
  return `${value > 0 ? '+' : ''}${formatMoney(value)}`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatSignedPercent(value: number, decimals = 1): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/** Fecha corta en dos líneas (dd/mm/yyyy + hh:mm) para la tabla de historial. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const day = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${day}\n${time}`
}

/** Convierte un ISO del backend al valor que espera <input type="datetime-local">. */
export function toLocalInputValue(iso: string): string {
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

/** Curva de bankroll acumulado a partir de las apuestas ya decididas. */
export function bankrollSeries(bets: Bet[]): { label: string; value: number }[] {
  const settled = bets
    .filter(isSettled)
    .slice()
    .sort((a, b) => a.event_datetime.localeCompare(b.event_datetime))

  let cumulative = 0
  return settled.map(bet => {
    cumulative += betProfit(bet)
    return {
      label: new Date(bet.event_datetime).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      value: Number(cumulative.toFixed(2)),
    }
  })
}

/** Beneficio y pérdida agregados por día, para el gráfico de distribución. */
export function dailyProfitSeries(bets: Bet[]): { day: string; value: number; loss: number }[] {
  const buckets = new Map<string, { value: number; loss: number }>()

  for (const bet of bets.filter(isSettled)) {
    const key = bet.event_datetime.slice(0, 10)
    const bucket = buckets.get(key) ?? { value: 0, loss: 0 }
    const profit = betProfit(bet)
    if (profit >= 0) bucket.value += profit
    else bucket.loss += profit
    buckets.set(key, bucket)
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, { value, loss }]) => ({
      day: new Date(day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      value: Number(value.toFixed(2)),
      loss: Number(loss.toFixed(2)),
    }))
}

export interface GroupYield {
  name: string
  yield: number
  bets: number
  profit: number
}

/** Yield (beneficio / stake × 100) agrupado por un campo de la apuesta. */
export function yieldByField(bets: Bet[], field: 'bookmaker' | 'sport' | 'bet_type'): GroupYield[] {
  const buckets = new Map<string, { stake: number; profit: number; bets: number }>()

  for (const bet of bets.filter(isSettled)) {
    const key = String(bet[field])
    const bucket = buckets.get(key) ?? { stake: 0, profit: 0, bets: 0 }
    bucket.stake += bet.stake
    bucket.profit += betProfit(bet)
    bucket.bets += 1
    buckets.set(key, bucket)
  }

  return [...buckets.entries()]
    .map(([name, { stake, profit, bets: count }]) => ({
      name,
      yield: stake > 0 ? Number(((profit / stake) * 100).toFixed(1)) : 0,
      profit: Number(profit.toFixed(2)),
      bets: count,
    }))
    .sort((a, b) => b.yield - a.yield)
}

/** Racha de resultados más recientes (W/L/?) para la tarjeta de historial. */
export function recentForm(bets: Bet[], size = 5): ('W' | 'L' | '?')[] {
  return bets
    .slice()
    .sort((a, b) => b.event_datetime.localeCompare(a.event_datetime))
    .slice(0, size)
    .reverse()
    .map(bet => (bet.status === 'WON' ? 'W' : bet.status === 'LOST' ? 'L' : '?'))
}
