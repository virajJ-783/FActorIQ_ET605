# FactorIQ — Intelligent Tutoring System for Factorisation
### NCERT Class 8 Mathematics · Chapter 12
### Adaptive ITS using Behaviour-Adaptive Bayesian Knowledge Tracing

---

## 📐 Architecture Overview

```
Student ──── React Frontend ──────────────── Intelligent Core
               (Vite + Tailwind)          ┌─ Domain Model (9 KCs, Dependency Graph)
                    │                     ├─ Learner Model (BA-BKT per KC)
                    │ REST API            └─ Pedagogical Engine (5-priority rules)
                    │
              Django/DRF Backend ─────────── Merge Team APIs
                    │                           POST /api/chapter-metadata/
                    └── SQLite / PostgreSQL      POST /api/session-submit/
```

---

## 🧠 Knowledge Components (KC-01 → KC-09)

| KC    | Name                              | Dependency    |
|-------|-----------------------------------|---------------|
| KC-01 | Identify Algebraic Terms          | —             |
| KC-02 | Detect Common Factors             | KC-01         |
| KC-03 | Apply Distributive Law (Reverse)  | KC-01, KC-02  |
| KC-04 | Common Factor Method              | KC-01..KC-03  |
| KC-05 | Factorisation by Regrouping       | KC-04         |
| KC-06 | Recognise Algebraic Identities    | KC-04         |
| KC-07 | Apply Identities for Factorisation| KC-06         |
| KC-08 | Factorise Quadratic Expressions   | KC-04, KC-07  |
| KC-09 | Factorisation for Division        | KC-04..KC-08  |

---

## 📊 BA-BKT Engine (Behaviour-Adaptive BKT)

From `Formula_for_updating_state.pdf`:

```
ΔBase = +α (correct) or −β (incorrect)    α=0.10, β=0.12

W_behaviour = f_hints^0.25 · f_time^0.20 · f_confidence^0.20
            · f_retries^0.15 · f_misconception^0.20

Δ = ΔBase × W_behaviour
M_new = clip(M_old + Δ, 0, 1)

Advancement threshold: M ≥ 0.85
```

Factor functions:
- **f_hints**: 1 − hints_used/max_hints
- **f_time**: 0.6 (too fast) | 1.0 (productive) | 0.7 (too slow)
- **f_confidence**: matrix of (correct/incorrect) × (low/medium/high)
- **f_retries**: 1 / (1 + retry_count)
- **f_misconception**: 1.0 | 0.7 (minor) | 0.4 (major)

---

## 🎯 Pedagogical Engine — Priority Order (STRICT)

1. `consecutive_wrong ≥ 2` → **remediate** (detailed hints + worked example)
2. `wrong + high confidence` → **remediate** (misconception repair)
3. `correct + low confidence` → **repeat** (verify — lucky guess?)
4. `mastery < 0.85` → **repeat** (difficulty calibrated to mastery)
5. `mastery ≥ 0.85` → **advance** to next KC

---

## 🐛 Misconception Detection (5 Buggy Rules)

| ID     | Name                        | KC    | Severity |
|--------|-----------------------------|-------|----------|
| BUG_01 | Identity Misuse (no 2ab)    | KC-06 | Major    |
| BUG_02 | Coefficient Not Divided     | KC-04 | Minor    |
| BUG_03 | Sign Confusion in Quadratic | KC-08 | Major    |
| BUG_04 | Invalid Regrouping          | KC-05 | Minor    |
| BUG_05 | Wrong Middle-Term Split     | KC-08 | Major    |
| BUG_06 | Incomplete Factorisation    | KC-07 | Minor    |
| BUG_07 | (a−b)² vs a²−b² confusion   | KC-06 | Major    |
| BUG_08 | Variable HCF Missed         | KC-04 | Minor    |

---

## 📡 Merge Team APIs

### POST /api/chapter-metadata/
```json
{
  "grade": 8,
  "chapter_name": "Factorisation",
  "chapter_id": "grade8_factorisation",
  "chapter_url": "/chapter/grade8_factorisation",
  "chapter_difficulty": 0.62,
  "expected_completion_time_seconds": 5400,
  "subtopics": [
    { "subtopic_id": "grade8_factorisation_common_factor", "name": "Common Factor Method", "difficulty": 0.45 }
  ],
  "prerequisites": ["grade7_algebraic_expressions"]
}
```

