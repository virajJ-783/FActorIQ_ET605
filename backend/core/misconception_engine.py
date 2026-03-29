"""
Misconception Detection Engine
================================
Compares student answers against a library of known "buggy rules"
for Grade 8 Factorisation (NCERT Chapter 12).

Detection is pattern-based, NOT equality-check-only.
Each buggy rule has an id, description, KC mapping, and severity.
"""

import re
from dataclasses import dataclass
from typing import Optional

# ── Buggy Rule Library ────────────────────────────────────────────────────────

BUGGY_RULES = [
    {
        "id": "BUG_01",
        "name": "Identity Misuse – Linear Square",
        "description": "Student writes (a+b)² = a² + b², forgetting the 2ab cross term.",
        "kc": "KC-06",
        "severity": "major",
        "example_wrong": "x² + 9",          # for (x+3)²
        "example_correct": "x² + 6x + 9",
        "trigger": "missing_middle_term_in_square",
    },
    {
        "id": "BUG_02",
        "name": "Wrong Common Factor – Coefficient Not Divided",
        "description": "Student extracts factor but leaves constant un-divided: 4(x+8) for 4x+8.",
        "kc": "KC-04",
        "severity": "minor",
        "trigger": "common_factor_constant_not_reduced",
    },
    {
        "id": "BUG_03",
        "name": "Sign Confusion in Quadratic Split",
        "description": "Student selects factor pair with correct product but wrong sum sign: (x+2)(x+3) for x²-5x+6.",
        "kc": "KC-08",
        "severity": "major",
        "trigger": "quadratic_wrong_sign_factor_pair",
    },
    {
        "id": "BUG_04",
        "name": "Invalid Regrouping",
        "description": "Student groups terms that share no common factor: a(x+b) + y(b+a) mis-applied.",
        "kc": "KC-05",
        "severity": "minor",
        "trigger": "invalid_group_no_common_factor",
    },
    {
        "id": "BUG_05",
        "name": "Incorrect Middle Term Split",
        "description": "Selects factor pair of ac that does not sum to b in ax²+bx+c.",
        "kc": "KC-08",
        "severity": "major",
        "trigger": "middle_term_split_wrong_sum",
    },
    {
        "id": "BUG_06",
        "name": "Incomplete Factorisation",
        "description": "Student stops factoring prematurely, e.g., leaves 2(x²-4) instead of 2(x-2)(x+2).",
        "kc": "KC-07",
        "severity": "minor",
        "trigger": "incomplete_factorisation",
    },
    {
        "id": "BUG_07",
        "name": "Sign Error in (a-b)² expansion check",
        "description": "Student confuses (a-b)² = a²-2ab+b² with a²-b².",
        "kc": "KC-06",
        "severity": "major",
        "trigger": "minus_square_identity_confusion",
    },
    {
        "id": "BUG_08",
        "name": "Variable HCF Missed",
        "description": "Student finds numerical HCF but misses variable common factor: writes 3(4a+5b) instead of 3ab(4a+5b) for 12a²b+15ab².",
        "kc": "KC-04",
        "severity": "minor",
        "trigger": "variable_hcf_missed",
    },
]

# Quick lookup
BUGGY_RULE_MAP = {r["id"]: r for r in BUGGY_RULES}


@dataclass
class MisconceptionResult:
    detected: bool
    bug_id: Optional[str] = None
    bug_name: Optional[str] = None
    severity: str = "none"   # "none" | "minor" | "major"
    kc: Optional[str] = None
    feedback: Optional[str] = None
    counter_example: Optional[str] = None


# ── Pattern matching helpers ──────────────────────────────────────────────────

def _normalise(expr: str) -> str:
    """Strip whitespace and lowercase for comparison."""
    return re.sub(r'\s+', '', expr.lower())


def detect_missing_middle_term(student_ans: str, question_meta: dict) -> bool:
    """
    For identity questions: detect a²+b² answer where a²+2ab+b² is correct.
    question_meta should contain: {'identity': 'square_sum', 'a_val': ..., 'b_val': ...}
    """
    if question_meta.get('identity') not in ('square_sum', 'square_diff'):
        return False
    ans = _normalise(student_ans)
    # If answer contains a squared term and constant but no middle term
    # e.g. "x²+9" instead of "x²+6x+9"
    has_cross_term = bool(re.search(r'\d*[a-z]\b(?!\^2)', ans))
    return not has_cross_term


