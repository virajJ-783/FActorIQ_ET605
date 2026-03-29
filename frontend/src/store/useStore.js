import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'
import {
  detectSignal,
  updateSnapshot,
  calculateXP,
  computeLevel,
  DEFAULT_SNAPSHOT,
  SIGNAL,
} from '../utils/behaviorEngine'

// KC metadata (matches backend KC_ORDER)
export const KC_META = {
  'KC-01': { name: 'Identify Algebraic Terms',         subtopic: 'Algebraic Basics',   color: '#00D4FF' },
  'KC-02': { name: 'Detect Common Factors',             subtopic: 'Algebraic Basics',   color: '#00D4FF' },
  'KC-03': { name: 'Apply Distributive Law',            subtopic: 'Algebraic Basics',   color: '#00D4FF' },
  'KC-04': { name: 'Common Factor Method',              subtopic: 'Common Factor',      color: '#00FFAA' },
  'KC-05': { name: 'Factorisation by Regrouping',       subtopic: 'Regrouping',         color: '#FFD700' },
  'KC-06': { name: 'Recognise Algebraic Identities',    subtopic: 'Identities',         color: '#FF6B6B' },
  'KC-07': { name: 'Apply Identities for Factorisation',subtopic: 'Identities',         color: '#FF6B6B' },
  'KC-08': { name: 'Factorise Quadratic Expressions',   subtopic: 'Quadratic',          color: '#8B5CF6' },
  'KC-09': { name: 'Factorisation for Division',        subtopic: 'Division',           color: '#F97316' },
}

export const KC_ORDER = ['KC-01','KC-02','KC-03','KC-04','KC-05','KC-06','KC-07','KC-08','KC-09']

