from django.contrib import admin
from .models import Student, KCMastery, Session, QuestionAttempt, ChapterMetadata

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('username', 'student_id', 'level', 'xp_total')

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'student', 'status', 'time_spent_seconds', 'current_kc')
    list_filter = ('status', 'current_kc')

@admin.register(KCMastery)
class KCMasteryAdmin(admin.ModelAdmin):
    list_display = ('student', 'kc_id', 'mastery', 'attempts', 'consecutive_wrong')
    list_filter = ('kc_id',)

@admin.register(QuestionAttempt)
class QuestionAttemptAdmin(admin.ModelAdmin):
    list_display = ('session', 'question_id', 'is_correct', 'response_time_s', 'confidence', 'misconception_bug_id')
    list_filter = ('is_correct', 'kc_id', 'confidence')

admin.site.register(ChapterMetadata)