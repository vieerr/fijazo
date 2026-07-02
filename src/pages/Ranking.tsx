import { useState } from 'react'
import { Lock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { eloData, leaderboard, getRank, RANKS } from '@/data/mockData'

const USER_ELO = 1540
const userRank = getRank(USER_ELO)
const nextRank = RANKS[RANKS.findIndex(r => r.name === userRank.name) + 1]

const achievements = [
  { icon: '🏆', name: '5-MATCH STREAK', unlocked: true },
  { icon: '⚽', name: 'WORLD CUP EXP', unlocked: true },
  { icon: '📈', name: 'ROI ALPHA', unlocked: true },
  { icon: '🥇', name: 'LOCKED', unlocked: false },
  { icon: '🎯', name: 'LOCKED', unlocked: false },
  { icon: '💎', name: 'LOCKED', unlocked: false },
]

export function Ranking() {
  const [eloPeriod, setEloPeriod] = useState<'1M' | '3M' | 'ALL'>('1M')

  const progressPct = nextRank
    ? Math.round(((USER_ELO - userRank.min) / (nextRank.min - userRank.min)) * 100)
    : 100

  return (
    <div className="space-y-4">
      {/* Profile + rewards row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-5">
            <div className="flex gap-5">
              <div className="relative">
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl border-2 ${userRank.border}`}>
                  👤
                </div>
                <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-background">
                  42
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-foreground">Elite Trader</h2>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${userRank.bg} ${userRank.border} ${userRank.color}`}>
                    {userRank.icon} {userRank.name}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">Rango Global: #1,245</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>PROGRESO A {nextRank?.name?.toUpperCase() ?? 'MÁX'}</span>
                    <span className="text-foreground font-medium">{USER_ELO} / {nextRank?.min ?? USER_ELO} ELO</span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all`} style={{ width: `${progressPct}%`, background: 'linear-gradient(to right, #22c55e, #16a34a)' }} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { label: 'WIN RATE', value: '68.4%' },
                    { label: 'CONSISTENCIA', value: 'A+' },
                    { label: 'STREAK ACTUAL', value: '+5' },
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

        {/* Rangos disponibles */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Rangos</h3>
            <div className="space-y-1.5">
              {RANKS.map(r => {
                const isCurrentRank = r.name === userRank.name
                const isPast = r.max < USER_ELO
                return (
                  <div key={r.name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${isCurrentRank ? `${r.bg} border ${r.border}` : ''}`}>
                    <span className="text-base w-5 text-center">{r.icon}</span>
                    <span className={`font-semibold flex-1 ${isCurrentRank ? r.color : isPast ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>{r.name}</span>
                    <span className="text-muted-foreground/60">{r.min}–{r.max === 9999 ? '∞' : r.max}</span>
                    {isCurrentRank && <span className={`text-[10px] font-bold ${r.color}`}>ACTUAL</span>}
                    {isPast && !isCurrentRank && <span className="text-emerald-500 text-[10px]">✓</span>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ELO chart + achievements */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-foreground">Evolución del Rango</h3>
              <div className="flex gap-1">
                {(['1M', '3M', 'ALL'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setEloPeriod(p)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${eloPeriod === p ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={eloData}>
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[1100, 1650]} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', fontSize: '12px' }}
                  formatter={(v: number) => [v, 'ELO']}
                />
                <Line type="monotone" dataKey="elo" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-foreground mb-3">Logros / Medallas</h3>
            <div className="grid grid-cols-3 gap-2">
              {achievements.map((a, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 ${a.unlocked ? 'bg-emerald-50 border border-emerald-300' : 'bg-secondary border border-border opacity-40'}`}
                >
                  <span className="text-xl">{a.icon}</span>
                  <p className="text-[8px] text-center text-muted-foreground uppercase leading-tight px-1">{a.name}</p>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full border border-border rounded-lg py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Ver próximas recompensas
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">Top de la Liga</h3>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">VER RIVALES →</button>
          </div>
          <div className="space-y-2">
            {leaderboard.map(({ rank, name, elo, roi }) => {
              const r = getRank(elo)
              return (
                <div key={rank} className={`flex items-center gap-4 p-2.5 rounded-lg ${rank <= 3 ? 'bg-secondary' : 'hover:bg-secondary/50'} transition-colors`}>
                  <span className={`text-sm font-bold w-6 text-center ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                    #{rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${r.color}`}>
                      {r.icon} {r.name.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{elo.toLocaleString()} ELO</p>
                    <p className="text-xs text-emerald-500">{roi}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
