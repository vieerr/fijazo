/** Tipos que reflejan los schemas de fijazo-api (ver FRONTEND_API_GUIDE.md). */

export type Role = 'USER' | 'ADMIN'
export type BetType = 'SIMPLE' | 'PARLAY'
export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID'
export type AchievementCategory =
  | 'STREAKS'
  | 'EXPERIENCE'
  | 'PROFITABILITY'
  | 'PRECISION'
  | 'ACTIVITY'
  | 'BOOKMAKERS'
  | 'SPORTS'

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface User {
  id: string
  username: string
  email: string
  role: Role
  active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface Leg {
  sport: string
  league: string
  event: string
  market: string
  selection: string
  odds: number
}

export interface Bet {
  id: string
  sport: string
  league: string
  event: string
  bet_type: BetType
  market: string
  selection: string
  odds: number
  stake: number
  bookmaker: string
  event_datetime: string
  status: BetStatus
  notes: string | null
  reference_id: string | null
  legs: Leg[]
  combined_odds: number
  potential_return: number
  potential_profit: number
  implied_probability: number
  created_at: string
  updated_at: string
}

export interface BetCreate {
  sport: string
  league: string
  event: string
  bet_type: BetType
  market: string
  selection: string
  odds: number
  stake: number
  bookmaker: string
  event_datetime: string
  status: BetStatus
  notes?: string | null
  reference_id?: string | null
  legs: Leg[]
}

export type BetUpdate = Partial<BetCreate>

export interface Statistics {
  user_id: string
  username: string
  total_bets: number
  won: number
  lost: number
  void: number
  pending: number
  win_rate: number
  total_stake: number
  total_return: number
  net_profit: number
  roi: number
  avg_odds: number
  avg_stake: number
  biggest_win: number
  biggest_loss: number
  current_streak: number
  best_streak: number
  consistency: number
  distinct_sports: number
  distinct_bookmakers: number
  max_consecutive_days: number
  last_activity_at: string | null
  last_bet_at: string | null
  ranking_score: number
  updated_at: string
}

export interface RankingEntry {
  position: number
  username: string
  ranking_score: number
  win_rate: number
  roi: number
  net_profit: number
  total_bets: number
  current_streak: number
}

export interface RankingPosition {
  position: number | null
  entry: RankingEntry | null
}

export interface Rank {
  level: number
  name: string
  icon: string
  min_score: number
}

export interface RankMe {
  rank_score: number
  current: Rank
  next: Rank | null
  progress: number
  rank_updated_at: string | null
}

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
}

export interface UserAchievement extends Achievement {
  unlocked: boolean
  obtained_at: string | null
}

export interface AchievementsMe {
  unlocked_count: number
  total: number
  achievements: UserAchievement[]
}

export interface ImportError {
  row: number
  field: string
  error: string
}

export interface ImportSummary {
  total_rows: number
  imported: number
  rejected: number
  errors: ImportError[]
}
