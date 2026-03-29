import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import api from '../utils/api'

const RANK_COLORS = ['#FFD700','#C0C0C0','#CD7F32']
const RANK_ICONS  = ['🥇','🥈','🥉']

export default function Leaderboard() {
  const navigate = useNavigate()
  const student  = useStore((s) => s.student)
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard/')
      .then((r) => { setRows(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen p-6 page-enter">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-white">🏆 Leaderboard</h1>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">← Back</button>
        </div>

        {loading ? (
          <p className="text-center text-slate-400 animate-pulse">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="glass p-8 text-center">
            <p className="text-slate-400">No students yet. Be the first to earn XP!</p>
            <button onClick={() => navigate('/learn')} className="btn-primary mt-4">Start Learning</button>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const isMe = row.student_id === student?.student_id
              return (
                <div key={row.student_id}
                  className={`glass p-4 flex items-center gap-4 transition ${
                    isMe ? 'border-cyan/40 bg-cyan/5' : ''
                  }`}>

                  <div className="w-10 text-center">
                    {row.rank <= 3
                      ? <span className="text-2xl">{RANK_ICONS[row.rank-1]}</span>
                      : <span className="text-slate-400 font-mono font-bold">{row.rank}</span>
                    }
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isMe ? 'text-cyan' : 'text-white'}`}>
                        {row.username}
                      </span>
                      {isMe && <span className="text-xs text-cyan/70">(You)</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-500">Level {row.level}</span>
                      <span className="text-xs text-slate-500">{row.badges_count} badges</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-display font-bold text-xl"
                      style={{ color: row.rank <= 3 ? RANK_COLORS[row.rank-1] : '#94a3b8' }}>
                      {row.xp_total.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">XP</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 glass p-4 text-center text-xs text-slate-500">
          XP earned from correct answers (+10 XP), no-hint bonuses (+5 XP), and KC mastery badges (+50 XP)
        </div>
      </div>
    </div>
  )
}
