import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore, { KC_META, KC_ORDER } from '../store/useStore'

function MasteryBar({ value, color }) {
  const pct = Math.round(value * 100)
  return (
    <div className="mastery-bar-track">
      <div className="mastery-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function ConceptCard({ kcId, state }) {
  const meta    = KC_META[kcId]
  const mastery = state?.mastery ?? 0.30
  const mastered = mastery >= 0.85
  const started  = state && state.attempts > 0
  return (
    <div className={`glass p-4 transition hover:border-cyan/30 ${mastered ? 'border-mint/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          {/* Concept name — NOT KC code */}
          <p className="text-sm font-semibold text-white">{meta.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{meta.subtopic}</p>
        </div>
        {mastered && (
          <span className="text-xl" title="Mastered!">✅</span>
        )}
        {!mastered && !started && (
          <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">Not started</span>
        )}
      </div>
      <MasteryBar value={mastery} color={mastered ? '#00FFAA' : meta.color} />
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-500">
          {started ? `${state.attempts} attempts` : '—'}
        </span>
        <span className="text-xs font-mono font-bold" style={{ color: meta.color }}>
          {Math.round(mastery * 100)}% mastery
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate       = useNavigate()
  const student        = useStore((s) => s.student)
  const refreshStudent = useStore((s) => s.refreshStudent)
  const logout         = useStore((s) => s.logout)

  useEffect(() => { refreshStudent() }, [])

  if (!student) return null

  const kcMap = {}
  ;(student.kc_states || []).forEach((kc) => { kcMap[kc.kc_id] = kc })

  // Progress = concepts with at least 1 attempt (concepts COVERED)
  const conceptsCovered = KC_ORDER.filter(kcId => kcMap[kcId]?.attempts > 0).length
  const progressPct     = Math.round((conceptsCovered / KC_ORDER.length) * 100)

  // Mastery = average BKT mastery across all KCs
  const overallMastery = KC_ORDER.reduce((sum, kc) => sum + (kcMap[kc]?.mastery ?? 0.30), 0) / KC_ORDER.length
  const masteredCount  = KC_ORDER.filter((kc) => (kcMap[kc]?.mastery ?? 0) >= 0.85).length

  return (
    <div className="min-h-screen p-6 page-enter">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              नमस्ते, <span className="text-cyan">{student.username}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Chapter 12 · Factorisation · NCERT Class 8
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/games')}       className="btn-ghost text-sm">🎮 Games</button>
            <button onClick={() => navigate('/leaderboard')} className="btn-ghost text-sm">🏆 Leaderboard</button>
            <button onClick={() => navigate('/analytics')}   className="btn-ghost text-sm">📊 Analytics</button>
            <button onClick={logout} className="btn-ghost text-sm text-coral border-coral/30">Logout</button>
          </div>
        </div>

        {/* Stats row — progress and mastery shown separately */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total XP',          value: student.xp_total,              icon: '⚡', color: '#FFD700' },
            { label: 'Level',             value: student.level,                  icon: '🎯', color: '#00D4FF' },
            { label: 'Concepts Covered',  value: `${conceptsCovered} / 9`,       icon: '📖', color: '#00FFAA' },
            { label: 'Concepts Mastered', value: `${masteredCount} / 9`,         icon: '🧠', color: '#8B5CF6' },
          ].map((s) => (
            <div key={s.label} className="glass p-5 text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {student.badges?.length > 0 && (
          <div className="glass p-5 mb-8">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Badges Earned
            </h3>
            <div className="flex flex-wrap gap-3">
              {student.badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                  bg-gold/10 border border-gold/30 text-sm">
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-gold font-medium text-xs">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Concept Mastery Grid — no KC codes shown */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-white">
            Concept Mastery
          </h2>
          <button
            onClick={() => navigate('/learn')}
            className="btn-primary text-sm py-2"
          >
            Continue Learning →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {KC_ORDER.map((kcId) => (
            <ConceptCard key={kcId} kcId={kcId} state={kcMap[kcId]} />
          ))}
        </div>

        {/* Progress vs Mastery — shown separately */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Progress bar (concepts covered) */}
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-white">Overall Progress</h3>
                <p className="text-xs text-slate-400 mt-0.5">Concepts covered (attempted)</p>
              </div>
              <span className="text-cyan font-mono font-bold text-lg">
                {progressPct}%
              </span>
            </div>
            <MasteryBar value={conceptsCovered / KC_ORDER.length} color="#00D4FF" />
            <p className="text-xs text-slate-500 mt-2">{conceptsCovered} of {KC_ORDER.length} concepts started</p>
          </div>

          {/* Mastery bar (BKT average) */}
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-white">Overall Mastery</h3>
                <p className="text-xs text-slate-400 mt-0.5">Average BKT score across all concepts</p>
              </div>
              <span className="text-purple font-mono font-bold text-lg">
                {Math.round(overallMastery * 100)}%
              </span>
            </div>
            <MasteryBar value={overallMastery} color="#8B5CF6" />
            <p className="text-xs text-slate-500 mt-2">{masteredCount} of {KC_ORDER.length} concepts mastered (≥85%)</p>
          </div>

        </div>

      </div>
    </div>
  )
}
