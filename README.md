# Ticketing System - AI Agent / Sub-Agent Demo Project

This repository is intentionally built as a **testing ground for AI agents and sub-agents** (Hermes + OpenCode).  
The project showcases delegation patterns, parallel implementation, backend/frontend separation, and end-to-end CRUD workflow.

## Purpose

- Validate multi-agent orchestration (Hermes for frontend, OpenCode for backend).
- Test Kanban/task dispatch, background jobs, and long-running servers.
- Practice real-world full-stack features: health checks, ticket CRUD, API schema, UI rebuild, and styling fixes.

## Tech Stack

- **Backend**: Django + Django REST Framework + `drf-spectacular`, managed with `uv`
- **Frontend**: React + Vite + Tailwind CSS, managed with `bun`
- **Storage**: SQLite (dev)
- **API Docs**: Scalar (`/api/docs/`)

## Project Structure

```text
ticketing-system/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   └── backend/
│   └── manage.py
├── frontend/
│   ├── src/
│   └── vite.config.js
└── README.md
```

## Setup

### Backend

```bash
cd backend
uv sync
uv run python manage.py migrate
uv run python manage.py runserver 8000
```

### Frontend

```bash
cd frontend
bun install
bun run dev
```

## Endpoints

- `GET /health/` — health check
- `/api/tickets/` — list/create
- `/api/tickets/{id}/` — retrieve/update/delete
- `/api/docs/` — Scalar API reference
- Frontend UI: `http://localhost:5173/`

## Agent Notes

This project was assembled with multiple sub-agents working in parallel, simulating a real automated development workflow.
