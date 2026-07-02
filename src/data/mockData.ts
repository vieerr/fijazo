export interface Bet {
  id: string
  date: string
  sport: string
  sportIcon: string
  event: string
  market: string
  odds: number
  stake: number
  status: 'GANADO' | 'PERDIDO' | 'PENDIENTE'
  profit: number
  bookmaker: string
  competition: string
}

export const bets: Bet[] = [
  { id: 'BT-001', date: '24/05/2024\n20:45', sport: 'Fútbol', sportIcon: '⚽', event: 'Real Madrid vs Dortmund', market: 'Ganador Final: Real Madrid', odds: 1.85, stake: 100, status: 'GANADO', profit: 85, bookmaker: 'Bet365', competition: 'Champions League' },
  { id: 'BT-002', date: '23/05/2024\n19:30', sport: 'NBA', sportIcon: '🏀', event: 'Celtics vs Pacers', market: 'Over 220.5 Puntos', odds: 1.91, stake: 50, status: 'PERDIDO', profit: -50, bookmaker: 'Pinnacle', competition: 'NBA Playoffs' },
  { id: 'BT-003', date: 'Hoy\n21:00', sport: 'Tennis', sportIcon: '🎾', event: 'Djokovic vs Alcaraz', market: 'Set 1: Alcaraz', odds: 2.10, stake: 25, status: 'PENDIENTE', profit: 0, bookmaker: 'Bet365', competition: 'Roland Garros' },
  { id: 'BT-004', date: '22/05/2024\n14:00', sport: 'Premier League', sportIcon: '⚽', event: 'Man City vs Arsenal', market: 'Ambos Marcan: Sí', odds: 1.65, stake: 200, status: 'GANADO', profit: 130, bookmaker: 'Bet365', competition: 'Premier League' },
  { id: 'BT-005', date: '21/05/2024\n22:00', sport: 'Esports', sportIcon: '🎮', event: 'G2 vs T1', market: 'Mapa 1: G2', odds: 2.40, stake: 40, status: 'PERDIDO', profit: -40, bookmaker: 'Bwin', competition: 'MSI 2024' },
  { id: 'BT-006', date: '20/05/2024\n18:00', sport: 'Fútbol', sportIcon: '⚽', event: 'España vs Alemania', market: 'Victoria local (1)', odds: 2.10, stake: 100, status: 'GANADO', profit: 110, bookmaker: 'Bet365', competition: 'World Cup 2026' },
  { id: 'BT-007', date: '20/05/2024\n20:00', sport: 'Fútbol', sportIcon: '⚽', event: 'Argentina vs Brasil', market: 'Ambos marcan (Sí)', odds: 1.85, stake: 250, status: 'PENDIENTE', profit: 0, bookmaker: 'Pinnacle', competition: 'World Cup 2026' },
  { id: 'BT-008', date: '19/05/2024\n17:00', sport: 'Fútbol', sportIcon: '⚽', event: 'Francia vs Inglaterra', market: 'Más de 2.5 goles', odds: 1.95, stake: 50, status: 'PERDIDO', profit: -50, bookmaker: 'Bet365', competition: 'World Cup 2026' },
]

export const bankrollData = [
  { month: 'ENE', value: 800 },
  { month: 'FEB', value: 820 },
  { month: 'MAR', value: 780 },
  { month: 'ABR', value: 950 },
  { month: 'MAY', value: 1240 },
]

export const benefitsData = [
  { day: '1 OCT', value: 45, loss: -20 },
  { day: '5 OCT', value: 80, loss: -10 },
  { day: '10 OCT', value: 30, loss: -60 },
  { day: '15 OCT', value: 110, loss: -15 },
  { day: '20 OCT', value: 55, loss: -35 },
  { day: '25 OCT', value: 90, loss: -25 },
  { day: '30 OCT', value: 75, loss: -40 },
]

export const eloData = [
  { week: 'SEMANA 01', elo: 1200 },
  { week: 'SEMANA 02', elo: 1380 },
  { week: 'SEMANA 03', elo: 1260 },
  { week: 'NOV', elo: 1540 },
]

export const RANKS = [
  { name: 'Hierro',    min: 0,    max: 399,  icon: '🪨', color: 'text-slate-500',   bg: 'bg-slate-100',   border: 'border-slate-400' },
  { name: 'Bronce',   min: 400,  max: 799,  icon: '🥉', color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-600' },
  { name: 'Plata',    min: 800,  max: 1199, icon: '🥈', color: 'text-slate-400',   bg: 'bg-slate-50',    border: 'border-slate-300' },
  { name: 'Oro',      min: 1200, max: 1599, icon: '🥇', color: 'text-yellow-500',  bg: 'bg-yellow-50',   border: 'border-yellow-400' },
  { name: 'Platino',  min: 1600, max: 1999, icon: '💠', color: 'text-cyan-500',    bg: 'bg-cyan-50',     border: 'border-cyan-400' },
  { name: 'Diamante', min: 2000, max: 2399, icon: '💎', color: 'text-blue-500',    bg: 'bg-blue-50',     border: 'border-blue-400' },
  { name: 'Maestro',  min: 2400, max: 2799, icon: '👑', color: 'text-purple-600',  bg: 'bg-purple-50',   border: 'border-purple-400' },
  { name: 'Retador',  min: 2800, max: 9999, icon: '⚡', color: 'text-red-500',     bg: 'bg-red-50',      border: 'border-red-400' },
]

export function getRank(elo: number) {
  return RANKS.find(r => elo >= r.min && elo <= r.max) ?? RANKS[0]
}

export const leaderboard = [
  { rank: 1, name: 'AlphaPredicto', elo: 2410, roi: '+12.4%' },
  { rank: 2, name: 'Shark_Odds',    elo: 2295, roi: '+10.2%' },
  { rank: 3, name: 'BetMaestro',    elo: 2180, roi: '+9.8%' },
  { rank: 4, name: 'OddsWizard',    elo: 2050, roi: '+8.1%' },
  { rank: 5, name: 'PredictKing',   elo: 1890, roi: '+7.3%' },
]
