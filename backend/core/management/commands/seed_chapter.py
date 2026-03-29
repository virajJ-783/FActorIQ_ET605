"""
python manage.py seed_chapter

Seeds the canonical chapter metadata into the DB and prints
the Merge Team compliant chapter-metadata payload for verification.
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand
from core.models import ChapterMetadata


CHAPTER = {
    "grade": 8,
    "chapter_name": "Factorisation",
    "chapter_id": "grade8_factorisation",
    "chapter_url": "/chapter/grade8_factorisation",
    "chapter_difficulty": 0.62,
    "expected_completion_time_seconds": 5400,
    "subtopics": [
        {"subtopic_id": "grade8_factorisation_algebraic_terms",
         "name": "Factors of Algebraic Expressions", "difficulty": 0.30},
        {"subtopic_id": "grade8_factorisation_common_factor",
         "name": "Common Factor Method", "difficulty": 0.45},
        {"subtopic_id": "grade8_factorisation_regrouping",
         "name": "Factorisation by Regrouping", "difficulty": 0.55},
        {"subtopic_id": "grade8_factorisation_identities",
         "name": "Using Algebraic Identities", "difficulty": 0.65},
        {"subtopic_id": "grade8_factorisation_quadratic",
         "name": "Quadratic Factorisation", "difficulty": 0.72},
        {"subtopic_id": "grade8_factorisation_division",
         "name": "Division of Algebraic Expressions", "difficulty": 0.75},
    ],
    "prerequisites": ["grade7_algebraic_expressions"],
}


class Command(BaseCommand):
    help = "Seed canonical chapter metadata and print Merge Team payload"

    def handle(self, *args, **options):
        obj, created = ChapterMetadata.objects.update_or_create(
            chapter_id=CHAPTER["chapter_id"],
            defaults=CHAPTER,
        )
        verb = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(
            f"{verb} chapter metadata: {obj.chapter_id}"
        ))

        self.stdout.write("\n── Merge Team Payload Preview ──────────────────────\n")
        self.stdout.write(json.dumps(CHAPTER, indent=2))
        self.stdout.write("\n\nSanity checks:")
        for sub in CHAPTER["subtopics"]:
            d = sub["difficulty"]
            assert 0 <= d <= 1, f"difficulty out of range: {sub}"
        assert 6 <= CHAPTER["grade"] <= 8, "grade must be 6-8"
        assert 0 <= CHAPTER["chapter_difficulty"] <= 1
        self.stdout.write(self.style.SUCCESS("  ✓ All fields valid"))
