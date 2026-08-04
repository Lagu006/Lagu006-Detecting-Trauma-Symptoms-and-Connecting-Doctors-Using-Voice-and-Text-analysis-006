# 🛡️ TraumaGuard AI — Multilingual Clinical Trauma & Mental Health Stabilization Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ReportLab](https://img.shields.io/badge/PDF_Engine-ReportLab-FF6F00?logo=adobe-acrobat-reader&logoColor=white)](https://www.reportlab.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**TraumaGuard AI** is a complete, full-stack, trauma-informed digital health platform engineered for acute distress monitoring, somatic autonomic de-escalation, 24/7 crisis dispatching with live GPS telemetry, clinical ReportLab PDF generation, psychiatric specialist consultation scheduling, multimodal AI triage, and high-concurrency **PostgreSQL relational database storage**.

---

## 📑 Detailed Table of Contents

1. [Project Overview & Core Mission](#-1-project-overview--core-mission)
2. [Pin-to-Pin Project Directory Structure](#-2-pin-to-pin-project-directory-structure)
3. [Full Technology Stack & Libraries](#-3-full-technology-stack--libraries)
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

---

## 🏥 1. Project Overview & Core Mission

TraumaGuard AI addresses the critical gap between acute psychological trauma incidents (car accidents, workplace violence, panic episodes, bereavement, severe stress) and access to professional psychiatric care.

### Core Objectives:
- **Instant Autonomic Stabilization**: Guiding hyper-aroused patients through evidence-based somatic exercises (4-4-4-4 Box Breathing, 5-4-3-2-1 Sensory Grounding, Physiological Sighs).
- **Longitudinal Distress Tracking**: Recording daily 0–100 distress indices with emotion tags and clinical journaling directly into PostgreSQL.
- **Fail-Safe Crisis Dispatch**: One-tap Emergency SOS triggering live GPS coordinate logging and direct hotlines to Tele-MANAS (`14416`) and National Emergency (`112`).
- **Clinician-Ready Documentation**: Automated generation of medical-grade Clinical Summary PDFs containing trajectory metrics and doctor attestation blocks.
- **Specialist Care Coordination**: Direct booking with verified psychiatrists, clinical psychologists, and EMDR practitioners.

---

## 📁 2. Pin-to-Pin Project Directory Structure

```
traumaguard-main-006/
│
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
```

---

## 🛠️ 3. Full Technology Stack & Libraries

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

1. **Activate Virtual Environment & Install Dependencies**:
   ```powershell
   & "backend\venv\Scripts\pip.exe" install -r requirements.txt
   ```

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
