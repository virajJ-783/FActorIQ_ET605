/**
 * behaviorEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure behavioral intelligence layer.
 * All functions are stateless — they receive a BehaviorSnapshot and return
 * a BehaviorSignal. The store holds the snapshot; ChapterPage acts on signals.
 *
 * Signals are consumed by ChapterPage to:
 *  • show contextual prompts
 *  • escalate/reduce difficulty
 *  • trigger mini-games
 *  • display reflective feedback
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Thresholds (tuned for Class 8 factorisation) ─────────────────────────────

export const THRESHOLDS = {
  // Rushing: answered faster than this fraction of t_min
  RUSH_RATIO: 0.55,           // response_time < 0.55 * t_min → rushing
  RUSH_STREAK: 3,             // ≥3 consecutive fast-correct → boredom/rushing

  // Overconfidence: high conf + wrong
  // (detected purely from confidence + isCorrect)

  // Boredom: fast + correct + no hints, ≥ this many in a row
  BOREDOM_STREAK: 4,

  // Mastery escalation: mastery above this → push harder questions
  HIGH_MASTERY_PUSH: 0.72,

  // Mastery reduction: mastery below this → add scaffolding
  LOW_MASTERY_SCAFFOLD: 0.45,

  // XP values
  XP_CORRECT:      10,
  XP_CORRECT_FAST: 5,   // bonus for under t_min (not rushing)
  XP_NO_HINTS:     8,
  XP_WRONG:        0,
  XP_STREAK_3:     15,  // streak bonus at every 3rd correct
  XP_STREAK_5:     25,

  // Levels (cumulative XP thresholds)
  LEVEL_THRESHOLDS: [0, 50, 130, 250, 420, 650, 950, 1350, 1900, 2600],
}

// ── Signal types ──────────────────────────────────────────────────────────────

export const SIGNAL = {
  NONE:              'none',
  RUSHING:           'rushing',           // fast but we're not sure they understood
  OVERCONFIDENCE:    'overconfidence',    // wrong + high confidence
  LOW_CONF_CORRECT:  'low_conf_correct',  // correct + low confidence (lucky?)
  BOREDOM:           'boredom',           // bored — too easy, needs challenge
  STRUGGLING:        'struggling',        // many wrong answers
}

/**
 * BehaviorSnapshot — all data needed to compute signals.
 * Maintained in the Zustand store as `behaviorSnapshot`.
 *
 * {
 *   consecutiveFastCorrect: number,   // reset on wrong or slow answer
 *   consecutiveCorrect:     number,   // reset on wrong answer
 *   consecutiveWrong:       number,   // reset on correct answer
 *   recentResponseTimes:    number[], // last 5 response times (seconds)
 *   recentHintsUsed:        number[], // hints used per last 5 questions
 *   lastConfidence:         string,   // 'low'|'medium'|'high'
 *   currentStreak:          number,   // unbroken correct streak (for XP)
 *   totalXP:                number,
 *   level:                  number,
 * }
 */

// ── Core signal detector ──────────────────────────────────────────────────────

/**
 * Analyse a single answer event and return a BehaviorSignal.
 *
 * @param {object} params
 * @param {boolean} params.isCorrect
 * @param {string}  params.confidence  'low'|'medium'|'high'
 * @param {number}  params.responseTime  seconds
 * @param {number}  params.tMin  question's minimum expected time
 * @param {number}  params.hintsUsed
 * @param {object}  params.snapshot  current BehaviorSnapshot
 * @returns {{ signal: string, meta: object }}
 */
export function detectSignal({ isCorrect, confidence, responseTime, tMin, hintsUsed, snapshot }) {
  const isRush = responseTime < tMin * THRESHOLDS.RUSH_RATIO

  // Priority 1 — Overconfidence (highest priority for misconception repair)
  if (!isCorrect && confidence === 'high') {
    return {
      signal: SIGNAL.OVERCONFIDENCE,
      meta: {
        message: "You answered with high confidence but that's not quite right — let's find the misconception.",
        difficultyAdjust: 0,       // stay at same difficulty for targeted repair
        suggestMiniGame: false,
      },
    }
  }

  // Priority 2 — Boredom (fast + correct + no hints, repeated)
  const newFastStreak = isCorrect && isRush && hintsUsed === 0
    ? snapshot.consecutiveFastCorrect + 1
    : 0

  if (newFastStreak >= THRESHOLDS.BOREDOM_STREAK || snapshot.consecutiveFastCorrect >= THRESHOLDS.BOREDOM_STREAK) {
    return {
      signal: SIGNAL.BOREDOM,
      meta: {
        message: "You're flying through these! Ready for a bigger challenge?",
        difficultyAdjust: +1,
        suggestMiniGame: true,
      },
    }
  }

  // Priority 3 — Rushing (fast but not yet boredom-level; only on correct)
  if (isCorrect && isRush && snapshot.consecutiveFastCorrect >= THRESHOLDS.RUSH_STREAK - 1) {
    return {
      signal: SIGNAL.RUSHING,
      meta: {
        message: "That was really fast! Make sure you're working through each step carefully.",
        difficultyAdjust: 0,
        suggestMiniGame: false,
      },
    }
  }

  // Priority 4 — Low confidence but correct (potential lucky guess)
  if (isCorrect && confidence === 'low') {
    return {
      signal: SIGNAL.LOW_CONF_CORRECT,
      meta: {
        message: "You got it right! Let's do one more to make sure you've got the hang of it.",
        difficultyAdjust: 0,
        suggestMiniGame: false,
      },
    }
  }

  // Priority 5 — Struggling (multiple consecutive wrong)
  if (!isCorrect && snapshot.consecutiveWrong >= 1) {
    return {
      signal: SIGNAL.STRUGGLING,
      meta: {
        message: null,      // pedagogical engine handles this via remediation
        difficultyAdjust: -1,
        suggestMiniGame: false,
      },
    }
  }

  return { signal: SIGNAL.NONE, meta: { difficultyAdjust: 0, suggestMiniGame: false } }
}

// ── Snapshot updater (pure — returns new snapshot) ────────────────────────────

/**
 * Return an updated BehaviorSnapshot after one answer event.
 * Call this in the store's submitAnswer action.
 */
export function updateSnapshot(snapshot, { isCorrect, responseTime, tMin, hintsUsed, confidence }) {
  const isRush = responseTime < tMin * THRESHOLDS.RUSH_RATIO

  const consecutiveCorrect    = isCorrect ? snapshot.consecutiveCorrect + 1 : 0
  const consecutiveWrong      = isCorrect ? 0 : snapshot.consecutiveWrong + 1
  const consecutiveFastCorrect = (isCorrect && isRush && hintsUsed === 0)
    ? snapshot.consecutiveFastCorrect + 1
    : 0

  const currentStreak = isCorrect ? snapshot.currentStreak + 1 : 0

  const recentResponseTimes = [...snapshot.recentResponseTimes.slice(-4), responseTime]
  const recentHintsUsed     = [...snapshot.recentHintsUsed.slice(-4), hintsUsed]

  return {
    ...snapshot,
    consecutiveCorrect,
    consecutiveWrong,
    consecutiveFastCorrect,
    currentStreak,
    recentResponseTimes,
    recentHintsUsed,
    lastConfidence: confidence,
  }
}

// ── XP calculator ─────────────────────────────────────────────────────────────

/**
 * Calculate XP earned for a single answer event.
 * Returns { xpEarned, breakdown, newTotal, newLevel, leveledUp }
 */
