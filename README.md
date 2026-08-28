<<<<<<< HEAD
![alt text](image.png)# 🛡️ TraumaGuard AI — Multilingual Clinical Trauma & Mental Health Stabilization Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Django](https://img.shields.io/badge/Django-4.2+-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
=======
# 🛡️ TraumaGuard AI — Multilingual Clinical Trauma & Mental Health Stabilization Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ReportLab](https://img.shields.io/badge/PDF_Engine-ReportLab-FF6F00?logo=adobe-acrobat-reader&logoColor=white)](https://www.reportlab.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

<<<<<<< HEAD
**TraumaGuard AI** is a complete, full-stack, trauma-informed digital health platform engineered for acute distress monitoring, somatic autonomic de-escalation, 24/7 crisis dispatching, clinical ReportLab PDF generation, psychiatric specialist consultation scheduling, multimodal AI triage, and high-concurrency database storage (with automatic embedded SQLite fallback and PostgreSQL/Supabase integration).
=======
**TraumaGuard AI** is a complete, full-stack, trauma-informed digital health platform engineered for acute distress monitoring, somatic autonomic de-escalation, 24/7 crisis dispatching with live GPS telemetry, clinical ReportLab PDF generation, psychiatric specialist consultation scheduling, multimodal AI triage, and high-concurrency **PostgreSQL relational database storage**.
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

---

## 📑 Detailed Table of Contents

