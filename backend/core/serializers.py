from rest_framework import serializers
from .models import Student, KCMastery, Session, QuestionAttempt, ChapterMetadata


# ── Merge Team APIs ────────────────────────────────────────────────────────────

class SubtopicSerializer(serializers.Serializer):
    subtopic_id = serializers.CharField()
    name        = serializers.CharField()
    difficulty  = serializers.FloatField(min_value=0, max_value=1)


class ChapterMetadataSerializer(serializers.ModelSerializer):
    subtopics    = SubtopicSerializer(many=True)
    prerequisites = serializers.ListField(child=serializers.CharField(), allow_empty=True)

    class Meta:
        model  = ChapterMetadata
        fields = [
            "grade", "chapter_name", "chapter_id", "chapter_url",
            "chapter_difficulty", "expected_completion_time_seconds",
            "subtopics", "prerequisites",
        ]

    def validate_grade(self, v):
        if v not in (6, 7, 8):
            raise serializers.ValidationError("grade must be 6, 7, or 8")
        return v

    def validate_chapter_difficulty(self, v):
        if not (0 <= v <= 1):
            raise serializers.ValidationError("chapter_difficulty must be in [0, 1]")
        return v


class SessionSubmitSerializer(serializers.Serializer):
    student_id      = serializers.CharField()
    session_id      = serializers.CharField()
    chapter_id      = serializers.CharField()
    timestamp       = serializers.DateTimeField()
    session_status  = serializers.ChoiceField(choices=["completed", "exited_midway"])
    correct_answers = serializers.IntegerField(min_value=0)
    wrong_answers   = serializers.IntegerField(min_value=0)
    questions_attempted   = serializers.IntegerField(min_value=0)
    total_questions       = serializers.IntegerField(min_value=0)
    retry_count           = serializers.IntegerField(min_value=0)
    hints_used            = serializers.IntegerField(min_value=0)
    total_hints_embedded  = serializers.IntegerField(min_value=0)
    time_spent_seconds    = serializers.IntegerField(min_value=0)
    topic_completion_ratio = serializers.FloatField(min_value=0, max_value=1)

    def validate(self, data):
        # Merge Team sanity checks
        ca = data["correct_answers"]
        wa = data["wrong_answers"]
        qa = data["questions_attempted"]
        tq = data["total_questions"]
        hu = data["hints_used"]
        th = data["total_hints_embedded"]
        errors = []
        if ca + wa > qa:
            errors.append("correct_answers + wrong_answers must be ≤ questions_attempted")
        if qa > tq:
            errors.append("questions_attempted must be ≤ total_questions")
        if hu > th:
            errors.append("hints_used must be ≤ total_hints_embedded")
        if errors:
            raise serializers.ValidationError(errors)
        return data


# ── ITS APIs ───────────────────────────────────────────────────────────────────

class AnswerSubmitSerializer(serializers.Serializer):
    student_id      = serializers.CharField()
    session_id      = serializers.CharField()
    question_id     = serializers.CharField()
    kc_id           = serializers.CharField()
    student_answer  = serializers.CharField()
    correct_answer  = serializers.CharField()
    is_correct      = serializers.BooleanField()
    hints_used      = serializers.IntegerField(min_value=0, default=0)
    max_hints       = serializers.IntegerField(min_value=1, default=3)
    response_time_s = serializers.FloatField(min_value=0)
    confidence      = serializers.ChoiceField(choices=["low", "medium", "high"])
    retry_count     = serializers.IntegerField(min_value=0, default=0)
    t_min           = serializers.FloatField(default=10.0)
    t_max           = serializers.FloatField(default=90.0)
    question_meta   = serializers.DictField(default=dict)


class KCMasterySerializer(serializers.ModelSerializer):
    class Meta:
        model  = KCMastery
        fields = [
            "kc_id", "mastery", "attempts", "correct_count",
            "wrong_count", "hints_used_total", "consecutive_wrong",
        ]


class StudentSerializer(serializers.ModelSerializer):
    kc_states = KCMasterySerializer(many=True, read_only=True)

    class Meta:
        model  = Student
        fields = ["student_id", "username", "xp_total", "level", "badges", "kc_states"]


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Session
        fields = "__all__"
