from django.db import models
import uuid


class Student(models.Model):
    student_id = models.CharField(max_length=100, unique=True)
    username   = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    # Gamification
    xp_total   = models.IntegerField(default=0)
    level      = models.IntegerField(default=1)
    badges     = models.JSONField(default=list)   # list of badge IDs earned

    class Meta:
        db_table = "students"

    def __str__(self):
        return f"{self.username} ({self.student_id})"


class KCMastery(models.Model):
    """Per-student, per-KC mastery record."""
    student    = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="kc_states")
    kc_id      = models.CharField(max_length=20)   # KC-01 … KC-09
    mastery    = models.FloatField(default=0.30)
    attempts   = models.IntegerField(default=0)
    correct_count  = models.IntegerField(default=0)
    wrong_count    = models.IntegerField(default=0)
    hints_used_total = models.IntegerField(default=0)
    retries_total  = models.IntegerField(default=0)
    consecutive_wrong = models.IntegerField(default=0)
    last_confidence   = models.CharField(max_length=10, default="medium")
    misconception_counts = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "kc_mastery"
        unique_together = ("student", "kc_id")


class Session(models.Model):
    """
    One learning session (chapter open → complete/exit).
    Merge Team compliant session payload is built from this.
    """
    STATUS_CHOICES = [("completed", "Completed"), ("exited_midway", "Exited Midway")]

    session_id   = models.CharField(max_length=200, unique=True, default=uuid.uuid4)
    student      = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="sessions")
    chapter_id   = models.CharField(max_length=100, default="grade8_factorisation")
    started_at   = models.DateTimeField(auto_now_add=True)
    ended_at     = models.DateTimeField(null=True, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="exited_midway")

    # Merge Team metrics
    correct_answers   = models.IntegerField(default=0)
    wrong_answers     = models.IntegerField(default=0)
    questions_attempted = models.IntegerField(default=0)
    total_questions   = models.IntegerField(default=45)   # full question bank
    retry_count       = models.IntegerField(default=0)
    hints_used        = models.IntegerField(default=0)
    total_hints_embedded = models.IntegerField(default=135)  # 45q × 3 hints
    time_spent_seconds = models.IntegerField(default=0)
    topic_completion_ratio = models.FloatField(default=0.0)

    # ITS extra metrics
    current_kc   = models.CharField(max_length=20, default="KC-01")
    merge_submitted = models.BooleanField(default=False)

    class Meta:
        db_table = "sessions"

    def build_merge_payload(self, timestamp_utc: str) -> dict:
        """Build Merge Team compliant session payload."""
        return {
            "student_id":            self.student.student_id,
            "session_id":            str(self.session_id),
            "chapter_id":            self.chapter_id,
            "timestamp":             timestamp_utc,
            "session_status":        self.status,
            "correct_answers":       self.correct_answers,
            "wrong_answers":         self.wrong_answers,
            "questions_attempted":   self.questions_attempted,
            "total_questions":       self.total_questions,
            "retry_count":           self.retry_count,
            "hints_used":            self.hints_used,
            "total_hints_embedded":  self.total_hints_embedded,
            "time_spent_seconds":    self.time_spent_seconds,
            "topic_completion_ratio": self.topic_completion_ratio,
        }

    def validate_sanity(self) -> list[str]:
        """Merge Team sanity checks. Returns list of violations (empty = clean)."""
        errors = []
        total = self.correct_answers + self.wrong_answers
        if total > self.questions_attempted:
            errors.append("correct + wrong > attempted")
        if self.questions_attempted > self.total_questions:
            errors.append("attempted > total")
        if self.hints_used > self.total_hints_embedded:
            errors.append("hints_used > total_hints_embedded")
        if not (0 <= self.topic_completion_ratio <= 1):
            errors.append("topic_completion_ratio out of [0,1]")
        return errors


class QuestionAttempt(models.Model):
    """Individual question attempt log."""
    session       = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="attempts")
    question_id   = models.CharField(max_length=50)
    kc_id         = models.CharField(max_length=20)
    attempt_number = models.IntegerField(default=1)
    student_answer = models.TextField()
    is_correct    = models.BooleanField()
    hints_used    = models.IntegerField(default=0)
    hint_level_reached = models.IntegerField(default=0)
    response_time_s = models.FloatField(default=0)
    confidence    = models.CharField(max_length=10, default="medium")
    retry_count   = models.IntegerField(default=0)
    misconception_bug_id = models.CharField(max_length=20, null=True, blank=True)
    mastery_before = models.FloatField(default=0)
    mastery_after  = models.FloatField(default=0)
    bkt_w_behaviour = models.FloatField(default=1.0)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "question_attempts"


class ChapterMetadata(models.Model):
    """Merge Team chapter metadata record."""
    chapter_id   = models.CharField(max_length=100, unique=True)
    grade        = models.IntegerField()
    chapter_name = models.CharField(max_length=200)
    chapter_url  = models.CharField(max_length=500)
    chapter_difficulty = models.FloatField()
    expected_completion_time_seconds = models.IntegerField()
    subtopics    = models.JSONField(default=list)
    prerequisites = models.JSONField(default=list)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chapter_metadata"