1. [Project Overview & Core Mission](#-1-project-overview--core-mission)
2. [Pin-to-Pin Project Directory Structure](#-2-pin-to-pin-project-directory-structure)
3. [Full Technology Stack & Libraries](#-3-full-technology-stack--libraries)
<<<<<<< HEAD
4. [Database Schemas & Tables](#-4-database-schemas--tables)
5. [Clinical AI Intent Engines & Trigger Sentences](#-5-clinical-ai-intent-engines--trigger-sentences)
6. [Frontend Architecture & TanStack Routes](#-6-frontend-architecture--tanstack-routes)
7. [API Specifications (FastAPI vs Django)](#-7-api-specifications-fastapi-vs-django)
8. [Clinical PDF Generation Engine](#-8-clinical-pdf-generation-engine)
9. [Installation, Configuration & Running Instructions](#-9-installation-configuration--running-instructions)
10. [Medical & Regulatory Disclaimer](#-10-medical--regulatory-disclaimer)
=======
4. [PostgreSQL Database Architecture & Schema](#-4-postgresql-database-architecture--schema)
5. [How to View & Inspect PostgreSQL Data](#-5-how-to-view--inspect-postgresql-data)
6. [Clinical AI Intent Engine & Keywords (Pin-to-Pin)](#-6-clinical-ai-intent-engine--keywords-pin-to-pin)
7. [Frontend Architecture (Dual UIs)](#-7-frontend-architecture-dual-uis)
8. [Backend Architecture & Complete REST API Specs](#-8-backend-architecture--complete-rest-api-specs)
9. [Clinical ReportLab PDF Generator Engine](#-9-clinical-reportlab-pdf-generator-engine)
10. [Emergency SOS & GPS Telemetry System](#-10-emergency-sos--gps-telemetry-system)
11. [Docker & Containerization](#-11-docker--containerization)
12. [Installation, Configuration & Step-by-Step Run Guide](#-12-installation-configuration--step-by-step-run-guide)
13. [Medical & Regulatory Disclaimer](#-13-medical--regulatory-disclaimer)
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

---

## 🏥 1. Project Overview & Core Mission

<<<<<<< HEAD
TraumaGuard AI bridges the gap between acute psychological trauma incidents (accidents, panic attacks, severe stress spikes) and professional psychiatric care:
- **Instant Autonomic Stabilization**: Somatic exercise visualizers (4-4-4-4 Box Breathing, 5-4-3-2-1 Sensory Grounding).
- **Longitudinal Distress Tracking**: Recording distress indices (0-100) with emotion tags and clinical trigger journals.
- **Fail-Safe Crisis Dispatch**: One-tap Emergency SOS logging live GPS coordinate telemetries.
- **Clinician-Ready Documentation**: Clinical Summary PDFs detailing trajectory metrics and doctor sign-off blocks.
- **Specialist Care Coordination**: Searchable directories of psychiatrists and clinical psychologists with booking schedulers.
=======
TraumaGuard AI addresses the critical gap between acute psychological trauma incidents (car accidents, workplace violence, panic episodes, bereavement, severe stress) and access to professional psychiatric care.

### Core Objectives:
- **Instant Autonomic Stabilization**: Guiding hyper-aroused patients through evidence-based somatic exercises (4-4-4-4 Box Breathing, 5-4-3-2-1 Sensory Grounding, Physiological Sighs).
- **Longitudinal Distress Tracking**: Recording daily 0–100 distress indices with emotion tags and clinical journaling directly into PostgreSQL.
- **Fail-Safe Crisis Dispatch**: One-tap Emergency SOS triggering live GPS coordinate logging and direct hotlines to Tele-MANAS (`14416`) and National Emergency (`112`).
- **Clinician-Ready Documentation**: Automated generation of medical-grade Clinical Summary PDFs containing trajectory metrics and doctor attestation blocks.
- **Specialist Care Coordination**: Direct booking with verified psychiatrists, clinical psychologists, and EMDR practitioners.
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

---

## 📁 2. Pin-to-Pin Project Directory Structure

```
traumaguard-main-006/
│
<<<<<<< HEAD
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
=======
├── main.py                           # [BACKEND CORE] Primary FastAPI application serving REST APIs & UI
├── database.py                       # [POSTGRESQL LAYER] PostgreSQL connection pooling, DDLs & seed datasets
├── view_db.py                        # [DB INSPECTOR] Terminal CLI script to query and view PostgreSQL tables
├── requirements.txt                  # Python dependencies (FastAPI, psycopg2-binary, ReportLab, OpenAI, etc.)
├── docker-compose.yml                # Docker multi-container config (PostgreSQL 15, FastAPI Backend, React Frontend)
├── README.md                         # Master comprehensive documentation
├── .env                              # PostgreSQL connection credentials & environment variables
│
├── static/                           # [FRONTEND ASSETS] Unified Web Application Assets
│   ├── style.css                     # Custom CSS3 design system (Glassmorphism, Dark Mode, Animations)
│   └── app.js                        # Vanilla JavaScript interaction logic (Fetch API, Tabs, Modals)
│
├── templates/                        # [HTML TEMPLATES]
│   └── index.html                    # Single-Page Application (SPA) HTML5 layout
│
├── frontend/                         # [REACT APPLICATION] Advanced React 18 + Vite Frontend
│   ├── src/
│   │   ├── routes/                   # File-based routing via TanStack Router
│   │   │   ├── __root.tsx            # Application root layout & query provider
│   │   │   ├── _authenticated.tsx    # Authenticated user layout & sidebar
│   │   │   └── _authenticated/
│   │   │       ├── index.tsx         # Dashboard with mood tracker, quick exercises & SOS trigger
│   │   │       ├── chat.tsx          # Real-time trauma crisis AI chat interface
│   │   │       ├── triage.tsx        # Multi-step clinical assessment questionnaire
│   │   │       ├── doctors.tsx       # Psychiatrist & Psychologist directory + booking modal
│   │   │       ├── sos.tsx           # Fullscreen Emergency SOS beacon with live GPS & facility map
│   │   │       ├── report.tsx        # Clinical trajectory preview & PDF download action
│   │   │       ├── breathing.tsx     # Animated 4-4-4-4 Box Breathing visualizer
│   │   │       ├── grounding.tsx     # Interactive 5-4-3-2-1 Sensory Grounding wizard
│   │   │       └── profile.tsx       # Patient profile, emergency contacts & health telemetry
│   │   ├── components/               # Reusable UI component library (Button, Modal, Card, Nav, etc.)
│   │   ├── lib/                      # Client utilities (API client, Supabase client, error reporter)
│   │   └── main.tsx                  # React 18 root entry point
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.ts                # Vite build and proxy configuration
│   └── Dockerfile                    # Frontend production container definition
│
└── backend/                          # [BACKEND SERVICE]
    ├── requirements.txt              # Backend service dependencies
    └── Dockerfile                    # Backend container definition
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
```

---

## 🛠️ 3. Full Technology Stack & Libraries

<<<<<<< HEAD
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
=======
### 🖥️ Backend
- **Framework**: FastAPI `0.110+` & Starlette
- **Server Gateway**: Uvicorn `0.28+` (ASGI)
- **Database Engine**: PostgreSQL `15+` (Relational DBMS)
- **Database Driver**: `psycopg2-binary` (Thread-safe Connection Pool) & `asyncpg` / `SQLAlchemy`
- **PDF Generation**: ReportLab `4.1+`
- **AI / LLM Integration**: OpenAI Python SDK `1.14+`
- **Validation**: Pydantic `v2`

### 💻 Frontend (Dual Presentation Layer)
- **Unified Single-File UI**: HTML5 + Vanilla CSS3 (Custom Glassmorphism Design System) + Vanilla ES6 JavaScript (No build step required).
- **Enterprise React SPA**: React 18, TypeScript, Vite 5, TanStack Router, TanStack Query, TailwindCSS, Lucide Icons, Recharts.

---

## 🗄️ 4. PostgreSQL Database Architecture & Schema

The platform uses a dedicated **PostgreSQL relational database** named `traumaguard_db`. Connections are managed through a high-performance, thread-safe connection pool (`psycopg2.pool.ThreadedConnectionPool`).

### ⚙️ Connection Configuration (`.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/traumaguard_db"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="password"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_DB="traumaguard_db"
```

---

### 📊 PostgreSQL Table Schemas

#### 1. `users` Table
Stores authenticated patients and emergency profile contacts.
```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    emergency_contact VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `mood_logs` Table
Stores longitudinal psychological check-ins, subjective distress indices (0–100), emotion states, and clinical trigger notes.
```sql
CREATE TABLE IF NOT EXISTS mood_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) DEFAULT 'usr_default',
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    mood VARCHAR(100) NOT NULL,
    note TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `doctors` Table
Directory of licensed psychiatrists, clinical psychologists, and trauma counselors.
```sql
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    languages VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    bio TEXT,
    years_experience INTEGER DEFAULT 10,
    rating DOUBLE PRECISION DEFAULT 4.9,
    available INTEGER DEFAULT 1
);
```

#### 4. `appointments` Table
Stores confirmed clinical consultation bookings with specialists.
```sql
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    preferred_date VARCHAR(100) NOT NULL,
    status VARCHAR(100) DEFAULT 'Confirmed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. `emergency_dispatches` Table
Captures emergency SOS triggers, live latitude/longitude GPS telemetry, Google Maps dispatch links, and distress level.
```sql
CREATE TABLE IF NOT EXISTS emergency_dispatches (
    id SERIAL PRIMARY KEY,
    incident_code VARCHAR(50) UNIQUE NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    maps_url TEXT,
    distress_level INTEGER DEFAULT 95,
    status VARCHAR(100) DEFAULT 'ACTIVE_DISPATCHED',
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. `emergency_facilities` Table
Stores 24/7 psychiatric emergency centers, apex crisis bays, and national toll-free hotlines.
```sql
CREATE TABLE IF NOT EXISTS emergency_facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    hotline VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    distance VARCHAR(50) NOT NULL
);
```

#### 7. `chat_messages` Table
Audits AI crisis dialogue, user inputs, identified clinical conditions, triage severity, and model confidence scores.
```sql
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    matched_condition VARCHAR(255),
    severity VARCHAR(50),
    confidence DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔍 5. How to View & Inspect PostgreSQL Data

You can view and inspect the database directly using the built-in CLI tool **`view_db.py`**:

```bash
# 1. View summary of all tables and record counts in PostgreSQL
python view_db.py

# 2. View all recorded mood logs
python view_db.py mood_logs

# 3. View specialist directory
python view_db.py doctors

# 4. View booked doctor appointments
python view_db.py appointments

# 5. View emergency SOS dispatches with GPS coordinates
python view_db.py emergency_dispatches

# 6. View AI chat conversation logs
python view_db.py chat_messages

# 7. View 24/7 crisis facilities
python view_db.py emergency_facilities
```

Alternatively, you can connect using any PostgreSQL GUI client (e.g. **pgAdmin**, **DBeaver**, or **VS Code PostgreSQL Extension**) using:
- **Host**: `localhost`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: `password`
- **Database**: `traumaguard_db`

---

## 🧠 6. Clinical AI Intent Engine & Keywords (Pin-to-Pin)

| Intent Category | Severity | Keywords / Trigger Patterns | Clinical Interventions Returned |
| :--- | :--- | :--- | :--- |
| **Acute Crisis / Self-Harm** | `HIGH` | `suicide`, `end my life`, `kill myself`, `die`, `hurt myself`, `end it all` | Immediate Tele-MANAS `14416`, KIRAN `1800-599-0019`, National Emergency `112`, and SOS broadcast prompt |
| **PTSD & Trauma Trigger** | `MODERATE` | `flashback`, `car accident`, `incident`, `trauma`, `nightmare`, `crash`, `reliving`, `trigger` | 5-4-3-2-1 Somatic Grounding wizard & Box Breathing de-escalation |
| **Panic & Acute Anxiety** | `HIGH` | `panic`, `anxiety`, `can't breathe`, `heart racing`, `chest tight`, `hyperventilating`, `tightness`, `shaking`, `choking` | Physiological Sigh technique, 4-4-4-4 Box Breathing, sympathetic nervous system reset |
| **Sleep Disruption** | `MODERATE` | `sleep`, `insomnia`, `tired`, `restless`, `waking up`, `bad dream`, `sleepless` | 4-7-8 Parasympathetic breath routine & brain-dump journaling |
| **Specialist Consultation** | `LOW` | `doctor`, `psychiatrist`, `therapist`, `consultation`, `appointment`, `clinic` | Direct profile matching and instant appointment scheduling |
| **General Mental Wellness** | `LOW` | Any general conversational remark | Compassionate reflective listening and mood check-in prompt |

---

## 🌐 7. Backend Architecture & Complete REST API Specs

| Method | Endpoint | Description | PostgreSQL Table Modified |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Serves the Single-Page Application (SPA) | None |
| `GET` | `/api/mood/logs` | Fetches recent longitudinal mood check-ins | `mood_logs` (Read) |
| `POST` | `/api/mood/logs` | Saves new 0–100 distress index, mood tag & notes | `mood_logs` (Insert) |
| `POST` | `/api/chat` | AI Trauma conversation and intent classification | `chat_messages` (Insert) |
| `GET` | `/api/chat/history` | Retrieves recent chat conversation records | `chat_messages` (Read) |
| `GET` | `/api/doctors` | Returns directory of verified psychiatrists | `doctors` (Read) |
| `POST` | `/api/doctors/book` | Confirms specialist consultation booking | `appointments` (Insert) |
| `POST` | `/api/emergency/dispatch` | Broadcasts emergency SOS beacon with GPS | `emergency_dispatches` (Insert) |
| `GET` | `/api/emergency/nearby` | Returns nearby psychiatric emergency centers | `emergency_facilities` (Read) |
| `POST` | `/api/reports/pdf` | Generates official Clinical Summary PDF | `mood_logs` (Read) |
| `POST` | `/api/insights/analyze` | AI longitudinal trajectory and trigger analysis | `mood_logs` (Read) |

---

## 🐳 8. Docker & Containerization

The project includes a complete multi-container setup with PostgreSQL, FastAPI backend, and React frontend orchestrated via **Docker Compose**.

### Start all services with Docker:
```bash
docker-compose up --build
```

Services started:
- **`traumaguard_postgres`**: PostgreSQL 15 database on port `5432` with persistent volume `postgres_data`.
- **`traumaguard_backend`**: FastAPI backend on port `8000`.
- **`traumaguard_frontend`**: React 18 frontend on port `3000`.

---

## ⚡ 9. Installation, Configuration & Step-by-Step Run Guide

### Quick Start (FastAPI + PostgreSQL):
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

1. **Activate Virtual Environment & Install Dependencies**:
   ```powershell
   & "backend\venv\Scripts\pip.exe" install -r requirements.txt
   ```
<<<<<<< HEAD
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
=======

2. **Verify PostgreSQL Connection**:
   ```powershell
   & "backend\venv\Scripts\python.exe" view_db.py
   ```

3. **Start the FastAPI Application Server**:
   ```powershell
   & "backend\venv\Scripts\uvicorn.exe" main:app --host 127.0.0.1 --port 8000 --reload
   ```

4. **Open in Browser**:
   Navigate to **`http://127.0.0.1:8000/`** to interact with the full TraumaGuard AI platform.

---

## ⚖️ 10. Medical & Regulatory Disclaimer

TraumaGuard AI is designed as a supportive trauma-informed stabilization, autonomic de-escalation, and psychiatric referral tool. It is not an alternative to emergency medical services in acute life-threatening situations. In an immediate life emergency, users are instructed to dial **112** (National Emergency) or **14416** (Tele-MANAS Crisis Helpline).
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
