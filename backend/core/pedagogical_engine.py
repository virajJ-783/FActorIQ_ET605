"""
Pedagogical Engine
==================
Implements the EXACT 5-priority decision logic from the ITS architecture:

  Priority 1: consecutive_wrong ≥ 2  → remediate
  Priority 2: wrong + high confidence → remediate (misconception repair)
  Priority 3: correct + low confidence → repeat (verify knowledge)
  Priority 4: mastery < threshold     → repeat (more practice)
  Priority 5: mastery ≥ threshold     → advance to next KC

DO NOT alter this priority order.
"""

from dataclasses import dataclass
from typing import Literal, Optional
from .bkt_engine import KCState, MASTERY_THRESHOLD

Action = Literal["remediate", "repeat", "advance", "challenge"]

# Difficulty levels for question selection
DIFFICULTY_EASY   = 1
DIFFICULTY_MEDIUM = 2
DIFFICULTY_HARD   = 3

# Hint strategy levels
HINT_DETAILED  = 3  # full scaffolding
HINT_MODERATE  = 2
HINT_MINIMAL   = 1


@dataclass
class PedagogicalDecision:
    action: Action
    reason: str
    target_kc: str
    difficulty_level: int       # 1 (easy) → 3 (hard)
    hint_strategy: int          # 1 (minimal) → 3 (detailed)
    show_remediation: bool
    remediation_type: Optional[str] = None   # "concept_explanation" | "worked_example" | "guided_practice"
    next_kc_id: Optional[str] = None         # only set when action == "advance"


# KC dependency graph (matches Concept Graph slide, KC-01 → KC-09)
KC_GRAPH = {
    "KC-01": [],
    "KC-02": ["KC-01"],
    "KC-03": ["KC-01", "KC-02"],
    "KC-04": ["KC-01", "KC-02", "KC-03"],
    "KC-05": ["KC-04"],
    "KC-06": ["KC-04"],
    "KC-07": ["KC-06"],
    "KC-08": ["KC-04", "KC-07"],
    "KC-09": ["KC-04", "KC-07", "KC-08"],
}

KC_ORDER = ["KC-01", "KC-02", "KC-03", "KC-04", "KC-05", "KC-06", "KC-07", "KC-08", "KC-09"]


def get_next_kc(current_kc: str, mastered_kcs: set) -> Optional[str]:
    """Return the next unlocked KC in the dependency graph, or None if all complete."""
    idx = KC_ORDER.index(current_kc) if current_kc in KC_ORDER else -1
    for kc in KC_ORDER[idx + 1:]:
        deps = KC_GRAPH.get(kc, [])
        if all(d in mastered_kcs for d in deps):
            return kc
    return None


