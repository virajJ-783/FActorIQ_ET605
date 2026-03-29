import { useState, useEffect, useRef, useCallback } from 'react'
import { getAllQuestions } from '../../utils/questionBank'

const TRACK_W = 580
// Three lanes: player + 2 dummy cars
const LANE_H  = 90
const TRACK_H = LANE_H * 3
const LANES   = [LANE_H * 0.5, LANE_H * 1.5, LANE_H * 2.5]  // Y centres for 3 lanes
const PLAYER_LANE = 0   // player is always in top lane

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

/** Draw a single car at (x, y) with a gradient colour */
function drawCar(ctx, x, y, color1, color2, turbo = false, carW = 52, carH = 26) {
  ctx.save()
  ctx.translate(x, y)

  // Turbo glow
  if (turbo) {
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 70)
    glow.addColorStop(0, `${color1}30`)
    glow.addColorStop(1, `${color1}00`)
    ctx.fillStyle = glow
    ctx.fillRect(-60, -40, 120, 80)
  }

  // Body
  const grad = ctx.createLinearGradient(0, -carH / 2, 0, carH / 2)
  grad.addColorStop(0, color1)
  grad.addColorStop(1, color2)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 6)
  ctx.fill()

  // Window
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.roundRect(-10, -carH / 2 + 4, 18, 10, 3)
  ctx.fill()

  // Wheels
  ctx.fillStyle = '#1a1a2e'
  ;[[-carW / 2 + 6, carH / 2 - 2], [carW / 2 - 10, carH / 2 - 2],
    [-carW / 2 + 6, -carH / 2 + 2], [carW / 2 - 10, -carH / 2 + 2]
  ].forEach(([wx, wy]) => {
    ctx.beginPath(); ctx.ellipse(wx, wy, 6, 5, 0, 0, Math.PI * 2); ctx.fill()
  })

  // Flames (player turbo)
  if (turbo) {
    ctx.fillStyle = '#ff6b00'
    ctx.beginPath()
    ctx.moveTo(-carW / 2, -4)
    ctx.lineTo(-carW / 2 - 12 - Math.random() * 8, 0)
    ctx.lineTo(-carW / 2, 4)
    ctx.fill()
  }

  ctx.restore()
}

