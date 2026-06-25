# LLM Arbitrator

A multi-agent system that evaluates LLM-generated text quality using three parallel AI critics and a synthesizer that produces a final confidence-scored verdict.

**Demo**

https://github.com/user-attachments/assets/e1b0dd30-f8fc-4417-8c73-a96bc2b9518e

---

## How it works

```
                     ┌─────────────┐
                     │  Input Text │
                     └──────┬──────┘
                            │  LangGraph Send() API — parallel fan-out
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       ┌────────────┐ ┌──────────┐ ┌──────────────┐
       │  Accuracy  │ │  Logic   │ │ Completeness │
       │   Critic   │ │  Critic  │ │    Critic    │
       └─────┬──────┘ └────┬─────┘ └──────┬───────┘
             └─────────────┴──────────────┘
                            │  Annotated[List, operator.add] reducer merges results
                            ▼
                    ┌──────────────┐
                    │  Synthesizer │  (Claude Sonnet)
                    └──────┬───────┘
                            ▼
                    ┌──────────────┐
                    │   Verdict    │  score / recommendation / key issues
                    └──────────────┘
```

- **3 critics run in parallel** via LangGraph's `Send()` API — no sequential waiting
- Each critic uses `with_structured_output()` to return typed `CritiqueOutput` (score 1–5, issues with quotes + severity, reasoning)
- The **synthesizer** sees all 3 critiques and produces a 0–100 score with `approved / review_needed / rejected` recommendation
- Results are stored in PostgreSQL and browsable in the History tab

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), Tailwind v4, TypeScript |
| Backend | FastAPI, async SQLAlchemy, asyncpg |
| AI / Agents | LangGraph, LangChain, Claude Haiku + Sonnet |
| Local models | Ollama (llama3.1) |
| Database | PostgreSQL 16 |
| Infrastructure | Docker Compose |

---

## Features

- **Dark / light mode** — persisted to localStorage, no flash on load
- **EN / JP language toggle** — full Japanese UI
- **Cloud mode** — Claude Haiku for critics, Claude Sonnet for synthesis (Anthropic API key required)
- **Local mode** — llama3.1 via Ollama, fully private, no API costs
- **Arbitration history** — all past runs stored in Postgres, browsable with scores

---

## Quick start (Docker Compose)

```bash
# 1. Clone
git clone https://github.com/likhita24/llm-arbitrator.git
cd llm-arbitrator

# 2. Add your Anthropic API key
cp .env.example .env
# edit .env — set ANTHROPIC_API_KEY

# 3. Start everything
docker compose up

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000/api/health
```

> **Local mode (Ollama):** Install [Ollama](https://ollama.com), run `ollama pull llama3.1`, then toggle "Local" in the UI. No API key needed.

---

## Local dev (without Docker)

**Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in values
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev   # http://localhost:3000
```

**Database** — PostgreSQL must be running locally on port 5432 with a database named `arbitrator`.

---

## Project structure

```
llm-arbitrator/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── critics.py       # parallel critic nodes (accuracy / logic / completeness)
│   │   │   └── synthesizer.py   # synthesizer node
│   │   ├── graph/
│   │   │   └── arbitration.py   # LangGraph StateGraph definition
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic schemas (CritiqueOutput, VerdictOutput)
│   │   ├── db/
│   │   │   └── database.py      # async SQLAlchemy + ORM models
│   │   ├── config.py            # pydantic-settings
│   │   └── main.py              # FastAPI routes
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # main arbitration page
│   │   ├── history/page.tsx     # history browser
│   │   ├── layout.tsx           # root layout with providers
│   │   └── globals.css          # CSS custom properties + dark/light themes
│   ├── components/
│   │   ├── ArbitrationForm.tsx
│   │   ├── VerdictCard.tsx
│   │   ├── CriticCard.tsx
│   │   └── Navbar.tsx
│   ├── contexts/
│   │   ├── ThemeContext.tsx      # dark/light mode
│   │   └── LangContext.tsx      # EN/JP translations
│   └── types/index.ts
├── demo/
│   └── arbitrator_demo.mp4
├── docker-compose.yml
└── .env.example
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | Required for cloud mode |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama endpoint |
| `OLLAMA_MODEL` | `llama3.1` | Local model name |
| `CRITIC_MODEL_CLOUD` | `claude-haiku-4-5-20251001` | Model for the 3 critics |
| `SYNTHESIZER_MODEL_CLOUD` | `claude-sonnet-4-6` | Model for final synthesis |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Postgres connection string |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |




