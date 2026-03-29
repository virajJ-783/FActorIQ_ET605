"""
API Views
=========
Merge Team APIs (exact contract compliance):
  POST /api/chapter-metadata/
  POST /api/session-submit/

ITS APIs:
  POST /api/answer/          → process answer, run BA-BKT, return pedagogical decision
  GET  /api/student/<id>/    → learner model state
  POST /api/student/         → register student
  GET  /api/next-question/   → adaptive question selection
  GET  /api/leaderboard/     → top students by XP
  GET  /api/analytics/<id>/  → per-KC mastery analytics
"""

import json
from datetime import datetime, timezone

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .models import Student, KCMastery, Session, QuestionAttempt, ChapterMetadata
from .serializers import (
    ChapterMetadataSerializer, SessionSubmitSerializer,
    AnswerSubmitSerializer, StudentSerializer, KCMasterySerializer,
)
from .bkt_engine import BKTObservation, KCState, update_mastery, MASTERY_THRESHOLD
from .misconception_engine import detect_misconception, get_misconception_severity
from .pedagogical_engine import decide, select_question, compute_hint_level


# ── Gamification constants ────────────────────────────────────────────────────

XP_CORRECT        = 10
XP_CORRECT_BONUS  = 5   # no hints used
XP_MASTERY_BADGE  = 50  # KC mastered

BADGES = {
    "KC-01": {"id": "identifier",  "name": "Expression Explorer",  "emoji": "🔍"},
    "KC-02": {"id": "cf_finder",   "name": "Factor Finder",        "emoji": "🔢"},
    "KC-03": {"id": "dist_law",    "name": "Distributive Dynamo",  "emoji": "⚡"},
    "KC-04": {"id": "hcf_hero",    "name": "HCF Hero",             "emoji": "🏆"},
    "KC-05": {"id": "regrouper",   "name": "Regrouping Ranger",    "emoji": "🔄"},
    "KC-06": {"id": "identity",    "name": "Identity King",        "emoji": "👑"},
    "KC-07": {"id": "identity_app","name": "Identity Applier",     "emoji": "🎯"},
    "KC-08": {"id": "quad_master", "name": "Split Master",         "emoji": "✂️"},
    "KC-09": {"id": "div_guru",    "name": "Division Guru",        "emoji": "➗"},
}

# Canonical chapter metadata (sent once to Merge Team)
CHAPTER_METADATA = {
    "grade": 8,
    "chapter_name": "Factorisation",
    "chapter_id": "grade8_factorisation",
    "chapter_url": "/chapter/grade8_factorisation",
    "chapter_difficulty": 0.62,
    "expected_completion_time_seconds": 5400,  # 90 minutes
    "subtopics": [
        {"subtopic_id": "grade8_factorisation_algebraic_terms",   "name": "Factors of Algebraic Expressions", "difficulty": 0.30},
        {"subtopic_id": "grade8_factorisation_common_factor",     "name": "Common Factor Method",              "difficulty": 0.45},
        {"subtopic_id": "grade8_factorisation_regrouping",        "name": "Factorisation by Regrouping",       "difficulty": 0.55},
        {"subtopic_id": "grade8_factorisation_identities",        "name": "Using Algebraic Identities",        "difficulty": 0.65},
        {"subtopic_id": "grade8_factorisation_quadratic",         "name": "Quadratic Factorisation",           "difficulty": 0.72},
        {"subtopic_id": "grade8_factorisation_division",          "name": "Division of Algebraic Expressions", "difficulty": 0.75},
    ],
    "prerequisites": ["grade7_algebraic_expressions"],
}


def _get_or_create_kc(student: Student, kc_id: str) -> KCMastery:
    obj, _ = KCMastery.objects.get_or_create(
        student=student, kc_id=kc_id,
        defaults={"mastery": 0.30, "attempts": 0}
    )
    return obj


def _kc_model_to_state(kc_obj: KCMastery) -> KCState:
    state = KCState(kc_id=kc_obj.kc_id)
    state.mastery           = kc_obj.mastery
    state.attempts          = kc_obj.attempts
    state.correct_count     = kc_obj.correct_count
    state.wrong_count       = kc_obj.wrong_count
    state.hints_used_total  = kc_obj.hints_used_total
    state.retries_total     = kc_obj.retries_total
    state.consecutive_wrong = kc_obj.consecutive_wrong
    state.last_confidence   = kc_obj.last_confidence
    state.misconception_counts = kc_obj.misconception_counts or {}
    return state