export function calculateXP(snapshot, { isCorrect, hintsUsed, responseTime, tMin }) {
  if (!isCorrect) return { xpEarned: 0, breakdown: [], newTotal: snapshot.totalXP, newLevel: snapshot.level, leveledUp: false }

  const parts = []
  let xp = 0

  // Base correct
  xp += THRESHOLDS.XP_CORRECT
  parts.push({ label: 'Correct answer', amount: THRESHOLDS.XP_CORRECT })

  // No hints bonus
  if (hintsUsed === 0) {
    xp += THRESHOLDS.XP_NO_HINTS
    parts.push({ label: 'No hints used', amount: THRESHOLDS.XP_NO_HINTS })
  }

  // Streak bonuses
  const newStreak = snapshot.currentStreak + 1
  if (newStreak > 0 && newStreak % 5 === 0) {
    xp += THRESHOLDS.XP_STREAK_5
    parts.push({ label: `${newStreak}-answer streak!`, amount: THRESHOLDS.XP_STREAK_5 })
  } else if (newStreak > 0 && newStreak % 3 === 0) {
    xp += THRESHOLDS.XP_STREAK_3
    parts.push({ label: `${newStreak}-streak bonus`, amount: THRESHOLDS.XP_STREAK_3 })
  }

  const newTotal = snapshot.totalXP + xp
  const oldLevel = snapshot.level
  const newLevel = computeLevel(newTotal)
  const leveledUp = newLevel > oldLevel

  return { xpEarned: xp, breakdown: parts, newTotal, newLevel, leveledUp }
}

/**
 * Compute level from total XP using threshold table.
 */
export function computeLevel(totalXP) {
  const thr = THRESHOLDS.LEVEL_THRESHOLDS
  let level = 1
  for (let i = thr.length - 1; i >= 0; i--) {
    if (totalXP >= thr[i]) { level = i + 1; break }
  }
  return Math.min(level, thr.length)
}

/**
 * XP needed to reach next level, and current progress within level.
 */
export function levelProgress(totalXP) {
  const thr = THRESHOLDS.LEVEL_THRESHOLDS
  const level = computeLevel(totalXP)
  const currentFloor = thr[level - 1] ?? 0
  const nextCeiling  = thr[level] ?? thr[thr.length - 1]
  const inLevel = totalXP - currentFloor
  const needed  = nextCeiling - currentFloor
  return {
    level,
    inLevel,
    needed,
    pct: needed > 0 ? Math.min(1, inLevel / needed) : 1,
    isMaxLevel: level >= thr.length,
  }
}

// ── Adaptive volume logic ─────────────────────────────────────────────────────

/**
 * Returns adjusted difficulty level and scaffolding flag based on mastery + behavior.
 * Overrides the basic pedagogical engine output for finer control.
 *
 * @param {number} mastery  0–1
 * @param {number} baseDifficulty  1|2|3 from pedagogical engine
 * @param {object} snapshot
 * @returns {{ difficulty: number, addScaffolding: boolean, reduceEasy: boolean }}
 */
export function adaptiveVolume(mastery, baseDifficulty, snapshot) {
  let difficulty = baseDifficulty

  // High mastery + consistent correct → push harder
  if (mastery >= THRESHOLDS.HIGH_MASTERY_PUSH && snapshot.consecutiveCorrect >= 3) {
    difficulty = Math.min(3, difficulty + 1)
    return { difficulty, addScaffolding: false, reduceEasy: true }
  }

  // Struggling → pull easier + add scaffolding
  if (mastery < THRESHOLDS.LOW_MASTERY_SCAFFOLD || snapshot.consecutiveWrong >= 2) {
    difficulty = Math.max(1, difficulty - 1)
    return { difficulty, addScaffolding: true, reduceEasy: false }
  }

  return { difficulty, addScaffolding: false, reduceEasy: false }
}

// ── Default snapshot ──────────────────────────────────────────────────────────

export const DEFAULT_SNAPSHOT = {
  consecutiveFastCorrect: 0,
  consecutiveCorrect:     0,
  consecutiveWrong:       0,
  recentResponseTimes:    [],
  recentHintsUsed:        [],
  lastConfidence:         'medium',
  currentStreak:          0,
  totalXP:                0,
  level:                  1,
}