def detect_quadratic_sign_error(student_ans: str, question_meta: dict) -> bool:
    """
    For quadratic factorisation: check if student used positive factors when both
    should be negative (or vice versa).
    """
    factors = question_meta.get('correct_factors', [])
    if not factors or len(factors) != 2:
        return False
    a, b = factors
    # Both negative but student used positive
    if a < 0 and b < 0:
        ans = _normalise(student_ans)
        # Pattern: (x+N)(x+M) in answer when it should be (x-N)(x-M)
        positive_pair = re.findall(r'x\+(\d+)', ans)
        if len(positive_pair) >= 2:
            return True
    return False


def detect_incomplete_factorisation(student_ans: str, question_meta: dict) -> bool:
    """Check if difference-of-squares was not fully factored."""
    if question_meta.get('expects_difference_of_squares'):
        ans = _normalise(student_ans)
        # If answer still contains a squared term that could be factored further
        unfactored = re.search(r'[a-z]\^2', ans)
        has_two_linear = len(re.findall(r'\([a-z][+-]\d+\)', ans)) >= 2
        return bool(unfactored) and not has_two_linear
    return False


def detect_coefficient_not_reduced(student_ans: str, question_meta: dict) -> bool:
    """
    For 4x + 8, if student writes 4(x+8) — coefficient not distributed.
    """
    if question_meta.get('expected_common_factor') and question_meta.get('constant_term'):
        gcf = question_meta['expected_common_factor']
        const = question_meta['constant_term']
        ans = _normalise(student_ans)
        # wrong: pattern like 4(x+8) when correct is 4(x+2)
        wrong_const = str(const)  # unreduced constant appears in brackets
        if f"{gcf}(x+{wrong_const})" in ans or f"{gcf}(x-{wrong_const})" in ans:
            return True
    return False


# ── Public API ─────────────────────────────────────────────────────────────────

def detect_misconception(
    student_answer: str,
    correct_answer: str,
    question_meta: dict,
) -> MisconceptionResult:
    """
    Main misconception detection entry point.

    Args:
        student_answer: raw student input string
        correct_answer: canonical correct answer
        question_meta: dict with keys like 'kc', 'identity', 'correct_factors',
                       'expects_difference_of_squares', 'expected_common_factor', etc.

    Returns:
        MisconceptionResult with severity and remediation pointers.
    """
    if _normalise(student_answer) == _normalise(correct_answer):
        return MisconceptionResult(detected=False, severity="none")

    checks = [
        (detect_missing_middle_term(student_answer, question_meta), "BUG_01",
         "You expanded (a+b)² as a²+b². Remember the middle term: 2ab! "
         "Try: (x+3)² = x² + 6x + 9, not x² + 9."),
        (detect_quadratic_sign_error(student_answer, question_meta), "BUG_03",
         "Check your signs! When the middle term is negative, both factors should be negative. "
         "For x²−5x+6: you need two numbers that multiply to +6 AND add to −5. Try (−2)(−3)."),
        (detect_incomplete_factorisation(student_answer, question_meta), "BUG_06",
         "You're almost there — but the factorisation isn't complete! "
         "Check if any factor can be broken down further using a²−b² = (a+b)(a−b)."),
        (detect_coefficient_not_reduced(student_answer, question_meta), "BUG_02",
         "When you take a common factor out, divide EVERY term by it — including the constant. "
         "For 4x+8, the HCF is 4, so it becomes 4(x+2), not 4(x+8)."),
    ]

    for triggered, bug_id, feedback in checks:
        if triggered:
            rule = BUGGY_RULE_MAP[bug_id]
            return MisconceptionResult(
                detected=True,
                bug_id=bug_id,
                bug_name=rule["name"],
                severity=rule["severity"],
                kc=rule["kc"],
                feedback=feedback,
                counter_example=rule.get("example_correct"),
            )

    # Generic wrong answer (no specific pattern matched)
    return MisconceptionResult(
        detected=True,
        bug_id=None,
        bug_name="Generic Error",
        severity="minor",
        kc=question_meta.get("kc", "KC-04"),
        feedback="That's not quite right. Try working through the steps again. Use a hint if needed!",
    )


def get_misconception_severity(result: MisconceptionResult) -> str:
    """Returns 'none' | 'minor' | 'major' for BA-BKT engine."""
    return result.severity