const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──────────────────────────────────────────────────────────────
      student:    null,
      isLoggedIn: false,

      // ── Session ──────────────────────────────────────────────────────────
      sessionId:         null,
      sessionStartTime:  null,
      activeTimeSeconds: 0,
      lastActiveAt:      null,
      idleThreshold:     120,
      isIdle:            false,

      // ── Learning state ───────────────────────────────────────────────────
      currentKC:            'KC-01',
      seenQuestionIds:      [],
      currentQuestion:      null,
      hintLevel:            0,
      hintsUsedThisQuestion: 0,
      retriesThisQuestion:  0,
      questionStartTime:    null,

      // ── Backend results ───────────────────────────────────────────────────
      lastBktResult:           null,
      lastPedagogyResult:      null,
      lastMisconceptionResult: null,

      // ── Behavioral intelligence ───────────────────────────────────────────
      // Pure client-side snapshot; never sent to backend as-is
      behaviorSnapshot: { ...DEFAULT_SNAPSHOT },

      // The signal from the most recent answer (used by ChapterPage for prompts)
      lastBehaviorSignal: { signal: SIGNAL.NONE, meta: {} },

      // Whether to suggest mini-game (set true by BOREDOM signal)
      suggestMiniGame: false,

      // ── Local gamification (augments backend) ────────────────────────────
      // These are computed locally for instant feedback; backend is source of truth
      localXP:          0,      // running session XP (reset on login)
      localStreak:      0,      // current correct streak
      localLevel:       1,
      lastXPBreakdown:  [],     // [{label, amount}] for the XP popup detail
      leveledUp:        false,  // flag for level-up celebration

      // ── UI state ─────────────────────────────────────────────────────────
      xpFlash:  null,           // { amount, timestamp }
      newBadge: null,

      // "Why this question?" panel content
      whyThisQuestion: null,    // { reason, masteryPct, action }

      // ── Actions ──────────────────────────────────────────────────────────

      login: async (studentId, username) => {
        try {
          const res = await api.post('/student/', { student_id: studentId, username })
          set({
            student:          res.data,
            isLoggedIn:       true,
            currentKC:        'KC-01',
            seenQuestionIds:  [],
            behaviorSnapshot: { ...DEFAULT_SNAPSHOT },
            localXP:          0,
            localStreak:      0,
            localLevel:       1,
            lastBehaviorSignal: { signal: SIGNAL.NONE, meta: {} },
            suggestMiniGame:  false,
          })
          return { success: true }
        } catch (e) {
          return { success: false, error: e.message }
        }
      },

      logout: () => set({
        student: null, isLoggedIn: false,
        sessionId: null, currentQuestion: null,
        behaviorSnapshot: { ...DEFAULT_SNAPSHOT },
        localXP: 0, localStreak: 0, localLevel: 1,
      }),

      refreshStudent: async () => {
        const { student } = get()
        if (!student) return
        const res = await api.get(`/student/${student.student_id}/`)
        set({ student: res.data })
      },

      startSession: async () => {
        const { student } = get()
        if (!student) return
        const res = await api.post('/session/start/', { student_id: student.student_id })
        set({
          sessionId:         res.data.session_id,
          sessionStartTime:  Date.now(),
          activeTimeSeconds: 0,
          lastActiveAt:      Date.now(),
        })
        return res.data.session_id
      },

      endSession: async (status = 'completed') => {
        const { sessionId, activeTimeSeconds } = get()
        if (!sessionId) return null
        const res = await api.post('/session/end/', {
          session_id: sessionId,
          status,
          time_spent_seconds: activeTimeSeconds,
        })
        set({ sessionId: null })
        return res.data
      },

      setCurrentQuestion: (question) => {
        // Build "Why this question?" context
        const { lastPedagogyResult, currentKC, behaviorSnapshot, student } = get()
        const kcState  = (student?.kc_states || []).find(k => k.kc_id === currentKC)
        const mastery  = kcState?.mastery ?? 0.30
        const action   = lastPedagogyResult?.action ?? 'repeat'
        const signal   = get().lastBehaviorSignal?.signal ?? SIGNAL.NONE

        let reason = 'Continuing your practice to build mastery.'
        if (action === 'advance')    reason = 'You mastered the previous concept — moving to the next one!'
        else if (action === 'remediate') reason = 'Reviewing the concept to clear up a misconception.'
        else if (signal === SIGNAL.BOREDOM) reason = 'Stepping up the challenge — you\'re doing great!'
        else if (signal === SIGNAL.LOW_CONF_CORRECT) reason = 'One more question to confirm your understanding.'
        else if (signal === SIGNAL.STRUGGLING) reason = 'An easier question to rebuild confidence.'

        set({
          currentQuestion:      question,
          hintLevel:            0,
          hintsUsedThisQuestion: 0,
          retriesThisQuestion:  0,
          questionStartTime:    Date.now(),
          whyThisQuestion: {
            reason,
            masteryPct: Math.round(mastery * 100),
            action,
          },
        })
      },

      requestHint: () => {
        const { hintLevel, hintsUsedThisQuestion } = get()
        const newLevel = Math.min(3, hintLevel + 1)
        set({ hintLevel: newLevel, hintsUsedThisQuestion: hintsUsedThisQuestion + 1 })
        return newLevel
      },

      submitAnswer: async ({ studentAnswer, correctAnswer, isCorrect, confidence }) => {
        const {
          student, sessionId, currentQuestion, currentKC,
          hintsUsedThisQuestion, retriesThisQuestion, questionStartTime,
          behaviorSnapshot,
        } = get()
        if (!student || !sessionId || !currentQuestion) return null

        const responseTime = questionStartTime
          ? (Date.now() - questionStartTime) / 1000
          : 30

        const tMin = currentQuestion.t_min || 10
        const tMax = currentQuestion.t_max || 90

        // ── 1. Behavior signal (client-side, instant) ─────────────────────
        const signal = detectSignal({
          isCorrect, confidence, responseTime, tMin,
          hintsUsed: hintsUsedThisQuestion,
          snapshot: behaviorSnapshot,
        })

        // ── 2. Update snapshot ────────────────────────────────────────────
        const newSnapshot = updateSnapshot(behaviorSnapshot, {
          isCorrect, responseTime, tMin, hintsUsed: hintsUsedThisQuestion, confidence,
        })

        // ── 3. Local XP calculation ───────────────────────────────────────
        const xpResult = calculateXP(newSnapshot, {
          isCorrect, hintsUsed: hintsUsedThisQuestion, responseTime, tMin,
        })

        const updatedSnapshot = {
          ...newSnapshot,
          totalXP: xpResult.newTotal,
          level:   xpResult.newLevel,
        }

        // ── 4. Optimistic local state update ─────────────────────────────
        set({
          behaviorSnapshot:   updatedSnapshot,
          lastBehaviorSignal: signal,
          localXP:            get().localXP + xpResult.xpEarned,
          localStreak:        isCorrect ? get().localStreak + 1 : 0,
          localLevel:         xpResult.newLevel,
          lastXPBreakdown:    xpResult.breakdown,
          leveledUp:          xpResult.leveledUp,
          suggestMiniGame:    signal.meta?.suggestMiniGame ?? false,
        })

        if (xpResult.xpEarned > 0) {
          set({ xpFlash: { amount: xpResult.xpEarned, timestamp: Date.now() } })
        }

        // ── 5. Backend API call ───────────────────────────────────────────
        const payload = {
          student_id:      student.student_id,
          session_id:      sessionId,
          question_id:     currentQuestion.id,
          kc_id:           currentKC,
          student_answer:  studentAnswer,
          correct_answer:  correctAnswer,
          is_correct:      isCorrect,
          hints_used:      hintsUsedThisQuestion,
          max_hints:       3,
          response_time_s: Math.round(responseTime),
          confidence,
          retry_count:     retriesThisQuestion,
          t_min:           tMin,
          t_max:           tMax,
          question_meta:   currentQuestion.question_meta || {},
        }

        const res = await api.post('/answer/', payload)
        const data = res.data

        // Advance KC if pedagogy says so
        if (data.pedagogy.action === 'advance' && data.pedagogy.next_kc_id) {
          set({ currentKC: data.pedagogy.next_kc_id })
        }

        // Backend XP flash (replaces local one if larger)
        if (data.gamification.xp_earned > xpResult.xpEarned) {
          set({ xpFlash: { amount: data.gamification.xp_earned, timestamp: Date.now() } })
        }
        if (data.gamification.new_badge) {
          set({ newBadge: data.gamification.new_badge })
        }

        set({
          lastBktResult:           data.bkt,
          lastPedagogyResult:      data.pedagogy,
          lastMisconceptionResult: data.misconception,
          seenQuestionIds:         [...get().seenQuestionIds, currentQuestion.id],
          retriesThisQuestion:     !isCorrect ? retriesThisQuestion + 1 : retriesThisQuestion,
        })

        await get().refreshStudent()
        return { ...data, behaviorSignal: signal, xpResult }
      },

      // Call this to dismiss mini-game suggestion
      dismissMiniGame: () => set({ suggestMiniGame: false }),

      // Call this after level-up animation shown
      clearLevelUp: () => set({ leveledUp: false }),

      // Active time tracking
      pingActive: () => {
        const { lastActiveAt, activeTimeSeconds, idleThreshold } = get()
        const now = Date.now()
        const elapsed = lastActiveAt ? (now - lastActiveAt) / 1000 : 0
        const isIdle  = elapsed > idleThreshold
        if (!isIdle) {
          set({
            activeTimeSeconds: activeTimeSeconds + Math.min(elapsed, 10),
            lastActiveAt: now,
            isIdle: false,
          })
        } else {
          set({ isIdle: true, lastActiveAt: now })
        }
      },

      clearXpFlash:  () => set({ xpFlash: null }),
      clearNewBadge: () => set({ newBadge: null }),
    }),
    {
      name: 'its-factorisation-store',
      partialize: (s) => ({
        student:          s.student,
        isLoggedIn:       s.isLoggedIn,
        currentKC:        s.currentKC,
        seenQuestionIds:  s.seenQuestionIds,
        behaviorSnapshot: s.behaviorSnapshot,
        localXP:          s.localXP,
        localStreak:      s.localStreak,
        localLevel:       s.localLevel,
      }),
    }
  )
)

export default useStore