export default function Speedrun({ onScore }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({
    // Player car
    x: 40, speed: 0, maxSpeed: 6, turbo: false,
    streakCorrect: 0, score: 0, bgOffset: 0, running: false,
    // Dummy cars (two AI opponents in their own lanes)
    dummy: [
      { x: 120, speed: 1.8, color1: '#f97316', color2: '#b45309' },  // orange
      { x: 200, speed: 1.4, color1: '#a855f7', color2: '#6b21a8' },  // purple
    ],
  })
  const animRef  = useRef(null)
  const questions = useRef(shuffle(getAllQuestions()))
  const qIdx      = useRef(0)

  const [current,  setCurrent]  = useState(null)
  const [input,    setInput]    = useState('')
  const [feedback, setFeedback] = useState(null)
  const [started,  setStarted]  = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [score,    setScore]    = useState(0)
  const [turbo,    setTurbo]    = useState(false)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  const s = stateRef.current

  /* ── Draw ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, TRACK_W, TRACK_H)

    // Background
    const roadGrad = ctx.createLinearGradient(0, 0, 0, TRACK_H)
    roadGrad.addColorStop(0, '#0d1b2a')
    roadGrad.addColorStop(1, '#050d1a')
    ctx.fillStyle = roadGrad
    ctx.fillRect(0, 0, TRACK_W, TRACK_H)

    // Lane dividers
    ctx.strokeStyle = '#ffffff14'; ctx.lineWidth = 2
    ctx.setLineDash([24, 16])
    LANES.slice(0, -1).forEach((_, i) => {
      const y = LANE_H * (i + 1)
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TRACK_W, y); ctx.stroke()
    })
    ctx.setLineDash([])

    // Road edge lines
    ctx.strokeStyle = '#00D4FF33'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, 4);          ctx.lineTo(TRACK_W, 4);          ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, TRACK_H - 4); ctx.lineTo(TRACK_W, TRACK_H - 4); ctx.stroke()

    // Speed streaks (illusion)
    s.bgOffset = (s.bgOffset + s.speed) % 40
    ctx.strokeStyle = `rgba(255,255,255,${0.04 + s.speed * 0.01})`
    ctx.lineWidth = 1
    for (let x = -s.bgOffset; x < TRACK_W; x += 40) {
      LANES.forEach((ly) => {
        ctx.beginPath(); ctx.moveTo(x, ly - 20); ctx.lineTo(x + 20, ly - 20); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(x, ly + 20); ctx.lineTo(x + 20, ly + 20); ctx.stroke()
      })
    }

    // Dummy cars
    s.dummy.forEach((d, i) => {
      d.x = (d.x + d.speed) % (TRACK_W + 52)
      if (d.x < 0) d.x = TRACK_W
      drawCar(ctx, d.x, LANES[i + 1], d.color1, d.color2, false)
    })

    // Player car (top lane)
    drawCar(ctx, s.x, LANES[PLAYER_LANE], s.turbo ? '#FFD700' : '#00D4FF', s.turbo ? '#f59e0b' : '#0080ff', s.turbo)

    // Speed bar
    const speedPct = s.speed / s.maxSpeed
    ctx.fillStyle = `rgba(${s.turbo ? '255,215,0' : '0,212,255'},0.15)`
    ctx.fillRect(0, TRACK_H - 4, TRACK_W * speedPct, 4)
  }, [s])

  /* ── Animate ── */
  const animate = useCallback(() => {
    if (!s.running) return
    if (!s.turbo) s.speed = Math.max(0.5, s.speed * 0.97)
    s.x = Math.min(TRACK_W - 40, s.x + s.speed)
    if (s.x >= TRACK_W - 40) s.x = 40
    draw()
    animRef.current = requestAnimationFrame(animate)
  }, [s, draw])

  const nextQuestion = () => {
    if (qIdx.current >= questions.current.length) {
      questions.current = shuffle(getAllQuestions()); qIdx.current = 0
    }
    setCurrent(questions.current[qIdx.current++])
    setInput(''); setFeedback(null)
  }

  /* ── Start / End ── */
  const startGame = () => {
    s.x = 40; s.speed = 1; s.turbo = false; s.streakCorrect = 0; s.score = 0
    s.running = true; s.bgOffset = 0
    s.dummy[0].x = 120; s.dummy[0].speed = 1.8
    s.dummy[1].x = 200; s.dummy[1].speed = 1.4
    qIdx.current = 0
    questions.current = shuffle(getAllQuestions())
    setStarted(true); setFinished(false); setScore(0); setTurbo(false); setTimeLeft(60)
    nextQuestion()
    animRef.current = requestAnimationFrame(animate)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { endGame(); return 0 } return t - 1 })
    }, 1000)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const endGame = () => {
    s.running = false
    cancelAnimationFrame(animRef.current)
    clearInterval(timerRef.current)
    setFinished(true)
    onScore?.(s.score)
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!current || !input.trim()) return
    const clean = (v) => v.toLowerCase().replace(/\s+/g, '')
    const ok = clean(input) === clean(current.correctAnswer)
    if (ok) {
      s.streakCorrect++
      const gained = 10 + Math.floor(s.speed) * 2
      s.score += gained; setScore(s.score)
      setFeedback('correct')
      s.speed = Math.min(s.maxSpeed, s.speed + 1.2)
      // Boost dummy speed too (so player feels competitive)
      s.dummy.forEach((d) => { d.speed = Math.min(4, d.speed + 0.3) })
      if (s.streakCorrect >= 3) {
        s.turbo = true; setTurbo(true)
        s.speed = s.maxSpeed
        setTimeout(() => { s.turbo = false; setTurbo(false) }, 3000)
        s.streakCorrect = 0
      }
    } else {
      s.speed = Math.max(0.3, s.speed - 0.8)
      s.streakCorrect = 0
      setFeedback('wrong')
    }
    setTimeout(nextQuestion, ok ? 600 : 1200)
  }

  useEffect(() => () => { cancelAnimationFrame(animRef.current); clearInterval(timerRef.current) }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">
            🏎️ Speedrun
            {turbo && <span className="ml-2 text-gold animate-pulse text-sm">⚡ TURBO!</span>}
          </h2>
          <p className="text-slate-400 text-sm">
            Correct answers accelerate your car (top lane). 3-streak = Turbo!
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-gold font-bold text-2xl font-display">{score}</div>
            <div className="text-xs text-slate-400">Score</div>
          </div>
          <div>
            <div className={`font-bold text-2xl font-display ${timeLeft <= 10 ? 'text-coral' : 'text-white'}`}>
              {timeLeft}s
            </div>
            <div className="text-xs text-slate-400">Time</div>
          </div>
        </div>
      </div>

      {/* Lane labels */}
      {started && !finished && (
        <div className="flex text-xs text-slate-500 gap-1 -mb-2">
          <span className="text-cyan">▲ You</span>
          <span className="ml-auto">🟠 CPU 1 &nbsp; 🟣 CPU 2</span>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={TRACK_W}
        height={TRACK_H}
        className="w-full rounded-xl border border-white/8 speedrun-track"
        style={{ maxWidth: TRACK_W }}
      />

      {started && !finished && current && (
        <div className="glass p-5">
          <p className="text-white text-lg font-medium mb-4 font-mono">{current.question}</p>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your answer…"
              className={`flex-1 px-4 py-3 rounded-xl border font-mono text-base focus:outline-none transition ${
                feedback === 'correct' ? 'bg-mint/10 border-mint text-mint' :
                feedback === 'wrong'   ? 'bg-coral/10 border-coral text-white' :
                'bg-navy-700 border-white/10 text-white focus:border-cyan/50'
              }`}
              autoComplete="off"
            />
            <button type="submit" className="btn-primary px-6 py-3">→</button>
          </form>
          {feedback === 'wrong' && current && (
            <p className="text-xs text-slate-400 mt-2">
              Correct: <span className="math">{current.correctAnswer}</span>
            </p>
          )}
        </div>
      )}

      {!started && !finished && (
        <div className="text-center py-4">
          <button onClick={startGame} className="btn-primary py-3 px-10 text-base">🏁 Start Race</button>
          <p className="text-xs text-slate-500 mt-3">60 seconds · Race against 2 CPU cars!</p>
        </div>
      )}

      {finished && (
        <div className="glass p-6 text-center">
          <div className="text-4xl mb-3">🏁</div>
          <h3 className="text-xl font-display font-bold text-white mb-1">Race Complete!</h3>
          <p className="text-slate-400 mb-4">Final score: <span className="text-gold font-bold text-xl">{score}</span></p>
          <button onClick={startGame} className="btn-primary">Race Again</button>
        </div>
      )}
    </div>
  )
}