def decide(
    kc_state: KCState,
    last_correct: bool,
    last_confidence: str,        # "low" | "medium" | "high"
    mastered_kcs: set,
) -> PedagogicalDecision:
    """
    Apply the 5-priority pedagogical rule engine.
    Returns a PedagogicalDecision for the next instructional action.
    """

    kc = kc_state.kc_id
    mastery = kc_state.mastery
    cons_wrong = kc_state.consecutive_wrong

    # ── Priority 1: consecutive wrong ≥ 2 ────────────────────────────────────
    if cons_wrong >= 2:
        return PedagogicalDecision(
            action="remediate",
            reason=f"Student has {cons_wrong} consecutive wrong answers on {kc}.",
            target_kc=kc,
            difficulty_level=DIFFICULTY_EASY,
            hint_strategy=HINT_DETAILED,
            show_remediation=True,
            remediation_type="worked_example",
        )

    # ── Priority 2: wrong + high confidence → likely misconception ───────────
    if not last_correct and last_confidence == "high":
        return PedagogicalDecision(
            action="remediate",
            reason="Incorrect answer with high confidence — possible buggy rule detected.",
            target_kc=kc,
            difficulty_level=DIFFICULTY_EASY,
            hint_strategy=HINT_DETAILED,
            show_remediation=True,
            remediation_type="concept_explanation",
        )

    # ── Priority 3: correct + low confidence → verify (lucky guess?) ─────────
    if last_correct and last_confidence == "low":
        return PedagogicalDecision(
            action="repeat",
            reason="Correct but low confidence — repeating to confirm understanding.",
            target_kc=kc,
            difficulty_level=DIFFICULTY_MEDIUM,
            hint_strategy=HINT_MODERATE,
            show_remediation=False,
        )

    # ── Priority 4: mastery below threshold → more practice ──────────────────
    if mastery < MASTERY_THRESHOLD:
        # Calibrate difficulty to mastery level
        if mastery < 0.4:
            diff = DIFFICULTY_EASY
            hints = HINT_DETAILED
        elif mastery < 0.65:
            diff = DIFFICULTY_MEDIUM
            hints = HINT_MODERATE
        else:
            diff = DIFFICULTY_HARD
            hints = HINT_MINIMAL

        return PedagogicalDecision(
            action="repeat",
            reason=f"Mastery {mastery:.2f} < threshold {MASTERY_THRESHOLD}. Continue practice.",
            target_kc=kc,
            difficulty_level=diff,
            hint_strategy=hints,
            show_remediation=False,
        )

    # ── Priority 5: mastery ≥ threshold → advance ────────────────────────────
    mastered_kcs_with_current = mastered_kcs | {kc}
    next_kc = get_next_kc(kc, mastered_kcs_with_current)

    return PedagogicalDecision(
        action="advance",
        reason=f"Mastery {mastery:.2f} ≥ {MASTERY_THRESHOLD}. Advancing to next KC.",
        target_kc=next_kc or kc,
        difficulty_level=DIFFICULTY_EASY,    # start new KC easy
        hint_strategy=HINT_MODERATE,
        show_remediation=False,
        next_kc_id=next_kc,
    )


def select_question(
    questions: list,
    kc_id: str,
    difficulty_level: int,
    seen_question_ids: set,
    last_bug_id: Optional[str] = None,
) -> Optional[dict]:
    """
    Select the best-fit question from the question bank given pedagogical constraints.

    Selection rules (in order):
    1. If last_bug_id is set → prefer a question tagged with that bug as a trap
    2. Filter by kc_id and difficulty_level (±1 tolerance if none found)
    3. Exclude already-seen questions
    4. Pick first match (question bank is pre-ordered by difficulty)
    """
    candidates = [
        q for q in questions
        if q.get("kc") == kc_id and q["id"] not in seen_question_ids
    ]

    # Priority: trap question for the detected misconception
    if last_bug_id:
        trap_candidates = [q for q in candidates if q.get("trap_bug") == last_bug_id]
        if trap_candidates:
            return trap_candidates[0]

    # Exact difficulty match
    exact = [q for q in candidates if q.get("difficulty") == difficulty_level]
    if exact:
        return exact[0]

    # Tolerance ±1
    nearby = [q for q in candidates if abs(q.get("difficulty", 2) - difficulty_level) <= 1]
    if nearby:
        return nearby[0]

    # Fallback: any unseen question for this KC
    return candidates[0] if candidates else None


def compute_hint_level(
    current_hint_level: int,
    hint_strategy: int,
    attempts_on_question: int,
) -> int:
    """
    Escalate hint level based on strategy and attempts.
    Returns 1 (vague) | 2 (partial) | 3 (full).
    """
    if hint_strategy == HINT_DETAILED:
        # Give next level on each attempt
        return min(3, current_hint_level + 1)
    elif hint_strategy == HINT_MODERATE:
        # Escalate after 2 attempts
        if attempts_on_question >= 2:
            return min(3, current_hint_level + 1)
        return current_hint_level
    else:  # HINT_MINIMAL
        # Only give hints after 3 attempts
        if attempts_on_question >= 3:
            return 1
        return 0
