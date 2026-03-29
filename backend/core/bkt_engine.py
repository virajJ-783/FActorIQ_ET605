"""
Behaviour-Adaptive Bayesian Knowledge Tracing (BA-BKT) Engine
=============================================================
Implements the exact model from:
  "Intelligent Tutoring System for Factorisation - NCERT Class 8"
  Electrify / IIT Bombay, March 28, 2026

Formula reference (from Formula_for_updating_state.pdf):
  ΔBase = +α if correct, −β if incorrect   (α=0.10, β=0.12)
  W_behaviour = f_hints^w1 · f_time^w2 · f_confidence^w3 · f_retries^w4 · f_misconception^w5
  Δ = ΔBase · W_behaviour
  M_new = clip(M_old + Δ, 0, 1)

Weights: w1=0.25, w2=0.20, w3=0.20, w4=0.15, w5=0.20
"""

from dataclasses import dataclass, field
from typing import Literal

# ── Constants ────────────────────────────────────────────────────────────────

ALPHA = 0.10          # base gain for correct response
BETA  = 0.12          # base penalty for incorrect response
MASTERY_THRESHOLD = 0.85  # advance KC when mastery ≥ this

# Behavioural factor weights (must sum to 1.0)
W_HINTS        = 0.25
W_TIME         = 0.20
W_CONFIDENCE   = 0.20
W_RETRIES      = 0.15
W_MISCONCEPTION = 0.20

ConfidenceLevel = Literal["low", "medium", "high"]
MisconceptionSeverity = Literal["none", "minor", "major"]


# ── Behavioural factor functions ─────────────────────────────────────────────

def f_hints(hints_used: int, max_hints: int) -> float:
    """
    fhints = 1 − hints_used / max_hints
    Heavy hint dependence → lower factor (weaker mastery evidence).
    """
    if max_hints <= 0:
        return 1.0
    return max(0.0, 1.0 - hints_used / max_hints)


def f_time(response_time_s: float, t_min: float, t_max: float) -> float:
    """
    ftime:
      0.6  if T < Tmin  (too fast → possible guessing)
      1.0  if Tmin ≤ T ≤ Tmax  (productive window)
      0.7  if T > Tmax  (too slow → struggle / hesitation)
    """
    if response_time_s < t_min:
        return 0.6
    if response_time_s > t_max:
        return 0.7
    return 1.0


def f_confidence(is_correct: bool, confidence: ConfidenceLevel) -> float:
    """
    Confidence-accuracy interaction matrix (from BA-BKT paper):

              | Correct | Incorrect
    ----------+---------+-----------
    High conf |  1.0    |  0.2   ← dangerous: confident + wrong = misconception
    Med conf  |  0.8    |  0.3
    Low conf  |  0.6    |  0.4
    """
    table = {
        (True,  "high"):   1.0,
        (True,  "medium"): 0.8,
        (True,  "low"):    0.6,
        (False, "low"):    0.4,
        (False, "medium"): 0.3,
        (False, "high"):   0.2,
    }
    return table.get((is_correct, confidence), 0.5)


def f_retries(retry_count: int) -> float:
    """
    fretries = 1 / (1 + retry_count)
    0 retries → 1.0; 1 retry → 0.5; 2 retries → 0.33 …
    """
    return 1.0 / (1.0 + retry_count)


def f_misconception(severity: MisconceptionSeverity) -> float:
    """
    fmisconception:
      1.0  → no misconception
      0.7  → minor misconception
      0.4  → major misconception (recurring buggy rule)
    """
    return {"none": 1.0, "minor": 0.7, "major": 0.4}[severity]


# ── Core update function ─────────────────────────────────────────────────────

@dataclass
class BKTObservation:
    """Single learner interaction record."""
    is_correct: bool
    hints_used: int
    max_hints: int
    response_time_s: float
    t_min: float              # question-specific lower bound (seconds)
    t_max: float              # question-specific upper bound (seconds)
    confidence: ConfidenceLevel = "medium"
    retry_count: int = 0
    misconception_severity: MisconceptionSeverity = "none"


@dataclass
class BKTResult:
    """Result of a single BA-BKT update step."""
    mastery_before: float
    mastery_after: float
    delta_base: float
    w_behaviour: float
    delta_applied: float
    factor_hints: float
    factor_time: float
    factor_confidence: float
    factor_retries: float
    factor_misconception: float
    mastered: bool  # True if mastery_after ≥ MASTERY_THRESHOLD


def update_mastery(current_mastery: float, obs: BKTObservation) -> BKTResult:
    """
    Compute BA-BKT mastery update given a learner observation.

    Returns BKTResult with full diagnostic breakdown.
    """
    # 1. Base update direction
    delta_base = ALPHA if obs.is_correct else -BETA

    # 2. Behavioural factor components
    fh = f_hints(obs.hints_used, obs.max_hints)
    ft = f_time(obs.response_time_s, obs.t_min, obs.t_max)
    fc = f_confidence(obs.is_correct, obs.confidence)
    fr = f_retries(obs.retry_count)
    fm = f_misconception(obs.misconception_severity)

    # 3. Multiplicative behavioural weight
    # W = fh^w1 · ft^w2 · fc^w3 · fr^w4 · fm^w5
    w_behaviour = (
        (fh ** W_HINTS)
        * (ft ** W_TIME)
        * (fc ** W_CONFIDENCE)
        * (fr ** W_RETRIES)
        * (fm ** W_MISCONCEPTION)
    )

    # 4. Final delta and clipped mastery
    delta = delta_base * w_behaviour
    new_mastery = min(1.0, max(0.0, current_mastery + delta))

    return BKTResult(
        mastery_before=current_mastery,
        mastery_after=new_mastery,
        delta_base=delta_base,
        w_behaviour=w_behaviour,
        delta_applied=delta,
        factor_hints=fh,
        factor_time=ft,
        factor_confidence=fc,
        factor_retries=fr,
        factor_misconception=fm,
        mastered=(new_mastery >= MASTERY_THRESHOLD),
    )


# ── KC State manager ──────────────────────────────────────────────────────────

@dataclass
class KCState:
    """
    Full learner state for a single Knowledge Component.
    Stored per (student, KC) pair.
    """
    kc_id: str
    mastery: float = 0.30            # prior mastery (initialised conservatively)
    attempts: int = 0
    correct_count: int = 0
    wrong_count: int = 0
    hints_used_total: int = 0
    retries_total: int = 0
    consecutive_wrong: int = 0
    last_confidence: ConfidenceLevel = "medium"
    misconception_counts: dict = field(default_factory=dict)

    @property
    def accuracy(self) -> float:
        if self.attempts == 0:
            return 0.0
        return self.correct_count / self.attempts

    @property
    def is_mastered(self) -> bool:
        return self.mastery >= MASTERY_THRESHOLD

    def record_attempt(self, obs: BKTObservation) -> BKTResult:
        """Update this KC state from a new observation and return BKT result."""
        result = update_mastery(self.mastery, obs)
        self.mastery = result.mastery_after
        self.attempts += 1
        self.last_confidence = obs.confidence
        self.hints_used_total += obs.hints_used
        self.retries_total += obs.retry_count

        if obs.is_correct:
            self.correct_count += 1
            self.consecutive_wrong = 0
        else:
            self.wrong_count += 1
            self.consecutive_wrong += 1

        return result
