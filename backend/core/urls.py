from django.urls import path
from . import views

urlpatterns = [
    # ── Merge Team APIs ────────────────────────────────────────────────────
    path("chapter-metadata/",   views.chapter_metadata, name="chapter-metadata"),
    path("session-submit/",     views.session_submit,   name="session-submit"),

    # ── ITS APIs ──────────────────────────────────────────────────────────
    path("student/",                    views.register_student, name="register-student"),
    path("student/<str:student_id>/",   views.student_state,    name="student-state"),
    path("answer/",                     views.submit_answer,    name="submit-answer"),
    path("session/start/",              views.start_session,    name="start-session"),
    path("session/end/",                views.end_session,      name="end-session"),
    path("leaderboard/",                views.leaderboard,      name="leaderboard"),
    path("analytics/<str:student_id>/", views.student_analytics, name="analytics"),
]
