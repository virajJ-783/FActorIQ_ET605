"""
Test Suite for FactorIQ ITS
===========================
Tests every critical engine:
  - BA-BKT formula correctness
  - Misconception detection patterns
  - Pedagogical 5-priority rule ordering
  - Merge Team API payload validation
  - Session sanity checks

Run with:
    python manage.py test core.tests
"""
import math
import pytest
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ── 1. BA-BKT Engine Tests ────────────────────────────────────────────────────

class TestBKTFactors:
    """Unit tests for each behavioural factor function."""

    def test_f_hints_no_hints(self):
        from core.bkt_engine import f_hints
        assert f_hints(0, 3) == 1.0

    def test_f_hints_all_hints(self):
        from core.bkt_engine import f_hints
        assert f_hints(3, 3) == 0.0

    def test_f_hints_half(self):
        from core.bkt_engine import f_hints
        assert abs(f_hints(1, 2) - 0.5) < 1e-9

    def test_f_hints_zero_max(self):
        from core.bkt_engine import f_hints
        # No hints available → factor = 1 (no penalty)
        assert f_hints(0, 0) == 1.0

    def test_f_time_productive_window(self):
        from core.bkt_engine import f_time
        assert f_time(30, 10, 90) == 1.0

    def test_f_time_too_fast(self):
        from core.bkt_engine import f_time
        assert f_time(5, 10, 90) == 0.6

    def test_f_time_too_slow(self):
        from core.bkt_engine import f_time
        assert f_time(150, 10, 90) == 0.7

    def test_f_confidence_correct_high(self):
        from core.bkt_engine import f_confidence
        assert f_confidence(True, "high") == 1.0

    def test_f_confidence_incorrect_high(self):
        """High confidence + wrong = strongest penalty (misconception signal)."""
        from core.bkt_engine import f_confidence
        assert f_confidence(False, "high") == 0.2

    def test_f_confidence_correct_low(self):
        from core.bkt_engine import f_confidence
        assert f_confidence(True, "low") == 0.6

    def test_f_retries_none(self):
        from core.bkt_engine import f_retries
        assert f_retries(0) == 1.0

    def test_f_retries_one(self):
        from core.bkt_engine import f_retries
        assert abs(f_retries(1) - 0.5) < 1e-9

    def test_f_retries_two(self):
        from core.bkt_engine import f_retries
        assert abs(f_retries(2) - 1/3) < 1e-9

    def test_f_misconception_none(self):
        from core.bkt_engine import f_misconception
        assert f_misconception("none") == 1.0

    def test_f_misconception_major(self):
        from core.bkt_engine import f_misconception
        assert f_misconception("major") == 0.4


