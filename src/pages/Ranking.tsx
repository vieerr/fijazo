import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loading, ErrorState, EmptyState } from '@/components/ui/states'
import { useApiQuery } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { formatPercent, formatSignedMoney, formatSignedPercent } from '@/lib/bets'
import type { AchievementCategory, UserAchievement } from '@/types/api'

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  STREAKS: 'Rachas',
  EXPERIENCE: 'Experiencia',
  PROFITABILITY: 'Rentabilidad',
  PRECISION: 'Precisión',
  ACTIVITY: 'Actividad',
  BOOKMAKERS: 'Casas de apuestas',
  SPORTS: 'Deportes',
}

const LEADERBOARD_SIZE = 10

export function Ranking() {
  const { user } = useAuth()
  const [showAllAchievements, setShowAllAchievements] = useState(false)

  const rankMe = useApiQuery(() => api.ranks.me(), [])
  const ranks = useApiQuery(() => api.ranks.list(), [])
  const rankingMe = useApiQuery(() => api.ranking.me(), [])
  const top = useApiQuery(() => api.ranking.top(LEADERBOARD_SIZE), [])
  const achievements = useApiQuery(() => api.achievements.me(), [])
  const stats = useApiQuery(() => api.statistics.me(), [])

  const byCategory = useMemo(() => {
    const list = achievements.data?.achievements ?? []
    const groups = new Map<AchievementCategory, UserAchievement[]>()
    for (const a of list) {
      groups.set(a.category, [...(groups.get(a.category) ?? []), a])
    }
    return [...groups.entries()]
  }, [achievements.data])

  const visibleAchievements = useMemo(() => {
    const list = achievements.data?.achievements ?? []
    if (showAllAchievements) return list
    // Vista compacta: primero los desbloqueados, después los pendientes más cercanos.
    return [...list].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)).slice(0, 6)
  }, [achievements.data, showAllAchievements])

  if (rankMe.loading || ranks.loading || stats.loading) return <Loading className="h-full" label="Cargando perfil…" />
  if (rankMe.error || ranks.error || stats.error) {
    return (
      <ErrorState
        className="h-full"
        message={rankMe.error ?? ranks.error ?? stats.error ?? ''}
        onRetry={() => {
          rankMe.reload()
          ranks.reload()
          stats.reload()
        }}
      />
    )
  }

  const me = rankMe.data!
  const s = stats.data!
  const position = rankingMe.data?.position ?? null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-5">
            <div className="flex gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl border-2 border-border">
                  {me.current.icon}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-background">
                  {me.current.level}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">{user?.username ?? s.username}</h2>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border border-emerald-500 bg-emerald-100 text-emerald-600">
                    {me.current.icon} {me.current.name}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {position ? `Rango Global: #${position}` : 'Todavía sin posición en el ranking global'}
                </p>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>PROGRESO A {(me.next?.name ?? 'MÁXIMO').toUpperCase()}</span>
                    <span className="text-foreground font-medium">
                      {me.rank_score.toFixed(1)} / {me.next ? me.next.min_score.toFixed(0) : '100'} pts
                    </span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${me.progress}%`, background: 'linear-gradient(to right, #22c55e, #16a34a)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'WIN RATE', value: formatPercent(s.win_rate) },
                    { label: 'ROI', value: formatSignedPercent(s.roi) },
                    { label: 'CONSISTENCIA', value: `${s.consistency.toFixed(0)}/100` },
                    {
                      label: 'STREAK ACTUAL',
                      value: `${s.current_streak > 0 ? '+' : ''}${s.current_streak}`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-secondary rounded-lg p-2.5 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                      <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Rangos</h3>
            <div className="space-y-1.5">
              {(ranks.data ?? []).map(r => {
                const isCurrent = r.level === me.current.level
                const isPast = r.level < me.current.level
                return (
                  <div
                    key={r.level}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${isCurrent ? 'bg-emerald-100 border border-emerald-500' : ''}`}
                  >
                    <span className="text-base w-5 text-center">{r.icon}</span>
                    <span
                      className={`font-semibold flex-1 ${isCurrent ? 'text-emerald-600' : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}
                    >
                      {r.name}
                    </span>
                    <span className="text-muted-foreground/60">{r.min_score}+</span>
                    {isCurrent && <span className="text-[10px] font-bold text-emerald-600">ACTUAL</span>}
                    {isPast && <span className="text-emerald-500 text-[10px]">✓</span>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">
              Logros / Medallas
              {achievements.data && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  {achievements.data.unlocked_count} / {achievements.data.total}
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowAllAchievements(v => !v)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAllAchievements ? 'Ver menos' : 'Ver todos'}
            </button>
          </div>

          {achievements.loading ? (
            <Loading label="Cargando logros…" />
          ) : achievements.error ? (
            <ErrorState message={achievements.error} onRetry={achievements.reload} />
          ) : showAllAchievements ? (
            <div className="space-y-4">
              {byCategory.map(([category, list]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {CATEGORY_LABEL[category]}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {list.map(a => (
                      <AchievementTile key={a.id} achievement={a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {visibleAchievements.map(a => (
                <AchievementTile key={a.id} achievement={a} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">Top de la Liga</h3>
            <span className="text-xs text-muted-foreground">Ordenado por puntuación de ranking</span>
          </div>

          {top.loading ? (
            <Loading label="Cargando ranking…" />
          ) : top.error ? (
            <ErrorState message={top.error} onRetry={top.reload} />
          ) : (top.data ?? []).length === 0 ? (
            <EmptyState message="Todavía no hay usuarios en el ranking." />
          ) : (
            <div className="space-y-2">
              {(top.data ?? []).map(entry => {
                const isMe = entry.username === (user?.username ?? s.username)
                return (
                  <div
                    key={entry.username}
                    className={`flex items-center gap-4 p-2.5 rounded-lg transition-colors ${isMe ? 'bg-emerald-100 border border-emerald-500' : entry.position <= 3 ? 'bg-secondary' : 'hover:bg-secondary/50'}`}
                  >
                    <span
                      className={`text-sm font-bold w-6 text-center ${entry.position === 1 ? 'text-yellow-500' : entry.position === 2 ? 'text-slate-400' : entry.position === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}
                    >
                      #{entry.position}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold uppercase">
                      {entry.username[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {entry.username}
                        {isMe && <span className="ml-2 text-[10px] text-emerald-600 font-bold">TÚ</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.total_bets} apuestas · WR {formatPercent(entry.win_rate)} · racha{' '}
                        {entry.current_streak > 0 ? '+' : ''}
                        {entry.current_streak}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{entry.ranking_score.toFixed(1)} pts</p>
                      <p className={`text-xs ${entry.net_profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {formatSignedMoney(entry.net_profit)} · {formatSignedPercent(entry.roi)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AchievementTile({ achievement }: { achievement: UserAchievement }) {
  return (
    <div
      title={`${achievement.name} — ${achievement.description}`}
      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 p-1 ${achievement.unlocked ? 'bg-emerald-50 border border-emerald-300' : 'bg-secondary border border-border opacity-40'}`}
    >
      <span className="text-xl">{achievement.icon}</span>
      <p className="text-[8px] text-center text-muted-foreground uppercase leading-tight px-1">{achievement.name}</p>
      {achievement.unlocked && achievement.obtained_at && (
        <p className="text-[7px] text-emerald-600">
          {new Date(achievement.obtained_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
        </p>
      )}
    </div>
  )
}
