![alt text](image.png)# 🛡️ TraumaGuard AI — Multilingual Clinical Trauma & Mental Health Stabilization Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Django](https://img.shields.io/badge/Django-4.2+-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ReportLab](https://img.shields.io/badge/PDF_Engine-ReportLab-FF6F00?logo=adobe-acrobat-reader&logoColor=white)](https://www.reportlab.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**TraumaGuard AI** is a complete, full-stack, trauma-informed digital health platform engineered for acute distress monitoring, somatic autonomic de-escalation, 24/7 crisis dispatching, clinical ReportLab PDF generation, psychiatric specialist consultation scheduling, multimodal AI triage, and high-concurrency database storage (with automatic embedded SQLite fallback and PostgreSQL/Supabase integration).

---

## 📑 Detailed Table of Contents

1. [Project Overview & Core Mission](#-1-project-overview--core-mission)
2. [Pin-to-Pin Project Directory Structure](#-2-pin-to-pin-project-directory-structure)
3. [Full Technology Stack & Libraries](#-3-full-technology-stack--libraries)
4. [Database Schemas & Tables](#-4-database-schemas--tables)
5. [Clinical AI Intent Engines & Trigger Sentences](#-5-clinical-ai-intent-engines--trigger-sentences)
6. [Frontend Architecture & TanStack Routes](#-6-frontend-architecture--tanstack-routes)
7. [API Specifications (FastAPI vs Django)](#-7-api-specifications-fastapi-vs-django)
8. [Clinical PDF Generation Engine](#-8-clinical-pdf-generation-engine)
9. [Installation, Configuration & Running Instructions](#-9-installation-configuration--running-instructions)
10. [Medical & Regulatory Disclaimer](#-10-medical--regulatory-disclaimer)

---

## 🏥 1. Project Overview & Core Mission

TraumaGuard AI bridges the gap between acute psychological trauma incidents (accidents, panic attacks, severe stress spikes) and professional psychiatric care:
- **Instant Autonomic Stabilization**: Somatic exercise visualizers (4-4-4-4 Box Breathing, 5-4-3-2-1 Sensory Grounding).
- **Longitudinal Distress Tracking**: Recording distress indices (0-100) with emotion tags and clinical trigger journals.
- **Fail-Safe Crisis Dispatch**: One-tap Emergency SOS logging live GPS coordinate telemetries.
- **Clinician-Ready Documentation**: Clinical Summary PDFs detailing trajectory metrics and doctor sign-off blocks.
- **Specialist Care Coordination**: Searchable directories of psychiatrists and clinical psychologists with booking schedulers.

---

## 📁 2. Pin-to-Pin Project Directory Structure

```
traumaguard-main-006/
│
├── main.py                           # [FASTAPI CORE] Primary FastAPI server serving REST APIs
├── database.py                       # [DB LAYER] Connection pooling & unified PostgreSQL/SQLite fallback engine
├── view_db.py                        # [DB UTILS] CLI script to inspect and view SQLite database tables
├── supabase_schema.sql               # [SUPABASE SCHEMA] SQL script for Supabase/PostgreSQL schema setup
├── requirements.txt                  # Python dependencies (FastAPI, psycopg2-binary, ReportLab, etc.)
├── docker-compose.yml                # Docker orchestrations for Postgres, Django, and React
├── .env                              # Backend configuration, DB connection URL, credentials
├── README.md                         # Master comprehensive documentation (this file)
│
├── backend/                          # [DJANGO BACKEND] Secondary Django REST Framework Service
│   ├── manage.py                     # Django project management script
│   ├── requirements.txt              # Django-specific Python packages
│   ├── Dockerfile                    # Containerization script for Django backend
│   ├── db.sqlite3                    # Local SQLite database file for Django development
│   ├── api/                          # API app containing routing and views
│   │   ├── urls.py                   # Route configurations (chat, tts, emergency, reports, docs, doctors)
│   │   ├── views.py                  # API endpoints logic (Trauma Intent classification, PDF, Insights)
│   │   └── models.py, admin.py...    # Django structural files
│   └── traumaguard_backend/          # Django project configuration directory (settings.py, urls.py, wsgi.py)
│
├── frontend/                         # [REACT FRONTEND] Enterprise React SPA
│   ├── tsconfig.json, vite.config.ts # TypeScript & build configurations
│   ├── package.json                  # Frontend libraries and packages
│   ├── Dockerfile                    # Containerization script for React frontend
│   └── src/
│       ├── main.tsx, vite-env.d.ts   # Entry files
│       ├── components/               # AppShell.tsx and other UI wrapper components
│       ├── integrations/             # Supabase / auth client integrations
│       ├── lib/                      # Core utility libraries
│       │   └── speech.ts             # [NEW] Real-time TTS audio streaming engine & fallback handlers
│       └── routes/                   # File-based TanStack routes
│           ├── __root.tsx            # App root layout, authentication state, query wrappers
│           ├── auth.tsx              # Authentication login / signup interface
│           ├── index.tsx             # Entry redirects page
│           ├── reset-password.tsx    # Password reset page
│           ├── _authenticated.tsx    # Shell wrapper check for authenticated routes
│           └── _authenticated/       # Core application pages (authenticated user path)
│               ├── route.tsx         # TanStack authentication route definition
│               ├── dashboard.tsx     # Trauma reduction dashboard, logs, check-ins
│               ├── chat/             # AI Trauma Conversational Interface
│               │   ├── index.tsx     # Root chat index (session initiator)
│               │   └── $threadId.tsx # Chat interface for a specific thread/session history
│               ├── chat-history.tsx  # Logs of past conversational threads
│               ├── doctors.tsx       # Searchable directory of doctors with direct scheduling
│               ├── emergency.tsx     # Crisis hotlines and active emergency distress trigger
│               ├── notifications.tsx # Alerts list and clinical notifications panel
│               ├── records.tsx       # Documents/Photo uploads vault
│               ├── reports.tsx       # Past vs present comparative tool and PDF generation
│               └── settings.tsx      # User profile details and settings editing
```

---

## 🛠️ 3. Full Technology Stack & Libraries

### 🖥️ Backends (Dual Services)
- **FastAPI Backend (Workspace Root)**:
  - `fastapi` (`0.110.0+`): Web framework.
  - `uvicorn` (`0.28.0+`): ASGI web server.
  - `pydantic` (`2.6.0+`): Data validation and models.
  - `reportlab` (`4.1.0+`): Medical-grade PDF generation.
  - `openai` (`1.14.0+`): LLM integrations and Streaming Text-to-Speech (TTS).
  - `gTTS` (`2.5.1+`): Fallback Google Text-to-Speech generation.
  - `psycopg2-binary` (`2.9.9+`), `asyncpg` (`0.29.0+`), `sqlalchemy` (`2.0.28+`): DB connection and ORMs.
- **Django Backend (`backend/`)**:
  - `Django` (`4.2` to `5.x`): Primary framework.
  - `djangorestframework` (`3.14+`): Web APIs.
  - `django-cors-headers` (`4.3+`): CORS middleware.
  - `gunicorn` (`21.2+`): Production WSGI server.

### 💻 Frontend
- **Enterprise React SPA (`frontend/`)**:
  - `react` / `react-dom` (`19.2.0+`): Core rendering engine.
  - `vite` (`8.0.16+`): Bundler.
  - `@tanstack/react-router` (`1.170.16+`): Type-safe client routing.
  - `@tanstack/react-query` (`5.101.1+`): Async server-state management.
  - `tailwindcss` / `@tailwindcss/vite` (`4.2.1+`): Styling framework.
  - `jspdf` (`4.2.1+`), `jspdf-autotable` (`5.0.8+`): Client-side fallback PDF generator.
  - `recharts` (`2.15.4+`): Interactive telemetry charting.
  - `lucide-react` (`0.575.0+`): Icon set.
  - `sonner` (`2.0.7+`): Toast message alerts.

---

## 🗄️ 4. Database Schemas & Tables

### A. SQLite Fallback / Local PostgreSQL Tables (`database.py`)
1. **`users`**: Customer profiles, logins count, last login timestamps, roles.
2. **`user_logins`**: Audit trail of logins, IP addresses, browser user agents.
3. **`mood_logs`**: Longitudinal check-in records containing 0–100 distress scores.
4. **`doctors`**: Master directory of specialists (cities, specialties, availability, ratings).
5. **`appointments`**: Booked consultation schedule with references.
6. **`chat_threads`**: Active chatbot session IDs and thread titles.
7. **`chat_messages`**: Chat messages containing classification results, severity, and confidence levels.
8. **`clinical_reports`**: Trajectory summaries, identified themes, and recommendations.
9. **`notifications`**: Clinical reminders and read flags.
10. **`uploaded_documents`**: Uploaded reports, categories, baselines, base64 strings, and paths.

### B. Supabase/PostgreSQL Table Schema (`supabase_schema.sql`)
1. **`profiles`**: User profiles extending `auth.users(id)` with phone numbers and selected languages.
2. **`chat_threads`**: RLS-enabled chatbot thread catalog.
3. **`chat_messages`**: Conversations linked to specific threads.
4. **`mood_logs`**: RLS-enabled user check-ins.
5. **`doctors`**: Read-only searchable specialists directory.
6. **`notifications`**: User alert messages.
7. **`notification_preferences`**: Specific preferences (SMS, emails, quite-hours settings).
8. **`uploaded_documents`**: Client catalog of reports and photo scans.

---

## 🧠 5. Clinical AI Intent Engines & Trigger Sentences

The engines parse patient conversations to classify mood alerts and trigger appropriate interventions:

### A. FastAPI Chatbot Engine (`main.py`)
| Intent Category | Severity | Trigger Sentence Keywords | Clinical Interventions Returned |
| :--- | :--- | :--- | :--- |
| **Acute Crisis** | `HIGH` | `suicide`, `end my life`, `kill myself`, `die`, `hurt myself`, `end it all` | Immediate Tele-MANAS `14416`, KIRAN `1800-599-0019`, National Emergency `112` |
| **PTSD & Trauma Trigger** | `MODERATE` | `flashback`, `car accident`, `incident`, `trauma`, `nightmare`, `crash`, `reliving`, `trigger` | 5-4-3-2-1 Somatic Grounding wizard & Box Breathing prompts |
| **Panic & Acute Anxiety** | `HIGH` | `panic`, `anxiety`, `can't breathe`, `heart racing`, `chest tight`, `hyperventilating`, `tightness` | Physiological Sigh exercise guide & 4-4-4-4 Box Breathing visualizer |
| **Sleep Disruption** | `MODERATE` | `sleep`, `insomnia`, `tired`, `restless`, `waking up`, `bad dream`, `sleepless` | 4-7-8 Parasympathetic breathing guide & journaling advice |
| **Specialist Consultation** | `LOW` | `doctor`, `psychiatrist`, `therapist`, `consultation`, `appointment`, `clinic` | Links and directory search advice |
| **General Wellness** | `LOW` | Any other conversational remark | Compasionate reflective listening prompts |

### B. Django Chatbot Engine (`backend/api/views.py`)
- **`crisis`**: Triggers emergency toll-free numbers (`14416`, `1800-599-0019`, `988`).
- **`sleep`**: Tonight's Sleep Reset Protocol (4-7-8 breathing, dim-light setups, journaling rules).
- **`grounding`**: Guided step-by-step 5-4-3-2-1 sensory grounding script.
- **`panic`**: Sympathetic reset protocols (Mammalian Dive Reflex, cold splash, posture relaxation).
- **`triggers`**: Guided PTSD recovery questions and grounding suggestions.
- **`doctor`**: Clinical indicators checklists (duration, functional impairments) prompting doctors lookup.
- **`stress` / `depression`**: Emotional regulation journaling prompts and coping strategies.

### C. Real-Time Text-to-Speech (TTS) Voice Engine
The system features a low-latency, resilient Voice Engine that speaks assistant replies aloud to patients in distress:
- **Primary Streaming Engine**: Utilizes OpenAI's `tts-1` model via `with_streaming_response`. The Django backend yields chunked byte streams (`StreamingHttpResponse`) directly to the browser's native `<audio>` element via a `GET` request, ensuring zero-latency playback even for long clinical responses.
- **Fault-Tolerant Fallback System**: If the primary API encounters rate-limits (e.g., HTTP 429) or authentication errors, the backend eagerly catches the exception and instantly falls back to `gTTS` (Google Translate TTS).
- **Concurrent Request Handling**: The React frontend (`speech.ts`) utilizes a strict request-tracking mechanism (via React `useRef`) to cleanly abort and overwrite orphaned audio requests, completely eliminating voice overlap or race conditions if the patient triggers multiple messages rapidly.

---

## 🌐 6. Frontend Architecture & TanStack Routes

The client application utilizes file-based routes via `@tanstack/react-router`:
1. **`routes/__root.tsx`**: Context wrappers (TanStack Query, UI wrappers, current user state).
2. **`routes/auth.tsx`**: User login and registration dashboard.
3. **`routes/index.tsx`**: Routing entrypoint redirecting authenticated users to the main dashboard.
4. **`routes/reset-password.tsx`**: Password management.
5. **`routes/_authenticated.tsx`**: Layout containing sidebars, alerts, notifications, and shell layout.
6. **`routes/_authenticated/dashboard.tsx`**: Central telemetry console tracking longitudinal recovery indices.
7. **`routes/_authenticated/chat/index.tsx`**: AI consultation directory and session creation workspace.
8. **`routes/_authenticated/chat/$threadId.tsx`**: Live chat interface with the selected session's message histories.
9. **`routes/_authenticated/chat-history.tsx`**: Audit trails of all previous chat sessions.
10. **`routes/_authenticated/doctors.tsx`**: Specialist rosters with booking modals.
11. **`routes/_authenticated/emergency.tsx`**: SOS dispatcher with live coordinates and maps.
12. **`routes/_authenticated/notifications.tsx`**: Clinical messages and reminders lists.
13. **`routes/_authenticated/records.tsx`**: Medical document vault & upload portal.
14. **`routes/_authenticated/reports.tsx`**: Past vs present comparative tool and PDF generation.
15. **`routes/_authenticated/settings.tsx`**: Patient health metrics, contact information, and preference toggles.

---

## 🌐 7. API Specifications (FastAPI vs Django)

### A. FastAPI REST API (Port 8000)
- `GET` `/api/mood/logs`: Returns check-ins list.
- `POST` `/api/mood/logs`: Inserts a new distress check-in (requires `risk_score` and `mood`).
- `GET` `/api/chat/threads`: Returns user's chat sessions.
- `POST` `/api/chat/threads`: Spawns a new chat thread.
- `GET` `/api/chat/threads/{thread_id}/messages`: Retrieves message history for the session.
- `DELETE` `/api/chat/threads/{thread_id}`: Removes a chat session thread.
- `POST` `/api/chat`: Runs AI distress parsing and intent categorization.
- `GET` `/api/doctors`: Fetches specialists array.
- `POST` `/api/doctors/book`: Schedules an appointment consultation.
- `POST` `/api/emergency/dispatch`: Logs an active emergency SOS with GPS coordinates.
- `GET` `/api/emergency/nearby`: Lists nearby psychiatric crisis centers.
- `POST` `/api/reports/pdf`: Generates a medical-grade PDF via ReportLab.
- `POST` `/api/insights/analyze`: Processes trends and outputs clinical recommendations.
- `POST` `/api/users/sync`: Syncs authentication details.
- `GET` `/api/users`: Returns table logs of registered users.

### B. Django REST API (Port 8000 in Docker environment)
- `POST` `/api/chat/`: AI conversation analysis.
- `GET` | `POST` `/api/tts/`: Converts AI text output to speech streams. Features OpenAI byte-streaming and automatic `gTTS` fallback.
- `POST` `/api/emergency/dispatch/`: Logs active incidents.
- `GET` `/api/emergency/nearby/`: Obtains crisis facilities.
- `POST` `/api/reports/pdf/`: Django ReportLab PDF generation handler.
- `POST` `/api/reports/compare/`: Past vs present statistical comparison parser.
- `GET` | `POST` `/api/documents/`: Roster list and upload handler for medical reports.
- `GET` | `DELETE` `/api/documents/<str:doc_id>/`: Detailed document fetching and removal operations.
- `POST` `/api/doctors/book/`: Direct scheduling handler.
- `POST` `/api/insights/analyze/`: Aggregated mood insights engine.

---

## 📄 8. Clinical PDF Generation Engine

The system uses **ReportLab** (and `jspdf` on the client side as a fallback) to produce medical-grade documents:
1. **Dynamic Headers**: Features patient identification blocks, evaluation baselines, and timestamp arrays.
2. **Telemetry Graphs / Tables**: Grid elements comparing past baselines vs current telemetries, presenting delta score improvements.
3. **AI Clinical Trajectories**: Outlines specific observations and recommended schedules.
4. **Clinical Attestation**: Prompts sign-offs and signatures for legal patient file keeping.

---

## ⚡ 9. Installation, Configuration & Running Instructions

### Local Execution (FastAPI + React Dev)

1. **Activate Virtual Environment & Install Dependencies**:
   ```powershell
   & "backend\venv\Scripts\pip.exe" install -r requirements.txt
   ```
2. **Start the Database (Postgres or SQLite fallback)**:
   Verify connection credentials inside `.env` or leave defaults for automatic SQLite setup.
3. **Start the FastAPI Backend (Port 8000)**:
   ```powershell
   python main.py
   ```
4. **Launch the React Dev Server (Port 3000)**:
   ```powershell
   cd frontend
   npm run dev
   ```
5. **Open Application**:
   Navigate to **`http://localhost:3000/`** to run the app.

### Containerized Execution (Docker Compose)
To launch all services (PostgreSQL, Django backend, React frontend) inside Docker containers:
```bash
docker-compose up --build
```
This binds:
- React frontend: `http://localhost:3000`
- Django REST API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`
