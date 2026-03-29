import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Raindrops from '../components/games/Raindrops'
import Speedrun  from '../components/games/Speedrun'

const GAMES = [
  {
    id: 'raindrops',
    name: 'Raindrops',
    emoji: '☔',
    desc: 'Expressions fall from the sky. Factorise them before they hit the ground! Difficulty increases with your streak.',
    tag: 'Fluency Drill',
    tagColor: 'text-cyan border-cyan/30 bg-cyan/10',
    color: '#00D4FF',
  },
  {
    id: 'speedrun',
    name: 'Speedrun',
    emoji: '🏎️',
    desc: 'Correct answers accelerate your car. Get 3 in a row for TURBO mode!',
    tag: 'Accuracy Challenge',
    tagColor: 'text-coral border-coral/30 bg-coral/10',
    color: '#FF6B6B',
  },
]

export default function Games() {
  const navigate     = useNavigate()
  const [active, setActive] = useState(null)
  const [scores, setScores] = useState({})

  const handleScore = (gameId, score) => {
    setScores((prev) => ({ ...prev, [gameId]: Math.max(prev[gameId] || 0, score) }))
  }

  return (
    <div className="min-h-screen p-6 page-enter">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-white">🎮 Game Modes</h1>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">← Back</button>
        </div>

        {/* Game selector */}
        {!active && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActive(g.id)}
                  className="glass p-6 text-left hover:border-cyan/30 transition group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{g.emoji}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${g.tagColor}`}>
                      {g.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">{g.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{g.desc}</p>
                  {scores[g.id] && (
                    <p className="text-xs text-slate-500">
                      Best: <span className="text-gold font-bold">{scores[g.id]}</span>
                    </p>
                  )}
                  <div className="mt-4 text-sm font-semibold group-hover:translate-x-1 transition"
                    style={{ color: g.color }}>
                    Play Now →
                  </div>
                </button>
              ))}
            </div>

            <div className="glass p-5 text-center">
              <h3 className="font-semibold text-white mb-2">🔓 Earn KC Badges</h3>
              <p className="text-slate-400 text-sm">
                Unlock special badges by mastering each Knowledge Component in the main learning mode.
                Games help you build speed and fluency — badges require mastery ≥ 85%.
              </p>
              <button onClick={() => navigate('/learn')} className="btn-primary mt-4 text-sm">
                Continue Main Learning →
              </button>
            </div>
          </>
        )}

        {/* Active game */}
        {active && (
          <div>
            <button
              onClick={() => setActive(null)}
              className="btn-ghost text-sm mb-6"
            >
              ← Back to Games
            </button>

            {active === 'raindrops' && (
              <Raindrops onScore={(s) => handleScore('raindrops', s)} />
            )}
            {active === 'speedrun' && (
              <Speedrun onScore={(s) => handleScore('speedrun', s)} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