### POST /api/session-submit/
```json
{
  "student_id": "student_1042",
  "session_id": "s_1042_g8fact_001",
  "chapter_id": "grade8_factorisation",
  "timestamp": "2026-03-28T10:30:00Z",
  "session_status": "completed",
  "correct_answers": 12,
  "wrong_answers": 3,
  "questions_attempted": 15,
  "total_questions": 45,
  "retry_count": 4,
  "hints_used": 6,
  "total_hints_embedded": 135,
  "time_spent_seconds": 1800,
  "topic_completion_ratio": 0.60
}
```

**Validation Rules:**
- `correct + wrong ≤ attempted ≤ total`
- `hints_used ≤ total_hints_embedded`
- `topic_completion_ratio ∈ [0, 1]`
- Same `session_id` → idempotent (safe to resend)
- Merge Team computes scoring & recommendations — NOT this system

---

## 🎮 Gamification

| Event               | XP   |
|---------------------|------|
| Correct answer      | +10  |
| No hints used       | +5   |
| KC mastery badge    | +50  |

Level up every 200 XP. 9 KC badges total.

**Game Modes:**
- **☔ Raindrops** — Expressions fall, factorise before they hit the ground. Adaptive speed.
- **🏎️ Speedrun** — Accuracy drives car speed. 3-streak = Turbo mode (60s race).

---

## 🚀 Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations core
python manage.py migrate
python manage.py runserver
```

API docs: http://localhost:8000/api/docs/

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## 📁 File Structure

```
its-factorisation/
├── backend/
│   ├── its_backend/
│   │   ├── settings.py          Django settings
│   │   └── urls.py              Root URL router
│   ├── core/
│   │   ├── bkt_engine.py        ★ BA-BKT engine (exact formulas)
│   │   ├── misconception_engine.py  ★ Buggy rule detection
│   │   ├── pedagogical_engine.py    ★ 5-priority decision engine
│   │   ├── models.py            DB models (Student, KC, Session, Attempt)
│   │   ├── serializers.py       DRF serializers + Merge Team validation
│   │   ├── views.py             All API views
│   │   └── urls.py              API routes
│   ├── curriculum/
│   │   └── seed_data.json       ★ Full NCERT curriculum + 20+ questions
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx          Auth + student registration
        │   ├── Dashboard.jsx      KC mastery overview + XP/badges
        │   ├── ChapterPage.jsx    ★ Main ITS learning loop
        │   ├── Analytics.jsx      Radar + bar charts, KC breakdown
        │   ├── Leaderboard.jsx    XP rankings
        │   └── Games.jsx          Game mode hub
        ├── components/games/
        │   ├── Raindrops.jsx      ★ Canvas falling-expression game
        │   └── Speedrun.jsx       ★ Canvas car-racing accuracy game
        ├── store/
        │   └── useStore.js        Zustand global state + session mgmt
        └── utils/
            ├── api.js             Axios instance
            └── questionBank.js    ★ Local question bank + adaptive selector
```

---

## 🧪 Testing Key Flows

```bash
# Register student
curl -X POST http://localhost:8000/api/student/ \
  -H "Content-Type: application/json" \
  -d '{"student_id":"student_1042","username":"Priya"}'

# Get chapter metadata
curl http://localhost:8000/api/chapter-metadata/

# Submit session (Merge Team)
curl -X POST http://localhost:8000/api/session-submit/ \
  -H "Content-Type: application/json" \
  -d '{"student_id":"student_1042","session_id":"s001","chapter_id":"grade8_factorisation","timestamp":"2026-03-28T10:00:00Z","session_status":"completed","correct_answers":8,"wrong_answers":2,"questions_attempted":10,"total_questions":45,"retry_count":1,"hints_used":3,"total_hints_embedded":135,"time_spent_seconds":900,"topic_completion_ratio":0.33}'

# Get analytics
curl http://localhost:8000/api/analytics/student_1042/
```

---

## 📚 References

- NCERT Mathematics Class 8, Chapter 12: Factorisation
- ITS Architecture slides: `Factorisation_slides__1_.pdf`
- BA-BKT formulas: `Formula_for_updating_state.pdf`
- Domain model: `Factorization_Domain_Model.docx`
- Merge Team integration: Quick Integration Guide
