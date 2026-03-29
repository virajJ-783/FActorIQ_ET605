import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function Login() {
  const [studentId, setStudentId]   = useState('')
  const [username,  setUsername]    = useState('')
  const [loading,   setLoading]     = useState(false)
  const [error,     setError]       = useState('')
  const login    = useStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!studentId.trim()) return setError('Student ID is required')
    setLoading(true); setError('')
    const result = await login(studentId.trim(), username.trim() || studentId.trim())
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setError('Could not connect. Make sure the backend is running.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['KC-01','KC-04','KC-08','2ab','(a+b)²','x²+5x+6'].map((t,i) => (
          <div key={i} className="absolute text-cyan/5 font-mono font-bold select-none"
            style={{
              fontSize: `${1.5 + (i%3)*0.8}rem`,
              left: `${10 + i * 15}%`,
              top:  `${15 + (i%4)*18}%`,
              transform: `rotate(${-15+i*8}deg)`,
            }}>
            {t}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4
            bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30
            shadow-glow animate-float">
            <span className="text-4xl">🧮</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-1">
            Factor<span className="text-cyan">IQ</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Adaptive Intelligent Tutoring · Class 8 NCERT Factorisation
          </p>
        </div>

        {/* Card */}
        <div className="glass p-8">
          <h2 className="text-xl font-display font-semibold text-white mb-6">
            Start Learning
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                Student ID <span className="text-coral">*</span>
              </label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. student_1042"
                className="w-full bg-navy-700 border border-white/10 rounded-xl px-4 py-3
                  text-white placeholder-slate-500 focus:outline-none focus:border-cyan/50
                  focus:ring-1 focus:ring-cyan/30 transition text-sm font-mono"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                This comes from your platform login — provided by your school system
              </p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1.5 font-medium">
                Display Name <span className="text-slate-500">(optional)</span>
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Priya"
                className="w-full bg-navy-700 border border-white/10 rounded-xl px-4 py-3
                  text-white placeholder-slate-500 focus:outline-none focus:border-cyan/50
                  focus:ring-1 focus:ring-cyan/30 transition text-sm"
              />
            </div>

            {error && (
              <div className="misc-alert text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                  </svg>
                  Connecting…
                </span>
              ) : 'Begin My Journey →'}
            </button>
          </form>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['BA-BKT Engine','Misconception Detection','Adaptive Hints','Gamified XP'].map((t) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 text-slate-400 border border-white/8">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