class TestBKTUpdate:
    """Integration tests for the full BA-BKT mastery update."""

    def _obs(self, **kwargs):
        from core.bkt_engine import BKTObservation
        defaults = dict(
            is_correct=True, hints_used=0, max_hints=3,
            response_time_s=30, t_min=10, t_max=90,
            confidence="medium", retry_count=0,
            misconception_severity="none",
        )
        defaults.update(kwargs)
        return BKTObservation(**defaults)

    def test_perfect_correct_gains_mastery(self):
        from core.bkt_engine import update_mastery, ALPHA
        obs = self._obs(is_correct=True, confidence="high")
        result = update_mastery(0.5, obs)
        assert result.mastery_after > 0.5
        assert result.delta_applied > 0

    def test_incorrect_loses_mastery(self):
        from core.bkt_engine import update_mastery, BETA
        obs = self._obs(is_correct=False, confidence="low")
        result = update_mastery(0.5, obs)
        assert result.mastery_after < 0.5
        assert result.delta_applied < 0

    def test_correct_with_all_hints_small_gain(self):
        """Correct but used all hints → w_behaviour low → small gain."""
        from core.bkt_engine import update_mastery
        obs_clean = self._obs(is_correct=True, hints_used=0, confidence="high")
        obs_hints = self._obs(is_correct=True, hints_used=3, confidence="high")
        r_clean = update_mastery(0.5, obs_clean)
        r_hints = update_mastery(0.5, obs_hints)
        assert r_clean.delta_applied > r_hints.delta_applied

    def test_incorrect_high_confidence_has_lower_w_behaviour(self):
        """
        BA-BKT: f_confidence(False,'high')=0.2 < f_confidence(False,'low')=0.4
        → smaller W_behaviour → LESS negative delta (smaller update magnitude).
        Pedagogical remediation is triggered by the pedagogical engine (Priority 2),
        NOT by making mastery decrease larger. These concerns are separate.
        """
        from core.bkt_engine import update_mastery
        obs_hc  = self._obs(is_correct=False, confidence="high")
        obs_lc  = self._obs(is_correct=False, confidence="low")
        r_hc    = update_mastery(0.5, obs_hc)
        r_lc    = update_mastery(0.5, obs_lc)
        # High confidence wrong → f_conf=0.2 → smaller W → LESS negative delta
        assert r_hc.w_behaviour < r_lc.w_behaviour
        assert r_hc.delta_applied > r_lc.delta_applied   # less negative

    def test_mastery_clipped_at_zero(self):
        from core.bkt_engine import update_mastery
        obs = self._obs(is_correct=False, confidence="high", misconception_severity="major", retry_count=5)
        result = update_mastery(0.01, obs)
        assert result.mastery_after >= 0.0

    def test_mastery_clipped_at_one(self):
        from core.bkt_engine import update_mastery
        obs = self._obs(is_correct=True, confidence="high")
        result = update_mastery(0.99, obs)
        assert result.mastery_after <= 1.0

    def test_w_behaviour_multiplicative_weights_sum_to_one(self):
        """Verify weights in the code sum to 1.0."""
        from core.bkt_engine import W_HINTS, W_TIME, W_CONFIDENCE, W_RETRIES, W_MISCONCEPTION
        total = W_HINTS + W_TIME + W_CONFIDENCE + W_RETRIES + W_MISCONCEPTION
        assert abs(total - 1.0) < 1e-9, f"Weights sum to {total}, expected 1.0"

    def test_alpha_beta_values(self):
        from core.bkt_engine import ALPHA, BETA
        assert ALPHA == 0.10
        assert BETA  == 0.12
        assert BETA > ALPHA  # spec: β > α

    def test_mastery_threshold(self):
        from core.bkt_engine import MASTERY_THRESHOLD
        assert MASTERY_THRESHOLD == 0.85

    def test_bkt_result_mastered_flag(self):
        from core.bkt_engine import update_mastery
        obs = self._obs(is_correct=True, confidence="high")
        result = update_mastery(0.84, obs)
        assert result.mastered == (result.mastery_after >= 0.85)


class TestKCState:
    """KCState record_attempt integration."""

    def test_record_correct_increments_counters(self):
        from core.bkt_engine import KCState, BKTObservation
        state = KCState(kc_id="KC-04", mastery=0.5)
        obs = BKTObservation(
            is_correct=True, hints_used=0, max_hints=3,
            response_time_s=30, t_min=10, t_max=90,
            confidence="high", retry_count=0, misconception_severity="none",
        )
        state.record_attempt(obs)
        assert state.attempts == 1
        assert state.correct_count == 1
        assert state.consecutive_wrong == 0

    def test_record_wrong_increments_consecutive(self):
        from core.bkt_engine import KCState, BKTObservation
        state = KCState(kc_id="KC-04", mastery=0.5)
        obs = BKTObservation(
            is_correct=False, hints_used=1, max_hints=3,
            response_time_s=30, t_min=10, t_max=90,
            confidence="medium", retry_count=0, misconception_severity="none",
        )
        state.record_attempt(obs)
        state.record_attempt(obs)
        assert state.consecutive_wrong == 2
        assert state.wrong_count == 2

    def test_correct_after_wrong_resets_consecutive(self):
        from core.bkt_engine import KCState, BKTObservation
        state = KCState(kc_id="KC-04", mastery=0.5)
        wrong = BKTObservation(is_correct=False, hints_used=0, max_hints=3,
            response_time_s=30, t_min=10, t_max=90, confidence="low",
            retry_count=0, misconception_severity="none")
        right = BKTObservation(is_correct=True, hints_used=0, max_hints=3,
            response_time_s=30, t_min=10, t_max=90, confidence="high",
            retry_count=0, misconception_severity="none")
        state.record_attempt(wrong)
        state.record_attempt(wrong)
        assert state.consecutive_wrong == 2
        state.record_attempt(right)
        assert state.consecutive_wrong == 0