def _award_xp(student: Student, amount: int, badge_kc: str = None):
    student.xp_total += amount
    # Level up every 200 XP
    student.level = max(1, student.xp_total // 200 + 1)
    if badge_kc and badge_kc in BADGES:
        badge = BADGES[badge_kc]
        badge_ids = [b["id"] for b in student.badges]
        if badge["id"] not in badge_ids:
            student.badges = student.badges + [badge]
    student.save()


# ── Merge Team: Chapter Metadata ──────────────────────────────────────────────

@extend_schema(request=ChapterMetadataSerializer, responses={200: ChapterMetadataSerializer})
@api_view(["GET", "POST"])
def chapter_metadata(request):
    """
    GET  → return canonical chapter metadata
    POST → register/update chapter metadata in system
    """
    if request.method == "GET":
        return Response(CHAPTER_METADATA, status=status.HTTP_200_OK)

    serializer = ChapterMetadataSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    obj, created = ChapterMetadata.objects.update_or_create(
        chapter_id=serializer.validated_data["chapter_id"],
        defaults=serializer.validated_data,
    )
    return Response(
        {"status": "registered", "chapter_id": obj.chapter_id, "created": created},
        status=status.HTTP_200_OK,
    )


# ── Merge Team: Session Submit ────────────────────────────────────────────────

@extend_schema(request=SessionSubmitSerializer, responses={200: dict})
@api_view(["POST"])
def session_submit(request):
    """
    Submit session payload to Merge Team.
    Idempotent: same session_id is safe to resend.
    Merge Team owns scoring and recommendations — this API only stores and validates.
    """
    serializer = SessionSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    session_id = data["session_id"]

    # Idempotency: if already submitted, return same success response
    session_qs = Session.objects.filter(session_id=session_id)
    if session_qs.exists():
        session = session_qs.first()
        if session.merge_submitted:
            return Response(
                {"status": "already_submitted", "session_id": session_id},
                status=status.HTTP_200_OK,
            )

    # Find or create student
    student, _ = Student.objects.get_or_create(
        student_id=data["student_id"],
        defaults={"username": data["student_id"]},
    )

    # Update session record
    session, created = Session.objects.update_or_create(
        session_id=session_id,
        defaults={
            "student": student,
            "chapter_id": data["chapter_id"],
            "status": data["session_status"],
            "correct_answers":   data["correct_answers"],
            "wrong_answers":     data["wrong_answers"],
            "questions_attempted": data["questions_attempted"],
            "total_questions":   data["total_questions"],
            "retry_count":       data["retry_count"],
            "hints_used":        data["hints_used"],
            "total_hints_embedded": data["total_hints_embedded"],
            "time_spent_seconds": data["time_spent_seconds"],
            "topic_completion_ratio": data["topic_completion_ratio"],
            "merge_submitted": True,
        },
    )

    return Response(
        {
            "status": "accepted",
            "session_id": session_id,
            "message": "Session data received. Performance scoring done by Merge Team.",
        },
        status=status.HTTP_200_OK,
    )


# ── ITS: Register Student ─────────────────────────────────────────────────────

@api_view(["POST"])
def register_student(request):
    student_id = request.data.get("student_id")
    username   = request.data.get("username", student_id)
    if not student_id:
        return Response({"error": "student_id required"}, status=400)

    student, created = Student.objects.get_or_create(
        student_id=student_id,
        defaults={"username": username},
    )
    return Response(StudentSerializer(student).data, status=200)


# ── ITS: Student Learner State ────────────────────────────────────────────────

@api_view(["GET"])
def student_state(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    return Response(StudentSerializer(student).data)


# ── ITS: Process Answer + BA-BKT Update ──────────────────────────────────────

@api_view(["POST"])
def submit_answer(request):
    """
    Core ITS loop:
    1. Validate answer
    2. Detect misconception
    3. Run BA-BKT update
    4. Apply pedagogical decision
    5. Award XP/badge if KC mastered
    6. Return next action to frontend
    """
    ser = AnswerSubmitSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=400)
    data = ser.validated_data

    student = get_object_or_404(Student, student_id=data["student_id"])
    session = get_object_or_404(Session, session_id=data["session_id"])
    kc_obj  = _get_or_create_kc(student, data["kc_id"])
    kc_state = _kc_model_to_state(kc_obj)

    # ── Misconception detection ───────────────────────────────────────────────
    misc_result = detect_misconception(
        data["student_answer"],
        data["correct_answer"],
        data.get("question_meta", {}),
    )
    misc_severity = get_misconception_severity(misc_result)

    # ── BA-BKT update ─────────────────────────────────────────────────────────
    obs = BKTObservation(
        is_correct=data["is_correct"],
        hints_used=data["hints_used"],
        max_hints=data["max_hints"],
        response_time_s=data["response_time_s"],
        t_min=data.get("t_min", 10.0),
        t_max=data.get("t_max", 90.0),
        confidence=data["confidence"],
        retry_count=data["retry_count"],
        misconception_severity=misc_severity,
    )
    bkt_result = kc_state.record_attempt(obs)

    # ── Persist KC state ──────────────────────────────────────────────────────
    kc_obj.mastery           = kc_state.mastery
    kc_obj.attempts          = kc_state.attempts
    kc_obj.correct_count     = kc_state.correct_count
    kc_obj.wrong_count       = kc_state.wrong_count
    kc_obj.hints_used_total  = kc_state.hints_used_total
    kc_obj.retries_total     = kc_state.retries_total
    kc_obj.consecutive_wrong = kc_state.consecutive_wrong
    kc_obj.last_confidence   = data["confidence"]
    if misc_result.bug_id:
        counts = kc_obj.misconception_counts or {}
        counts[misc_result.bug_id] = counts.get(misc_result.bug_id, 0) + 1
        kc_obj.misconception_counts = counts
    kc_obj.save()

    # ── Pedagogical decision ──────────────────────────────────────────────────
    mastered_kcs = set(
        Student.objects.get(student_id=data["student_id"])
        .kc_states.filter(mastery__gte=MASTERY_THRESHOLD)
        .values_list("kc_id", flat=True)
    )
    ped_decision = decide(
        kc_state=kc_state,
        last_correct=data["is_correct"],
        last_confidence=data["confidence"],
        mastered_kcs=mastered_kcs,
    )

    # ── Gamification ──────────────────────────────────────────────────────────
    xp_earned = 0
    new_badge  = None
    if data["is_correct"]:
        xp_earned += XP_CORRECT
        if data["hints_used"] == 0:
            xp_earned += XP_CORRECT_BONUS  # perfect answer bonus
    if bkt_result.mastered and data["kc_id"] not in mastered_kcs:
        xp_earned += XP_MASTERY_BADGE
        new_badge = BADGES.get(data["kc_id"])

    _award_xp(student, xp_earned, badge_kc=data["kc_id"] if bkt_result.mastered else None)

    # ── Log attempt ──────────────────────────────────────────────────────────
    QuestionAttempt.objects.create(
        session=session,
        question_id=data["question_id"],
        kc_id=data["kc_id"],
        student_answer=data["student_answer"],
        is_correct=data["is_correct"],
        hints_used=data["hints_used"],
        response_time_s=data["response_time_s"],
        confidence=data["confidence"],
        retry_count=data["retry_count"],
        misconception_bug_id=misc_result.bug_id,
        mastery_before=bkt_result.mastery_before,
        mastery_after=bkt_result.mastery_after,
        bkt_w_behaviour=bkt_result.w_behaviour,
    )

    # ── Update session counters ───────────────────────────────────────────────
    if data["is_correct"]:
        session.correct_answers += 1
    else:
        session.wrong_answers += 1
    session.questions_attempted = min(
        session.questions_attempted + 1, session.total_questions
    )
    session.hints_used  += data["hints_used"]
    session.retry_count += data["retry_count"]
    session.save()

    return Response({
        "bkt": {
            "mastery_before":   round(bkt_result.mastery_before, 4),
            "mastery_after":    round(bkt_result.mastery_after, 4),
            "delta_applied":    round(bkt_result.delta_applied, 4),
            "w_behaviour":      round(bkt_result.w_behaviour, 4),
            "mastered":         bkt_result.mastered,
        },
        "misconception": {
            "detected": misc_result.detected,
            "bug_id":   misc_result.bug_id,
            "bug_name": misc_result.bug_name,
            "severity": misc_result.severity,
            "feedback": misc_result.feedback,
        },
        "pedagogy": {
            "action":            ped_decision.action,
            "reason":            ped_decision.reason,
            "target_kc":         ped_decision.target_kc,
            "difficulty_level":  ped_decision.difficulty_level,
            "hint_strategy":     ped_decision.hint_strategy,
            "show_remediation":  ped_decision.show_remediation,
            "remediation_type":  ped_decision.remediation_type,
            "next_kc_id":        ped_decision.next_kc_id,
        },
        "gamification": {
            "xp_earned":  xp_earned,
            "xp_total":   student.xp_total,
            "level":      student.level,
            "new_badge":  new_badge,
        },
    })


# ── ITS: Leaderboard ─────────────────────────────────────────────────────────

@api_view(["GET"])
def leaderboard(request):
    top_students = Student.objects.order_by("-xp_total")[:20]
    data = [
        {
            "rank":       i + 1,
            "student_id": s.student_id,
            "username":   s.username,
            "xp_total":   s.xp_total,
            "level":      s.level,
            "badges_count": len(s.badges),
        }
        for i, s in enumerate(top_students)
    ]
    return Response(data)


# ── ITS: Analytics ────────────────────────────────────────────────────────────

@api_view(["GET"])
def student_analytics(request, student_id):
    student = get_object_or_404(Student, student_id=student_id)
    kc_states = KCMastery.objects.filter(student=student).order_by("kc_id")

    kc_data = []
    for kc in kc_states:
        accuracy = kc.correct_count / kc.attempts if kc.attempts > 0 else 0
        kc_data.append({
            "kc_id":           kc.kc_id,
            "mastery":         round(kc.mastery, 3),
            "accuracy":        round(accuracy, 3),
            "attempts":        kc.attempts,
            "hints_used":      kc.hints_used_total,
            "is_mastered":     kc.mastery >= MASTERY_THRESHOLD,
            "misconceptions":  kc.misconception_counts,
        })

    sessions = Session.objects.filter(student=student).order_by("started_at")
    session_data = [
        {
            "session_id":     str(s.session_id),
            "status":         s.status,
            "accuracy":       round(s.correct_answers / max(s.questions_attempted, 1), 3),
            "topic_completion": s.topic_completion_ratio,
            "time_spent_s":   s.time_spent_seconds,
            "started_at":     s.started_at.isoformat() if s.started_at else None,
        }
        for s in sessions
    ]

    return Response({
        "student_id":    student_id,
        "xp_total":      student.xp_total,
        "level":         student.level,
        "badges":        student.badges,
        "kc_mastery":    kc_data,
        "session_history": session_data,
        "overall_mastery": round(
            sum(k["mastery"] for k in kc_data) / max(len(kc_data), 1), 3
        ),
    })


# ── ITS: Session start/end ────────────────────────────────────────────────────

@api_view(["POST"])
def start_session(request):
    student_id = request.data.get("student_id")
    student = get_object_or_404(Student, student_id=student_id)
    session = Session.objects.create(student=student)
    return Response({"session_id": str(session.session_id)})


@api_view(["POST"])
def end_session(request):
    """Called on chapter completion or confirmed exit."""
    session_id   = request.data.get("session_id")
    session_status = request.data.get("status", "exited_midway")
    time_spent   = request.data.get("time_spent_seconds", 0)

    session = get_object_or_404(Session, session_id=session_id)
    session.status = session_status
    session.time_spent_seconds = time_spent
    session.ended_at = datetime.now(timezone.utc)

    # Compute topic_completion_ratio from KC mastery
    student  = session.student
    total_kcs = 9
    mastered  = student.kc_states.filter(mastery__gte=MASTERY_THRESHOLD).count()
    session.topic_completion_ratio = round(mastered / total_kcs, 3)
    session.save()

    return Response({
        "session_id": str(session.session_id),
        "status": session.status,
        "topic_completion_ratio": session.topic_completion_ratio,
        "merge_payload": session.build_merge_payload(
            timestamp_utc=datetime.now(timezone.utc).isoformat()
        ),
    })
