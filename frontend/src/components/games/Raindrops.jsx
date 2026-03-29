import { useState, useEffect, useRef, useCallback } from 'react'
import { getAllQuestions } from '../../utils/questionBank'

const CANVAS_W         = 600
const CANVAS_H         = 380
const FALL_INTERVAL_MS = 60
const DROP_W           = 130
const DROP_H           = 44

function randomColor() {
  const colors = ['#00D4FF', '#00FFAA', '#8B5CF6', '#FFD700', '#FF6B6B']
  return colors[Math.floor(Math.random() * colors.length)]
}

/** Pick an X that avoids overlapping existing drops */
function safeX(existingDrops) {
  const MARGIN = DROP_W + 16
  for (let i = 0; i < 20; i++) {
    const x = DROP_W / 2 + 20 + Math.random() * (CANVAS_W - DROP_W - 40)
    if (existingDrops.every((d) => Math.abs(d.x - x) >= MARGIN)) return x
  }
  // Fallback: divide canvas into 4 equal columns
  return DROP_W / 2 + 20 + (existingDrops.length % 4) * ((CANVAS_W - DROP_W - 40) / 3)
}

export default function Raindrops({ onScore }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({
    drops: [], score: 0, lives: 3,
    running: false, spawnTimer: null, fallTimer: null,
    currentQ: null, difficulty: 1, streakCorrect: 0,
  })
  const stopGameRef = useRef(null)

  const [score,    setScore]    = useState(0)
  const [lives,    setLives]    = useState(3)
  const [started,  setStarted]  = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [currentQ, setCurrentQ] = useState(null)

  const s = stateRef.current

  /* ── Draw ── */
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H)
    bg.addColorStop(0, '#050d1a')
    bg.addColorStop(1, '#0B1120')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Ground line
    ctx.strokeStyle = '#FF6B6B44'; ctx.lineWidth = 2
    ctx.setLineDash([8, 6])
    ctx.beginPath(); ctx.moveTo(0, CANVAS_H - 40); ctx.lineTo(CANVAS_W, CANVAS_H - 40); ctx.stroke()
    ctx.setLineDash([])

    // Option drops
    s.drops.forEach((drop) => {
      const rx = DROP_H / 2
      ctx.beginPath()
      ctx.roundRect(drop.x - DROP_W / 2, drop.y - DROP_H / 2, DROP_W, DROP_H, rx)
      ctx.fillStyle = `${drop.color}22`
      ctx.fill()
      ctx.strokeStyle = drop.color; ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.font = 'bold 13px JetBrains Mono, monospace'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      let label = drop.text
      if (ctx.measureText(label).width > DROP_W - 16) {
        while (ctx.measureText(label + '…').width > DROP_W - 16 && label.length > 0)
          label = label.slice(0, -1)
        label += '…'
      }
      ctx.fillText(label, drop.x, drop.y)

      const pct = drop.y / (CANVAS_H - 40)
      if (pct > 0.6) {
        const barW = DROP_W - 12
        ctx.fillStyle = `rgba(255,107,107,${(pct - 0.6) * 2.5})`
        ctx.fillRect(drop.x - barW / 2, drop.y + DROP_H / 2 + 4, barW * pct, 3)
      }
    })

    // Lives
    for (let i = 0; i < 3; i++) {
      ctx.font = '18px sans-serif'
      ctx.fillText(i < s.lives ? '❤️' : '🖤', 14 + i * 26, 20)
    }
  }, [s])

  /* ── Spawn one question's options ── */
  const spawnQuestion = useCallback(() => {
    const qs = getAllQuestions().filter(
      (q) => q.difficulty <= s.difficulty && Array.isArray(q.options) && q.options.length >= 2
    )
    if (!qs.length) return
    const q = qs[Math.floor(Math.random() * qs.length)]
    s.currentQ = q
    setCurrentQ(q)
    s.drops = []
    const speed = 0.35 + s.difficulty * 0.10
    q.options.forEach((opt) => {
      s.drops.push({ id: Math.random().toString(36).slice(2), text: opt, x: safeX(s.drops), y: -DROP_H, speed, color: randomColor() })
    })
  }, [s])

  /* ── Tick ── */
  const tick = useCallback(() => {
    s.drops.forEach((d) => { d.y += d.speed })
    const hitGround = s.drops.some((d) => d.y >= CANVAS_H - 40)
    if (hitGround) {
      s.lives = Math.max(0, s.lives - 1)
      setLives(s.lives)
      s.streakCorrect = 0
      s.drops = []; s.currentQ = null; setCurrentQ(null)
      if (s.lives <= 0) { stopGameRef.current?.(); setGameOver(true) }
      else setTimeout(() => { if (s.running) spawnQuestion() }, 800)
    }
    draw()
  }, [s, draw, spawnQuestion])

  /* ── Click handler ── */
  const handleCanvasClick = useCallback((e) => {
    if (!s.running || !s.currentQ) return
    const rect = canvasRef.current.getBoundingClientRect()
    const cx = (e.clientX - rect.left) * (CANVAS_W / rect.width)
    const cy = (e.clientY - rect.top)  * (CANVAS_H / rect.height)
    const hit = s.drops.find(
      (d) => cx >= d.x - DROP_W / 2 && cx <= d.x + DROP_W / 2 && cy >= d.y - DROP_H / 2 && cy <= d.y + DROP_H / 2
    )
    if (!hit) return
    if (hit.text === s.currentQ.correctAnswer) {
      s.score += 10 + s.difficulty * 5; setScore(s.score)
      s.streakCorrect++
      if (s.streakCorrect >= 3) { s.difficulty = Math.min(3, s.difficulty + 1); s.streakCorrect = 0 }
      s.drops = []; s.currentQ = null; setCurrentQ(null)
      setTimeout(() => { if (s.running) spawnQuestion() }, 400)
    } else {
      hit.color = '#FF6B6B'
      s.lives = Math.max(0, s.lives - 1); setLives(s.lives)
      s.streakCorrect = 0
      if (s.lives <= 0) { stopGameRef.current?.(); setGameOver(true) }
    }
  }, [s, spawnQuestion])

  /* ── Start / Stop ── */
  const stopGame = useCallback(() => {
    s.running = false
    clearInterval(s.spawnTimer); clearInterval(s.fallTimer)
    onScore?.(s.score)
  }, [s, onScore])

  useEffect(() => { stopGameRef.current = stopGame }, [stopGame])
  useEffect(() => () => stopGame(), [])

  const startGame = () => {
    s.drops = []; s.score = 0; s.lives = 3; s.running = true
    s.streakCorrect = 0; s.difficulty = 1; s.currentQ = null
    setScore(0); setLives(3); setStarted(true); setGameOver(false); setCurrentQ(null)
    spawnQuestion()
    s.fallTimer  = setInterval(tick, FALL_INTERVAL_MS)
    s.spawnTimer = setInterval(() => { if (s.drops.length === 0 && !s.currentQ) spawnQuestion() }, 3200)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-white">☔ Raindrops</h2>
          <p className="text-slate-400 text-sm">Tap the correct falling option before it hits the ground!</p>
        </div>
        <div className="text-right">
          <div className="text-gold font-bold text-2xl font-display">{score}</div>
          <div className="text-xs text-slate-400">Score</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full rounded-xl raindrop-canvas border border-white/8 cursor-pointer"
        style={{ maxWidth: CANVAS_W }}
        onClick={handleCanvasClick}
      />

      {/* Question shown below canvas */}
      {started && !gameOver && (
        <div className="glass p-4 min-h-[60px] flex items-center justify-center">
          {currentQ
            ? <p className="text-white text-base font-medium font-mono text-center">{currentQ.question}</p>
            : <p className="text-slate-500 text-sm text-center">Get ready…</p>
          }
        </div>
      )}

      {!started && !gameOver && (
        <div className="text-center">
          <button onClick={startGame} className="btn-primary py-3 px-10 text-base">▶ Start Raindrops</button>
          <p className="text-xs text-slate-500 mt-3">Difficulty increases with your streak!</p>
        </div>
      )}

      {gameOver && (
        <div className="glass p-6 text-center">
          <div className="text-4xl mb-3">🌊</div>
          <h3 className="text-xl font-display font-bold text-white mb-1">Game Over!</h3>
          <p className="text-slate-400 mb-4">Final score: <span className="text-gold font-bold text-xl">{score}</span></p>
          <button onClick={startGame} className="btn-primary">Play Again</button>
        </div>
      )}
    </div>
  )
}
