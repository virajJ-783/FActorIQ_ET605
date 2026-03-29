import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore, { KC_META, KC_ORDER } from '../store/useStore'
import { selectQuestion, KC_THEORY } from '../utils/questionBank'
import { answersMatch, liveTransform, insertAtCursor, SUPERSCRIPT_BUTTONS } from '../utils/superscript'
import { adaptiveVolume, levelProgress, SIGNAL } from '../utils/behaviorEngine'

// ── Small pure sub-components ─────────────────────────────────────────────────

function ConfidenceSelector({ value, onChange }) {
  const opts = [
    { id: 'low',    label: '😟 Not sure',    cls: 'selected-low'    },
    { id: 'medium', label: '🤔 I think so',  cls: 'selected-medium' },
    { id: 'high',   label: '😎 Very sure',   cls: 'selected-high'   },
  ]
  return (
    <div className="mt-5">
      <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wider">
        How confident are you? (Required)
      </p>
      <div className="flex gap-2">
        {opts.map((o) => (
          <button key={o.id} type="button" onClick={() => onChange(o.id)}
            className={`conf-btn ${value === o.id ? o.cls : ''}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function HintBox({ hintText, level }) {
  return (
    <div className="hint-box animate-fade-up">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gold text-sm">💡</span>
        <span className="text-xs font-semibold text-gold/80 uppercase tracking-wider">Hint {level}</span>
      </div>
      <p>{hintText}</p>
    </div>
  )
}

function MisconceptionAlert({ result }) {
  if (!result?.detected) return null
  return (
    <div className="misc-alert animate-fade-up">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">🐛</span>
        <span className="text-xs font-semibold text-coral/80 uppercase tracking-wider">
          {result.bug_name || 'Misconception Detected'}
          {result.severity && <span className="ml-2 px-1.5 py-0.5 bg-coral/20 rounded text-[10px]">{result.severity}</span>}
        </span>
      </div>
      <p>{result.feedback}</p>
    </div>
  )
}

function RemediationCard({ type, kcId }) {
  const meta = KC_META[kcId]
  const map = {
    worked_example:     { title: '📖 Let\'s work through this together',   text: 'Watch the step-by-step approach before trying again.' },
    concept_explanation:{ title: '💡 Concept Review',                       text: 'Let\'s revisit the core idea before continuing.' },
    guided_practice:    { title: '🎯 Guided Practice',                      text: 'We\'ll solve the next question together, step by step.' },
  }
  const info = map[type] || map.concept_explanation
  return (
    <div className="remediation-card animate-fade-up">
      <h4 className="text-purple font-semibold text-sm mb-1">{info.title}</h4>
      <p className="text-slate-300 text-sm">{info.text}</p>
      <p className="text-slate-400 text-xs mt-2">Concept: <span className="kc-badge">{meta?.name}</span></p>
    </div>
  )
}

// ── Behavioral prompt banner ──────────────────────────────────────────────────

function BehaviorBanner({ signal, meta, onDismiss }) {
  if (!signal || signal === SIGNAL.NONE) return null

  const config = {
    [SIGNAL.RUSHING]:          { icon: '⚡', color: 'border-gold/40 bg-gold/8 text-gold',       title: 'Slow down a moment!' },
    [SIGNAL.OVERCONFIDENCE]:   { icon: '🔍', color: 'border-coral/40 bg-coral/8 text-coral',     title: 'Confident but incorrect' },
    [SIGNAL.LOW_CONF_CORRECT]: { icon: '✨', color: 'border-cyan/40 bg-cyan/8 text-cyan',        title: 'You got it — let\'s confirm!' },
    [SIGNAL.BOREDOM]:          { icon: '🚀', color: 'border-mint/40 bg-mint/8 text-mint',        title: 'Challenge mode!' },
    [SIGNAL.STRUGGLING]:       { icon: '🤝', color: 'border-purple/40 bg-purple/8 text-purple',  title: 'Let\'s try a different approach' },
  }

  const c = config[signal]
  if (!c || !meta?.message) return null

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm animate-fade-up mb-4 ${c.color}`}>
      <span className="text-xl flex-shrink-0">{c.icon}</span>
      <div className="flex-1">
        <p className="font-semibold mb-0.5">{c.title}</p>
        <p className="opacity-80 text-xs">{meta.message}</p>
      </div>
      <button onClick={onDismiss} className="opacity-50 hover:opacity-100 text-xs flex-shrink-0 mt-0.5">✕</button>
    </div>
  )
}

// ── Why This Question panel ───────────────────────────────────────────────────

function WhyThisQuestion({ why }) {
  const [open, setOpen] = useState(false)
  if (!why) return null
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-xs text-slate-500 hover:text-slate-300 transition flex items-center gap-1"
      >
        <span>{open ? '▾' : '▸'}</span> Why this question?
      </button>
      {open && (
        <div className="mt-2 px-3 py-2 rounded-lg bg-white/3 border border-white/8 text-xs text-slate-400 space-y-1 animate-fade-up">
          <p>📌 <span className="text-slate-300">{why.reason}</span></p>
          <p>📊 Current mastery: <span className="text-cyan font-mono">{why.masteryPct}%</span></p>
          <p>🎯 Pedagogical action: <span className="text-gold font-semibold">{why.action}</span></p>
        </div>
      )}
    </div>
  )
}

// ── Superscript input toolbar ─────────────────────────────────────────────────

function SuperscriptToolbar({ inputRef, setValue, visible }) {
  if (!visible) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2 mb-1">
      <span className="text-xs text-slate-500 self-center mr-1">Insert:</span>
      {SUPERSCRIPT_BUTTONS.map((btn) => (
        <button
          key={btn.label}
          type="button"
          title={btn.title}
          onClick={() => insertAtCursor(inputRef.current, btn.insert, setValue)}
          className="px-2.5 py-1 rounded-md bg-white/8 border border-white/12 text-slate-200
            text-sm font-mono hover:bg-cyan/15 hover:border-cyan/40 hover:text-cyan transition
            active:scale-95"
        >
          {btn.label}
        </button>
      ))}
      <span className="text-[10px] text-slate-600 self-center ml-1">or type x^2</span>
    </div>
  )
}

// ── XP Breakdown popup ────────────────────────────────────────────────────────

function XPFlash({ amount, breakdown }) {
  return (
    <div className="fixed top-20 right-8 z-50 pointer-events-none">
      <div className="text-gold font-display font-bold text-2xl xp-pop text-right">
        +{amount} XP ⚡
      </div>
      {breakdown?.length > 1 && (
        <div className="mt-1 space-y-0.5 text-right xp-pop" style={{ animationDelay: '0.1s' }}>
          {breakdown.map((b, i) => (
            <div key={i} className="text-xs text-gold/70 font-mono">+{b.amount} {b.label}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Level-up celebration ──────────────────────────────────────────────────────

function LevelUpBanner({ level, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="glass-bright p-10 text-center animate-fade-up max-w-sm">
        <div className="text-6xl mb-3">🎉</div>
        <h2 className="text-3xl font-display font-bold text-gold mb-1">Level Up!</h2>
        <p className="text-slate-300 text-lg">You reached <span className="text-cyan font-bold">Level {level}</span></p>
        <p className="text-slate-500 text-xs mt-3">Tap to continue</p>
      </div>
    </div>
  )
}

// ── Streak counter ─────────────────────────────────────────────────────────────

function StreakBadge({ streak }) {
  if (streak < 2) return null
  const color = streak >= 7 ? '#FF6B6B' : streak >= 5 ? '#FFD700' : '#00FFAA'
  return (
    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
      style={{ background: `${color}20`, border: `1px solid ${color}60`, color }}>
      🔥 {streak} streak
    </div>
  )
}

// ── Mini-game suggestion modal ────────────────────────────────────────────────

function MiniGameSuggestion({ onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-bright p-8 max-w-sm w-full text-center animate-fade-up">
        <div className="text-5xl mb-4">🎮</div>
        <h3 className="text-xl font-display font-bold text-white mb-2">You're on fire!</h3>
        <p className="text-slate-400 text-sm mb-6">
          You're answering really fast and correctly. Want to try a speed challenge or keep going?
        </p>
        <div className="flex gap-3">
          <button onClick={onDecline} className="btn-ghost flex-1">Keep Practising</button>
          <button onClick={onAccept}  className="btn-primary flex-1">🎮 Mini-Game!</button>
        </div>
      </div>
    </div>
  )
}

// ── XP/Level sidebar panel ────────────────────────────────────────────────────

function XPPanel({ localXP, localStreak, localLevel, snapshot }) {
  const { pct, inLevel, needed, isMaxLevel } = levelProgress(snapshot.totalXP)
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider">Session XP</span>
        <StreakBadge streak={localStreak} />
      </div>
      <div className="text-2xl font-display font-bold text-gold">+{localXP} XP</div>
      <div className="text-xs text-slate-500 mt-0.5">this session</div>

      {/* Level progress */}
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Level {localLevel}</span>
          {!isMaxLevel && <span className="text-slate-500">{inLevel}/{needed} XP</span>}
        </div>
        <div className="mastery-bar-track">
          <div className="mastery-bar-fill" style={{ width: `${pct * 100}%`, background: '#FFD700' }} />
        </div>
        {!isMaxLevel && (
          <p className="text-xs text-slate-600 mt-1">→ Level {localLevel + 1}</p>
        )}
      </div>
    </div>
  )
}

// ── Theory Panel ──────────────────────────────────────────────────────────────

function TheoryPanel({ kcId, onStartPractice }) {
  const theory = KC_THEORY[kcId]
  const meta   = KC_META[kcId]
  const [exampleIdx, setExampleIdx] = useState(0)

  if (!theory) {
    return (
      <div className="glass-bright p-6 text-center">
        <p className="text-slate-400">Loading concept…</p>
        <button onClick={onStartPractice} className="btn-primary mt-4">Start Practice →</button>
      </div>
    )
  }
  const examples = theory.workedExamples || []
  const ex = examples[exampleIdx]

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="glass-bright p-5 border-l-4" style={{ borderColor: meta?.color || '#00D4FF' }}>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{theory.subtopic}</p>
        <h2 className="text-xl font-display font-bold text-white mb-3">📚 {theory.conceptName}</h2>

        <div className="bg-white/3 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-cyan/80 uppercase tracking-wider mb-2">💡 Explanation</p>
          <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{theory.explanation}</pre>
        </div>

        {examples.length > 0 && (
          <div className="bg-white/3 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gold/80 uppercase tracking-wider">
                ✏️ Worked Example {exampleIdx + 1} of {examples.length}
              </p>
              {examples.length > 1 && (
                <div className="flex gap-2">
                  <button onClick={() => setExampleIdx(i => Math.max(0, i - 1))} disabled={exampleIdx === 0}
                    className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400 disabled:opacity-30">← Prev</button>
                  <button onClick={() => setExampleIdx(i => Math.min(examples.length - 1, i + 1))} disabled={exampleIdx === examples.length - 1}
                    className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400 disabled:opacity-30">Next →</button>
                </div>
              )}
            </div>
            <div className="bg-navy-800/50 rounded-lg p-3 mb-3">
              <p className="text-xs text-slate-400 mb-1">Problem:</p>
              <p className="text-white font-medium font-mono text-sm">{ex.problem}</p>
            </div>
            <div className="space-y-2">
              {ex.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-slate-300 text-sm font-mono">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-slate-400">Answer: </span>
              <span className="text-mint font-mono font-bold">{ex.answer}</span>
            </div>
          </div>
        )}
      </div>
      <button onClick={onStartPractice} className="btn-primary w-full py-3 text-base">
        ✅ I understand — Start Practice Questions →
      </button>
    </div>
  )
}

// ── Exit modal ────────────────────────────────────────────────────────────────

function ExitModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-display font-bold text-white mb-2">Exit Session?</h3>
        <p className="text-slate-400 text-sm mb-6">Your progress will be saved. You can continue later.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="btn-ghost flex-1">Keep Learning</button>
          <button onClick={onConfirm} className="flex-1 bg-coral/20 border border-coral/40 text-coral rounded-xl py-2.5 font-semibold hover:bg-coral/30 transition">Exit</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ChapterPage ──────────────────────────────────────────────────────────

export default function ChapterPage() {
  const navigate = useNavigate()

  // Store selectors
  const student                = useStore(s => s.student)
  const sessionId              = useStore(s => s.sessionId)
  const currentKC              = useStore(s => s.currentKC)
  const seenQuestionIds        = useStore(s => s.seenQuestionIds)
  const currentQuestion        = useStore(s => s.currentQuestion)
  const hintLevel              = useStore(s => s.hintLevel)
  const hintsUsedThisQuestion  = useStore(s => s.hintsUsedThisQuestion)
  const lastPedagogyResult     = useStore(s => s.lastPedagogyResult)
  const lastMisconceptionResult= useStore(s => s.lastMisconceptionResult)
  const xpFlash                = useStore(s => s.xpFlash)
  const lastXPBreakdown        = useStore(s => s.lastXPBreakdown)
  const leveledUp              = useStore(s => s.leveledUp)
  const localXP                = useStore(s => s.localXP)
  const localStreak            = useStore(s => s.localStreak)
  const localLevel             = useStore(s => s.localLevel)
  const lastBehaviorSignal     = useStore(s => s.lastBehaviorSignal)
  const behaviorSnapshot       = useStore(s => s.behaviorSnapshot)
  const suggestMiniGame        = useStore(s => s.suggestMiniGame)
  const whyThisQuestion        = useStore(s => s.whyThisQuestion)

  const startSession       = useStore(s => s.startSession)
  const endSession         = useStore(s => s.endSession)
  const setCurrentQuestion = useStore(s => s.setCurrentQuestion)
  const requestHint        = useStore(s => s.requestHint)
  const submitAnswer       = useStore(s => s.submitAnswer)
  const pingActive         = useStore(s => s.pingActive)
  const clearXpFlash       = useStore(s => s.clearXpFlash)
  const clearLevelUp       = useStore(s => s.clearLevelUp)
  const dismissMiniGame    = useStore(s => s.dismissMiniGame)

  // Local UI state
  const [studentInput,   setStudentInput]   = useState('')
  const [confidence,     setConfidence]     = useState('')
  const [submitted,      setSubmitted]      = useState(false)
  const [isCorrect,      setIsCorrect]      = useState(null)
  const [showExit,       setShowExit]       = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [showTheory,     setShowTheory]     = useState(true)
  const [theoryDoneKCs,  setTheoryDoneKCs]  = useState(new Set())
  const [signalDismissed,setSignalDismissed]= useState(false)

  const inputRef  = useRef(null)
  const prevKCRef = useRef(currentKC)
  const lastBugId = lastMisconceptionResult?.bug_id

  // Show theory again when KC changes
  useEffect(() => {
    if (prevKCRef.current !== currentKC) {
      prevKCRef.current = currentKC
      if (!theoryDoneKCs.has(currentKC)) setShowTheory(true)
    }
  }, [currentKC, theoryDoneKCs])

  // Reset signal dismissed state on new question
  useEffect(() => { setSignalDismissed(false) }, [currentQuestion?.id])

  const handleStartPractice = () => {
    setTheoryDoneKCs(prev => new Set([...prev, currentKC]))
    setShowTheory(false)
    if (!currentQuestion) loadNextQuestion()
  }

  // ── Load next question ────────────────────────────────────────────────────

  const loadNextQuestion = useCallback(() => {
    const baseDiff = lastPedagogyResult?.difficulty_level ?? 1
    const kcState  = (student?.kc_states || []).find(k => k.kc_id === currentKC)
    const mastery  = kcState?.mastery ?? 0.30

    // Adaptive volume override
    const { difficulty } = adaptiveVolume(mastery, baseDiff, behaviorSnapshot)

    const q = selectQuestion({
      kcId: currentKC,
      difficulty,
      seenIds: seenQuestionIds,
      lastBugId,
    })
    if (q) {
      setCurrentQuestion(q)
      setStudentInput('')
      setConfidence('')
      setSubmitted(false)
      setIsCorrect(null)
    }
  }, [currentKC, seenQuestionIds, lastBugId, lastPedagogyResult, behaviorSnapshot, student])

  // Init
  useEffect(() => { if (!sessionId) startSession() }, [])
  useEffect(() => { if (sessionId && !currentQuestion && !showTheory) loadNextQuestion() }, [sessionId])

  // Pings
  useEffect(() => {
    const interval = setInterval(pingActive, 5000)
    return () => clearInterval(interval)
  }, [])

  // XP flash auto-clear
  useEffect(() => {
    if (xpFlash) { const t = setTimeout(clearXpFlash, 2000); return () => clearTimeout(t) }
  }, [xpFlash])

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!studentInput.trim() || !confidence || !currentQuestion) return
    setLoading(true)

    // Use robust answer matching (tolerates superscript variants, factor order)
    const correct = answersMatch(studentInput.trim(), currentQuestion.correctAnswer)

    setIsCorrect(correct)
    setSubmitted(true)

    await submitAnswer({
      studentAnswer: studentInput.trim(),
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect:     correct,
      confidence,
    })
    setLoading(false)
  }

  const handleMCQSelect = (option) => { if (!submitted) setStudentInput(option) }

  // Live superscript conversion as user types
  const handleInputChange = (e) => {
    const transformed = liveTransform(e.target.value)
    setStudentInput(transformed)
  }

  // ── Progress calculations ─────────────────────────────────────────────────

  const kcStates        = student?.kc_states || []
  const conceptsCovered = KC_ORDER.filter(id => kcStates.find(k => k.kc_id === id)?.attempts > 0).length
  const progressPct     = Math.round((conceptsCovered / KC_ORDER.length) * 100)
  const meta            = KC_META[currentKC]
  const kcState         = kcStates.find(k => k.kc_id === currentKC)
  const mastery         = kcState?.mastery ?? 0.30
  const pctMastery      = Math.round(mastery * 100)

  const handleExit = async () => { await endSession('exited_midway'); navigate('/dashboard') }

  const handleMiniGameAccept = () => { dismissMiniGame(); navigate('/games') }

  // Active signal (only show until dismissed)
  const activeSignal = !signalDismissed && submitted
    ? lastBehaviorSignal
    : { signal: SIGNAL.NONE, meta: {} }

  return (
    <div className="min-h-screen p-4 md:p-8 page-enter" onClick={pingActive}>

      {/* Overlays */}
      {xpFlash     && <XPFlash amount={xpFlash.amount} breakdown={lastXPBreakdown} />}
      {leveledUp   && <LevelUpBanner level={localLevel} onClose={clearLevelUp} />}
      {showExit    && <ExitModal onConfirm={handleExit} onCancel={() => setShowExit(false)} />}
      {suggestMiniGame && <MiniGameSuggestion onAccept={handleMiniGameAccept} onDecline={dismissMiniGame} />}

      <div className="max-w-5xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm py-2">← Dashboard</button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: meta?.color || '#00D4FF' }}>
              📖 {meta?.name}
            </span>
          </div>
          <button onClick={() => setShowExit(true)} className="text-slate-500 hover:text-coral text-sm transition">Exit Session</button>
        </div>

        {/* Concept banner */}
        <div className="glass mb-4 px-5 py-3 flex items-center gap-3 border border-white/5">
          <span className="text-xs text-slate-400 uppercase tracking-wider">You are learning:</span>
          <span className="text-white font-semibold">{meta?.name}</span>
          <span className="text-xs text-slate-500 ml-auto">{meta?.subtopic}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Progress (concepts covered) */}
            <div className="glass p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Progress</h3>
              <div className="text-xl font-display font-bold text-cyan">{progressPct}%</div>
              <div className="mastery-bar-track mt-1">
                <div className="mastery-bar-fill" style={{ width: `${progressPct}%`, background: '#00D4FF' }} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{conceptsCovered}/{KC_ORDER.length} concepts covered</p>
            </div>

            {/* Mastery (BKT) */}
            <div className="glass p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mastery</h3>
              <div className="text-2xl font-display font-bold" style={{ color: meta?.color }}>{pctMastery}%</div>
              <div className="mastery-bar-track mt-2">
                <div className="mastery-bar-fill" style={{ width: `${pctMastery}%`, background: meta?.color }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span><span className="text-gold">85% target</span><span>100%</span>
              </div>
            </div>

            {/* XP + Streak panel */}
            <XPPanel localXP={localXP} localStreak={localStreak} localLevel={localLevel} snapshot={behaviorSnapshot} />

            {/* Learning path */}
            <div className="glass p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Learning Path</h3>
              {KC_ORDER.map((kcId, i) => {
                const s    = kcStates.find(k => k.kc_id === kcId)
                const done = (s?.mastery ?? 0) >= 0.85
                const active = kcId === currentKC
                return (
                  <div key={kcId} className={`flex items-center gap-2 text-xs transition ${active ? 'text-cyan' : done ? 'text-mint' : 'text-slate-500'}`}>
                    <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ borderColor: active ? '#00D4FF' : done ? '#00FFAA' : '#334155' }}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span className="truncate">{KC_META[kcId].name}</span>
                    {active && <span className="ml-auto">←</span>}
                  </div>
                )
              })}
            </div>

          </div>

          {/* ── Right: Theory / Question ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {showTheory ? (
              <TheoryPanel kcId={currentKC} onStartPractice={handleStartPractice} />
            ) : !currentQuestion ? (
              <div className="min-h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-pulse-slow">🧮</div>
                  <p className="text-slate-400">Loading your personalised question…</p>
                </div>
              </div>
            ) : (
              <>
                {/* Behavioral signal banner */}
                <BehaviorBanner
                  signal={activeSignal.signal}
                  meta={activeSignal.meta}
                  onDismiss={() => setSignalDismissed(true)}
                />

                {/* Difficulty / concept label */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-xs text-slate-500 uppercase tracking-wider">
                    {meta?.name} · Difficulty {currentQuestion.difficulty}/3
                  </span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Question card */}
                <div className="glass-bright p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">
                      {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
                    </p>
                    <StreakBadge streak={localStreak} />
                  </div>

                  <p className="text-white text-xl font-medium leading-relaxed mb-4">
                    {currentQuestion.question}
                  </p>

                  {/* Answer format guide */}
                  {currentQuestion.answerFormat && (
                    <div className="bg-gold/5 border border-gold/20 rounded-lg px-4 py-2 mb-4">
                      <span className="text-xs text-gold/70 font-semibold uppercase tracking-wider">Answer format: </span>
                      <span className="text-gold/90 text-sm font-mono">{currentQuestion.answerFormat}</span>
                    </div>
                  )}

                  {/* MCQ */}
                  {currentQuestion.type === 'mcq' && (
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      {currentQuestion.options.map((opt, idx) => {
                        const isSelected = studentInput === opt
                        const isRight    = submitted && opt === currentQuestion.correctAnswer
                        const isWrong    = submitted && isSelected && !isRight
                        return (
                          <button key={idx} onClick={() => handleMCQSelect(opt)}
                            className={`text-left px-4 py-3 rounded-xl border text-sm transition font-mono ${
                              isRight    ? 'border-mint bg-mint/10 text-mint'   :
                              isWrong    ? 'border-coral bg-coral/10 text-coral' :
                              isSelected ? 'border-cyan bg-cyan/10 text-white'   :
                              'border-white/10 bg-white/3 text-slate-300 hover:border-cyan/40 hover:bg-cyan/5'
                            }`}>
                            <span className="mr-3 text-slate-500">{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Fill input with superscript toolbar */}
                  {currentQuestion.type === 'fill' && (
                    <div className="mb-4">
                      <SuperscriptToolbar
                        inputRef={inputRef}
                        setValue={setStudentInput}
                        visible={!submitted}
                      />
                      <input
                        ref={inputRef}
                        value={studentInput}
                        onChange={handleInputChange}
                        onKeyDown={e => e.key === 'Enter' && !submitted && confidence && handleSubmit()}
                        disabled={submitted}
                        placeholder="Type your answer…"
                        className={`w-full px-4 py-3 rounded-xl border font-mono text-lg focus:outline-none transition ${
                          !submitted
                            ? 'bg-navy-700 border-white/10 text-white placeholder-slate-500 focus:border-cyan/50 focus:ring-1 focus:ring-cyan/30'
                            : isCorrect
                              ? 'bg-mint/10 border-mint text-mint'
                              : 'bg-coral/10 border-coral text-white'
                        }`}
                      />
                      {submitted && (
                        <p className="text-xs mt-2 text-slate-400">
                          Correct answer: <span className="font-mono text-mint">{currentQuestion.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Confidence selector */}
                  {!submitted && <ConfidenceSelector value={confidence} onChange={setConfidence} />}

                  {/* Hints */}
                  {hintLevel > 0 && currentQuestion.hints[hintLevel - 1] && (
                    <div className="mt-4 space-y-2">
                      {Array.from({ length: hintLevel }, (_, i) => (
                        <HintBox key={i} level={i + 1} hintText={currentQuestion.hints[i]} />
                      ))}
                    </div>
                  )}

                  {/* Result feedback */}
                  {submitted && (
                    <div className={`mt-4 p-4 rounded-xl border text-sm animate-fade-up ${
                      isCorrect
                        ? 'bg-mint/8 border-mint/30 text-mint'
                        : 'bg-coral/8 border-coral/30 text-coral'
                    }`}>
                      <div className="font-semibold text-base mb-1">
                        {isCorrect ? '✅ Correct! Well done!' : '❌ Not quite right'}
                      </div>
                      {lastPedagogyResult && (
                        <div className="text-xs opacity-70 mt-1">
                          {lastPedagogyResult.action === 'advance'
                            ? '🚀 You\'re ready for the next concept!'
                            : lastPedagogyResult.action === 'remediate'
                              ? '📖 Let\'s review before continuing.'
                              : '📝 Keep practising to build mastery.'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Misconception */}
                  {submitted && !isCorrect && (
                    <div className="mt-3"><MisconceptionAlert result={lastMisconceptionResult} /></div>
                  )}

                  {/* Remediation */}
                  {submitted && lastPedagogyResult?.show_remediation && (
                    <div className="mt-3">
                      <RemediationCard type={lastPedagogyResult.remediation_type} kcId={currentKC} />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-6 flex-wrap">
                    {!submitted ? (
                      <>
                        {hintLevel < 3 && (
                          <button onClick={requestHint} className="btn-ghost text-sm py-2.5">
                            💡 Hint ({hintLevel}/3)
                          </button>
                        )}
                        <button
                          onClick={handleSubmit}
                          disabled={!studentInput.trim() || !confidence || loading}
                          className="btn-primary flex-1 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Checking…' : 'Submit Answer →'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setShowTheory(true)} className="btn-ghost text-sm py-2">
                          📖 Review Theory
                        </button>
                        <button onClick={loadNextQuestion} className="btn-primary flex-1 py-2.5">
                          {lastPedagogyResult?.action === 'advance' ? '🚀 Next Concept →' : 'Next Question →'}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Why this question? */}
                  <WhyThisQuestion why={whyThisQuestion} />
                </div>

                {/* Indian context */}
                <div className="glass p-4 border border-gold/10">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🇮🇳</span>
                    <div>
                      <p className="text-xs font-semibold text-gold/70 uppercase tracking-wider mb-1">Real-world Context</p>
                      <p className="text-slate-400 text-sm">
                        {currentKC === 'KC-04' && 'Meena is buying tiles for her verandah. She needs to find the HCF to group them into equal packets — just like factorising a polynomial!'}
                        {currentKC === 'KC-05' && 'Rohit is packing Diwali gift boxes and groups items by type — just like regrouping algebraic terms to find hidden common factors.'}
                        {currentKC === 'KC-06' && 'Anika is designing a square rangoli for Navratri. Its area is a perfect square expression — exactly what algebraic identity factorisation is about.'}
                        {currentKC === 'KC-08' && 'A rectangular field near a village pond has an area described by a quadratic expression. Factorising it gives us the dimensions of the field.'}
                        {!['KC-04','KC-05','KC-06','KC-08'].includes(currentKC) && 'Every algebraic expression is like a puzzle. Breaking it into factors is like discovering its hidden structure — used in coding, physics, and commerce every day.'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