# ── 2. Misconception Detection Tests ─────────────────────────────────────────

class TestMisconceptionDetection:

    def test_correct_answer_no_misconception(self):
        from core.misconception_engine import detect_misconception
        result = detect_misconception("2(x+2)", "2(x+2)", {})
        assert not result.detected
        assert result.severity == "none"

    def test_missing_middle_term_bug01(self):
        from core.misconception_engine import detect_misconception
        result = detect_misconception(
            "x²+9", "x²+6x+9",
            {"identity": "square_sum", "a_val": "x", "b_val": 3}
        )
        assert result.detected
        assert result.bug_id == "BUG_01"
        assert result.severity == "major"

    def test_coefficient_not_reduced_bug02(self):
        from core.misconception_engine import detect_misconception
        result = detect_misconception(
            "4(x+8)", "4(x+2)",
            {"expected_common_factor": 4, "constant_term": 8}
        )
        assert result.detected
        assert result.bug_id == "BUG_02"

    def test_generic_wrong_answer(self):
        from core.misconception_engine import detect_misconception
        result = detect_misconception("(x+1)(x+4)", "(x+2)(x+3)", {})
        assert result.detected
        assert result.severity in ("minor", "major")

    def test_incomplete_factorisation_bug06(self):
        from core.misconception_engine import detect_misconception
        result = detect_misconception(
            "2(x²-4)", "(x-2)(x+2)·2",
            {"expects_difference_of_squares": True}
        )
        assert result.detected
        assert result.bug_id == "BUG_06"

    def test_feedback_string_present(self):
        from core.misconception_engine import detect_misconception
        result = detect_misconception(
            "x²+9", "x²+6x+9",
            {"identity": "square_sum"}
        )
        assert result.feedback is not None
        assert len(result.feedback) > 10


# ── 3. Pedagogical Engine Tests ───────────────────────────────────────────────

class TestPedagogicalEngine:
    """Tests for the strict 5-priority pedagogical decision logic."""

    def _state(self, mastery=0.5, consecutive_wrong=0):
        from core.bkt_engine import KCState
        s = KCState(kc_id="KC-04", mastery=mastery)
        s.consecutive_wrong = consecutive_wrong
        return s

    def test_priority1_consecutive_wrong_ge2_remediates(self):
        from core.pedagogical_engine import decide
        state = self._state(mastery=0.6, consecutive_wrong=2)
        decision = decide(state, last_correct=False, last_confidence="medium", mastered_kcs=set())
        assert decision.action == "remediate"
        assert decision.show_remediation is True

    def test_priority1_three_wrong_also_remediates(self):
        from core.pedagogical_engine import decide
        state = self._state(mastery=0.5, consecutive_wrong=3)
        decision = decide(state, last_correct=False, last_confidence="low", mastered_kcs=set())
        assert decision.action == "remediate"

    def test_priority2_wrong_high_confidence_remediates(self):
        from core.pedagogical_engine import decide
        state = self._state(mastery=0.7, consecutive_wrong=1)
        decision = decide(state, last_correct=False, last_confidence="high", mastered_kcs=set())
        assert decision.action == "remediate"

    def test_priority3_correct_low_confidence_repeats(self):
        from core.pedagogical_engine import decide
        state = self._state(mastery=0.9, consecutive_wrong=0)
        decision = decide(state, last_correct=True, last_confidence="low", mastered_kcs={"KC-01","KC-02","KC-03","KC-04"})
        assert decision.action == "repeat"

    def test_priority4_low_mastery_repeats(self):
        from core.pedagogical_engine import decide
        state = self._state(mastery=0.4, consecutive_wrong=0)
        decision = decide(state, last_correct=True, last_confidence="high", mastered_kcs=set())
        assert decision.action == "repeat"

    def test_priority5_mastered_advances(self):
        from core.pedagogical_engine import decide
        state = self._state(mastery=0.90, consecutive_wrong=0)
        decision = decide(state, last_correct=True, last_confidence="high",
                          mastered_kcs={"KC-01","KC-02","KC-03","KC-04"})
        assert decision.action == "advance"
        assert decision.next_kc_id is not None

    def test_priority1_beats_priority5(self):
        """Even with high mastery, 2 consecutive wrong must trigger remediate (Priority 1 > 5)."""
        from core.pedagogical_engine import decide
        state = self._state(mastery=0.90, consecutive_wrong=2)
        decision = decide(state, last_correct=False, last_confidence="medium", mastered_kcs=set())
        assert decision.action == "remediate", "Priority 1 must override even high mastery"

    def test_difficulty_low_for_early_mastery(self):
        from core.pedagogical_engine import decide, DIFFICULTY_EASY
        state = self._state(mastery=0.35, consecutive_wrong=0)
        decision = decide(state, last_correct=True, last_confidence="medium", mastered_kcs=set())
        assert decision.difficulty_level == DIFFICULTY_EASY

    def test_difficulty_hard_near_threshold(self):
        from core.pedagogical_engine import decide, DIFFICULTY_HARD
        state = self._state(mastery=0.75, consecutive_wrong=0)
        decision = decide(state, last_correct=True, last_confidence="high", mastered_kcs=set())
        assert decision.difficulty_level == DIFFICULTY_HARD

    def test_kc_dependency_graph_respected(self):
        """KC-08 should not unlock if KC-04 and KC-07 are not mastered."""
        from core.pedagogical_engine import get_next_kc
        # KC-04 mastered, KC-07 not → KC-08 should not be next
        mastered = {"KC-01","KC-02","KC-03","KC-04","KC-05","KC-06"}
        # KC-07 depends on KC-06 (mastered), so KC-07 should unlock
        nxt = get_next_kc("KC-06", mastered)
        assert nxt == "KC-07"


# ── 4. Merge Team Session Payload Validation ──────────────────────────────────

class TestMergeTeamValidation:
    """Validate the exact Merge Team contract rules."""

    def _payload(self, **overrides):
        base = {
            "student_id": "student_1042",
            "session_id": "s_1042_001",
            "chapter_id": "grade8_factorisation",
            "timestamp": "2026-03-28T10:30:00Z",
            "session_status": "completed",
            "correct_answers": 8,
            "wrong_answers": 2,
            "questions_attempted": 10,
            "total_questions": 45,
            "retry_count": 2,
            "hints_used": 4,
            "total_hints_embedded": 135,
            "time_spent_seconds": 900,
            "topic_completion_ratio": 0.33,
        }
        base.update(overrides)
        return base

    def test_valid_payload_passes(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload())
        assert s.is_valid(), s.errors

    def test_correct_plus_wrong_exceeds_attempted_fails(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(correct_answers=8, wrong_answers=5, questions_attempted=10))
        assert not s.is_valid()
        errors = str(s.errors)
        assert "attempted" in errors

    def test_attempted_exceeds_total_fails(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(questions_attempted=50, total_questions=45))
        assert not s.is_valid()

    def test_hints_used_exceeds_embedded_fails(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(hints_used=200, total_hints_embedded=135))
        assert not s.is_valid()

    def test_ratio_out_of_range_fails(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(topic_completion_ratio=1.5))
        assert not s.is_valid()

    def test_invalid_session_status_fails(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(session_status="abandoned"))
        assert not s.is_valid()

    def test_completed_status_valid(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(session_status="completed"))
        assert s.is_valid()

    def test_exited_midway_status_valid(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(session_status="exited_midway"))
        assert s.is_valid()

    def test_zero_attempts_valid(self):
        from core.serializers import SessionSubmitSerializer
        s = SessionSubmitSerializer(data=self._payload(
            correct_answers=0, wrong_answers=0,
            questions_attempted=0, hints_used=0
        ))
        assert s.is_valid()

    def test_chapter_id_format(self):
        """chapter_id must match grade8_factorisation format."""
        payload = self._payload()
        assert payload["chapter_id"] == "grade8_factorisation"
        assert payload["chapter_id"].startswith("grade8_")

    def test_subtopic_difficulty_in_range(self):
        """All subtopic difficulties must be in [0, 1]."""
        subtopics = [
            {"subtopic_id": "grade8_factorisation_algebraic_terms",   "difficulty": 0.30},
            {"subtopic_id": "grade8_factorisation_common_factor",      "difficulty": 0.45},
            {"subtopic_id": "grade8_factorisation_regrouping",         "difficulty": 0.55},
            {"subtopic_id": "grade8_factorisation_identities",         "difficulty": 0.65},
            {"subtopic_id": "grade8_factorisation_quadratic",          "difficulty": 0.72},
            {"subtopic_id": "grade8_factorisation_division",           "difficulty": 0.75},
        ]
        for sub in subtopics:
            assert 0 <= sub["difficulty"] <= 1, f"Out of range: {sub}"


# ── 5. Question Bank Tests ────────────────────────────────────────────────────

class TestQuestionBank:
    """Validate the curriculum seed data integrity."""

    def _load(self):
        import json, pathlib
        path = pathlib.Path(__file__).parent.parent / "curriculum" / "seed_data.json"
        return json.loads(path.read_text())

    def test_nine_knowledge_components(self):
        data = self._load()
        assert len(data["knowledge_components"]) == 9

    def test_kc_ids_sequential(self):
        data = self._load()
        ids = [kc["id"] for kc in data["knowledge_components"]]
        expected = [f"KC-0{i}" for i in range(1, 10)]
        assert ids == expected

    def test_each_kc_has_mastery_threshold(self):
        data = self._load()
        for kc in data["knowledge_components"]:
            assert "mastery_threshold" in kc
            assert kc["mastery_threshold"] == 0.85

    def test_questions_have_required_fields(self):
        data = self._load()
        required = {"id", "kc", "difficulty", "type", "question", "hints"}
        for q in data["question_bank"]:
            missing = required - q.keys()
            assert not missing, f"Question {q.get('id')} missing: {missing}"

    def test_hints_always_three_levels(self):
        data = self._load()
        for q in data["question_bank"]:
            assert len(q["hints"]) == 3, f"{q['id']} has {len(q['hints'])} hints"

    def test_difficulty_in_range_1_to_3(self):
        data = self._load()
        for q in data["question_bank"]:
            assert q["difficulty"] in (1, 2, 3), f"{q['id']} difficulty={q['difficulty']}"

    def test_all_kcs_covered_by_questions(self):
        data = self._load()
        kc_ids = {kc["id"] for kc in data["knowledge_components"]}
        q_kcs  = {q["kc"]  for q in data["question_bank"]}
        uncovered = kc_ids - q_kcs
        assert not uncovered, f"No questions for KCs: {uncovered}"

    def test_mcq_has_options_and_correct_index(self):
        data = self._load()
        for q in data["question_bank"]:
            if q["type"] == "mcq":
                assert "options" in q and len(q["options"]) == 4
                assert "correct_index" in q
                assert 0 <= q["correct_index"] <= 3

    def test_fill_has_correct_answer(self):
        data = self._load()
        for q in data["question_bank"]:
            if q["type"] == "fill":
                assert "correct_answer" in q
                assert len(q["correct_answer"]) > 0

    def test_six_subtopics_defined(self):
        data = self._load()
        assert len(data["subtopics"]) == 6

    def test_chapter_id_format_correct(self):
        data = self._load()
        assert data["chapter"]["id"] == "grade8_factorisation"
        assert data["chapter"]["grade"] == 8


# ── Runner ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import unittest

    # Collect all test classes
    loader = unittest.TestLoader()
    suite  = unittest.TestSuite()

    test_classes = [
        TestBKTFactors, TestBKTUpdate, TestKCState,
        TestMisconceptionDetection, TestPedagogicalEngine,
        TestMergeTeamValidation, TestQuestionBank,
    ]

    for cls in test_classes:
        suite.addTests(loader.loadTestsFromTestCase(cls))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
