"""
TraumaGuard AI - PostgreSQL Database Architecture
High-concurrency PostgreSQL relational database engine with thread-safe connection pooling.
"""
import os
import uuid
import datetime
from contextlib import contextmanager
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

# Database Connection Credentials
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/traumaguard_db")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
POSTGRES_DB = os.getenv("POSTGRES_DB", "traumaguard_db")

# Parse DATABASE_URL if provided
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    parsed = urlparse(DATABASE_URL)
    POSTGRES_USER = parsed.username or POSTGRES_USER
    POSTGRES_PASSWORD = parsed.password or POSTGRES_PASSWORD
    POSTGRES_HOST = parsed.hostname or POSTGRES_HOST
    POSTGRES_PORT = parsed.port or POSTGRES_PORT
    if parsed.path and len(parsed.path) > 1:
        POSTGRES_DB = parsed.path.lstrip('/')

_connection_pool: Optional[pool.ThreadedConnectionPool] = None


def ensure_database_exists():
    """Ensure the target PostgreSQL database exists on the PostgreSQL server."""
    try:
        conn = psycopg2.connect(
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            dbname="postgres",
            connect_timeout=3
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (POSTGRES_DB,))
        if not cur.fetchone():
            cur.execute(f'CREATE DATABASE "{POSTGRES_DB}";')
            print(f"[PostgreSQL] Created database '{POSTGRES_DB}' successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"[PostgreSQL] Note during database existence check: {e}")


def get_connection_pool() -> pool.ThreadedConnectionPool:
    global _connection_pool
    if _connection_pool is None:
        ensure_database_exists()
        _connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=20,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            dbname=POSTGRES_DB
        )
    return _connection_pool


@contextmanager
def get_db_cursor(commit=False):
    """Context manager yielding a thread-safe PostgreSQL RealDictCursor."""
    p = get_connection_pool()
    conn = p.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield cursor
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        p.putconn(conn)


def init_db():
    """Initializes all PostgreSQL tables without emergency mode and populates baseline records."""
    ensure_database_exists()
    with get_db_cursor(commit=True) as cur:
        # Drop legacy emergency tables if they exist
        cur.execute("""
            DROP TABLE IF EXISTS emergency_dispatches CASCADE;
            DROP TABLE IF EXISTS emergency_facilities CASCADE;
            DROP TABLE IF EXISTS emergency_contacts CASCADE;
        """)

        # 1. Users Table with Login Tracking & Customer Metrics
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(100) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                login_count INTEGER DEFAULT 1,
                last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'Active',
                role VARCHAR(50) DEFAULT 'Patient',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Safely migrate existing users table schema if columns are missing
        cur.execute("""
            ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 1;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Patient';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE users DROP COLUMN IF EXISTS emergency_contact;
        """)

        # 2. User Login Session History Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS user_logins (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                ip_address VARCHAR(100),
                user_agent TEXT,
                logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 3. Mood Logs Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS mood_logs (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(100) DEFAULT 'usr_default',
                risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
                mood VARCHAR(100) NOT NULL,
                note TEXT,
                logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 4. Doctors Table
        cur.execute("""
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
        """)

        # 5. Appointments Table
        cur.execute("""
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
        """)

        # 6. Chat Threads Module
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_threads (
                id VARCHAR(100) PRIMARY KEY,
                user_id VARCHAR(100) DEFAULT 'usr_default',
                title VARCHAR(255) DEFAULT 'Trauma Support Session',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 7. Chat Messages Module
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                thread_id VARCHAR(100) DEFAULT 'thread_default',
                user_id VARCHAR(100) DEFAULT 'usr_default',
                role VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                matched_condition VARCHAR(255),
                severity VARCHAR(50),
                confidence DOUBLE PRECISION,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 8. Clinical Reports & Trajectory Module
        cur.execute("""
            CREATE TABLE IF NOT EXISTS clinical_reports (
                id SERIAL PRIMARY KEY,
                report_code VARCHAR(50) UNIQUE NOT NULL,
                user_id VARCHAR(100) DEFAULT 'usr_default',
                patient_name VARCHAR(255) NOT NULL,
                avg_distress INTEGER NOT NULL,
                trajectory VARCHAR(50) NOT NULL,
                identified_themes TEXT,
                recommendation TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 9. Patient Notifications & Alerts Module
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(100) DEFAULT 'usr_default',
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'REMINDER',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Check and Seed Default User
        cur.execute("SELECT COUNT(*) as cnt FROM users;")
        if cur.fetchone()['cnt'] == 0:
            cur.execute("""
                INSERT INTO users (id, email, full_name, phone, login_count, last_login_at, status, role)
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, %s, %s);
            """, ('usr_default', 'patient@traumaguard.ai', 'Trauma Recovery Patient', '+91 98765 43210', 1, 'Active', 'Patient'))

        # Check and Seed Doctors
        cur.execute("SELECT COUNT(*) as cnt FROM doctors;")
        if cur.fetchone()['cnt'] == 0:
            doctors = [
                ('doc-1', 'Dr. Ananya Sharma, MD', 'Consultant Psychiatrist & Trauma Recovery Lead', 'psychiatrist', 'English, Hindi, Telugu', 'Hyderabad', '+91 98200 11111', 'dr.ananya.sharma@traumaclinic.in', 'Over 14 years clinical expertise in acute PTSD, emotional shock stabilization, and pharmacotherapy.', 14, 4.9, 1),
                ('doc-2', 'Dr. Rajesh Varma, Ph.D.', 'Senior Clinical Psychologist & EMDR Practitioner', 'psychologist', 'English, Hindi, Kannada', 'Bengaluru', '+91 98200 22222', 'dr.rajesh.varma@traumaclinic.in', 'Certified EMDR specialist focusing on vehicular trauma, panic disorder, and memory reprocessing.', 11, 4.8, 1),
                ('doc-3', 'Dr. Meera Iyer, M.Phil', 'Trauma-Informed Psychotherapist & Somatic Specialist', 'therapist', 'English, Tamil, Hindi', 'Chennai', '+91 98200 33333', 'dr.meera.iyer@traumaclinic.in', 'Specializing in nervous system grounding, somatic experiencing, and grief integration.', 9, 4.9, 1),
                ('doc-4', 'Dr. Arjun Patel, MD (Psych)', 'Neuropsychiatrist & Crisis Interventionist', 'psychiatrist', 'English, Gujarati, Hindi', 'Mumbai', '+91 98200 44444', 'dr.arjun.patel@traumaclinic.in', 'Expertise in acute panic disorders, dissociative episodes, and emergency tele-psychiatry.', 18, 5.0, 1),
                ('doc-5', 'Dr. Simran Kaur, M.Sc.', 'Trauma & Young Adult Wellness Counselor', 'therapist', 'English, Punjabi, Hindi', 'Chandigarh', '+91 98200 55555', 'dr.simran.kaur@traumaclinic.in', 'Compassionate counselling for university distress, sleep disruption, and post-accident recovery.', 7, 4.7, 1),
                ('doc-6', 'Dr. Neha Kulkarni, MD', 'Complex Trauma & Dissociative Disorder Lead', 'psychiatrist', 'English, Marathi, Hindi', 'Pune', '+91 98200 66666', 'dr.neha.kulkarni@traumaclinic.in', 'Specialist in nervous system regulation and intensive outpatient trauma therapy programs.', 15, 4.9, 1)
            ]
            for doc in doctors:
                cur.execute("""
                    INSERT INTO doctors (id, name, specialty, category, languages, city, phone, email, bio, years_experience, rating, available)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, doc)

        # Note: Mood logs start clean and are only recorded when actual check-ins are logged.
    print(f"[PostgreSQL] TraumaGuard AI database ({POSTGRES_DB}) initialized and verified successfully.")


# Helper Query Methods

def save_mood_log(risk_score: int, mood: str, note: Optional[str] = None, user_id: str = "usr_default") -> Dict[str, Any]:
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO mood_logs (user_id, risk_score, mood, note, logged_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id, user_id, risk_score, mood, note, logged_at;
        """, (user_id, risk_score, mood, note or ""))
        row = cur.fetchone()
        if row and isinstance(row.get('logged_at'), datetime.datetime):
            row['logged_at'] = row['logged_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {}


def get_recent_mood_logs(limit: int = 14) -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT id, user_id, risk_score, mood, note, logged_at
            FROM mood_logs
            ORDER BY logged_at DESC
            LIMIT %s;
        """, (limit,))
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get('logged_at'), datetime.datetime):
                d['logged_at'] = d['logged_at'].strftime("%Y-%m-%d %H:%M:%S")
            result.append(d)
        return result


def get_all_doctors(category: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        if category:
            cur.execute("SELECT * FROM doctors WHERE category = %s ORDER BY rating DESC;", (category,))
        else:
            cur.execute("SELECT * FROM doctors ORDER BY rating DESC;")
        return [dict(r) for r in cur.fetchall()]


def create_appointment(doctor_id: str, doctor_name: str, patient_name: str, patient_phone: str, preferred_date: str, notes: str = "", booking_id: Optional[str] = None) -> Dict[str, Any]:
    b_id = booking_id or f"TGC-{uuid.uuid4().hex[:6].upper()}"
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO appointments (booking_id, doctor_id, doctor_name, patient_name, patient_phone, preferred_date, status, notes)
            VALUES (%s, %s, %s, %s, %s, %s, 'Confirmed', %s)
            RETURNING id, booking_id, doctor_id, doctor_name, patient_name, patient_phone, preferred_date, status, notes, created_at;
        """, (b_id, doctor_id, doctor_name, patient_name, patient_phone, preferred_date, notes))
        row = cur.fetchone()
        if row and isinstance(row.get('created_at'), datetime.datetime):
            row['created_at'] = row['created_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {"booking_id": b_id, "status": "Confirmed"}


def dispatch_emergency(patient_name: str, contact_phone: str, latitude: float, longitude: float, distress_level: int = 95) -> Dict[str, Any]:
    incident_code = f"SOS-{uuid.uuid4().hex[:6].upper()}"
    maps_url = f"https://www.google.com/maps?q={latitude},{longitude}" if latitude and longitude else None
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO emergency_dispatches (incident_code, patient_name, contact_phone, latitude, longitude, maps_url, distress_level, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'ACTIVE_DISPATCHED')
            RETURNING id, incident_code, patient_name, contact_phone, latitude, longitude, maps_url, distress_level, status, dispatched_at;
        """, (incident_code, patient_name, contact_phone, latitude, longitude, maps_url, distress_level))
        row = cur.fetchone()
        if row and isinstance(row.get('dispatched_at'), datetime.datetime):
            row['dispatched_at'] = row['dispatched_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {"incident_code": incident_code, "status": "ACTIVE_DISPATCHED"}


def get_emergency_facilities() -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        cur.execute("SELECT * FROM emergency_facilities;")
        return [dict(r) for r in cur.fetchall()]


def save_chat_message(role: str, content: str, matched_condition: Optional[str] = None, severity: Optional[str] = None, confidence: Optional[float] = None) -> Dict[str, Any]:
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO chat_messages (role, content, matched_condition, severity, confidence)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, role, content, matched_condition, severity, confidence, created_at;
        """, (role, content, matched_condition, severity, confidence))
        row = cur.fetchone()
        if row and isinstance(row.get('created_at'), datetime.datetime):
            row['created_at'] = row['created_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {}


def get_chat_history(limit: int = 20) -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT id, role, content, matched_condition, severity, confidence, created_at
            FROM chat_messages
            ORDER BY id ASC
            LIMIT %s;
        """, (limit,))
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get('created_at'), datetime.datetime):
                d['created_at'] = d['created_at'].strftime("%Y-%m-%d %H:%M:%S")
            result.append(d)
        return result


# Method aliases for compatibility
get_mood_logs = get_recent_mood_logs
add_mood_log = save_mood_log


def record_user_login(user_id: str, email: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> Dict[str, Any]:
    """Records an individual login event and updates user login statistics."""
    with get_db_cursor(commit=True) as cur:
        # Insert audit login record
        cur.execute("""
            INSERT INTO user_logins (user_id, email, ip_address, user_agent, logged_at)
            VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING id, user_id, email, ip_address, logged_at;
        """, (user_id, email, ip_address or "127.0.0.1", user_agent or "Web Client"))
        login_row = cur.fetchone()

        # Increment login_count and update last_login_at in users table
        cur.execute("""
            UPDATE users
            SET login_count = COALESCE(login_count, 0) + 1,
                last_login_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s OR email = %s;
        """, (user_id, email))
        return dict(login_row) if login_row else {}


def save_user(email: str, full_name: str, phone: Optional[str] = None, user_id: Optional[str] = None, is_login: bool = True, ip_address: Optional[str] = None, user_agent: Optional[str] = None) -> Dict[str, Any]:
    """Saves or updates a user profile, tracking login occurrences and timestamps."""
    uid = user_id or f"usr_{uuid.uuid4().hex[:8]}"
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO users (id, email, full_name, phone, login_count, last_login_at, status, role, created_at, updated_at)
            VALUES (%s, %s, %s, %s, 1, CURRENT_TIMESTAMP, 'Active', 'Patient', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (email) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                phone = COALESCE(NULLIF(EXCLUDED.phone, ''), users.phone),
                login_count = CASE WHEN %s THEN COALESCE(users.login_count, 0) + 1 ELSE users.login_count END,
                last_login_at = CASE WHEN %s THEN CURRENT_TIMESTAMP ELSE users.last_login_at END,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, email, full_name, phone, login_count, last_login_at, status, role, created_at, updated_at;
        """, (uid, email, full_name, phone, is_login, is_login))
        row = cur.fetchone()

        if row:
            d = dict(row)
            # Record login session event
            if is_login:
                try:
                    cur.execute("""
                        INSERT INTO user_logins (user_id, email, ip_address, user_agent, logged_at)
                        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP);
                    """, (d['id'], d['email'], ip_address or "127.0.0.1", user_agent or "Web Client"))
                except Exception:
                    pass

            for dt_col in ['created_at', 'updated_at', 'last_login_at']:
                if isinstance(d.get(dt_col), datetime.datetime):
                    d[dt_col] = d[dt_col].strftime("%Y-%m-%d %H:%M:%S")
            return d
        return {"id": uid, "email": email, "full_name": full_name}


def get_users() -> List[Dict[str, Any]]:
    """Returns comprehensive customer details with full login counts, activity, and clinical aggregates."""
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT 
                u.id,
                u.full_name,
                u.email,
                COALESCE(u.phone, 'N/A') as phone,
                COALESCE(u.login_count, 1) as login_count,
                u.last_login_at,
                u.status,
                u.role,
                u.created_at,
                COUNT(DISTINCT m.id) as total_checkins,
                COALESCE(ROUND(AVG(m.risk_score), 1), 0.0) as avg_distress,
                COUNT(DISTINCT a.id) as total_appointments
            FROM users u
            LEFT JOIN mood_logs m ON (m.user_id = u.id OR (u.id = 'usr_default' AND m.user_id = 'usr_default'))
            LEFT JOIN appointments a ON (a.patient_name ILIKE '%' || u.full_name || '%' OR a.patient_phone = u.phone)
            GROUP BY u.id, u.full_name, u.email, u.phone, u.login_count, u.last_login_at, u.status, u.role, u.created_at
            ORDER BY u.created_at DESC;
        """)
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            for dt_col in ['created_at', 'last_login_at']:
                if isinstance(d.get(dt_col), datetime.datetime):
                    d[dt_col] = d[dt_col].strftime("%Y-%m-%d %H:%M:%S")
                elif d.get(dt_col) is None:
                    d[dt_col] = "Never"
            d['avg_distress'] = float(d['avg_distress'])
            result.append(d)
        return result


def get_user_logins(limit: int = 50) -> List[Dict[str, Any]]:
    """Returns granular login history audit logs."""
    with get_db_cursor() as cur:
        cur.execute("""
            SELECT id, user_id, email, ip_address, user_agent, logged_at
            FROM user_logins
            ORDER BY logged_at DESC
            LIMIT %s;
        """, (limit,))
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get('logged_at'), datetime.datetime):
                d['logged_at'] = d['logged_at'].strftime("%Y-%m-%d %H:%M:%S")
            result.append(d)
        return result



# ----------------- Clinical Reports Module -----------------

def save_clinical_report(user_id: str, patient_name: str, avg_distress: int, trajectory: str, identified_themes: str, recommendation: str, report_code: Optional[str] = None) -> Dict[str, Any]:
    code = report_code or f"REP-{uuid.uuid4().hex[:6].upper()}"
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO clinical_reports (report_code, user_id, patient_name, avg_distress, trajectory, identified_themes, recommendation)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, report_code, user_id, patient_name, avg_distress, trajectory, identified_themes, recommendation, created_at;
        """, (code, user_id, patient_name, avg_distress, trajectory, identified_themes, recommendation))
        row = cur.fetchone()
        if row and isinstance(row.get('created_at'), datetime.datetime):
            row['created_at'] = row['created_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {"report_code": code}


def get_clinical_reports(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        if user_id:
            cur.execute("SELECT * FROM clinical_reports WHERE user_id = %s ORDER BY created_at DESC;", (user_id,))
        else:
            cur.execute("SELECT * FROM clinical_reports ORDER BY created_at DESC;")
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get('created_at'), datetime.datetime):
                d['created_at'] = d['created_at'].strftime("%Y-%m-%d %H:%M:%S")
            result.append(d)
        return result


# ----------------- Notifications & Alerts Module -----------------

def create_notification(user_id: str, title: str, message: str, notif_type: str = "ALERT") -> Dict[str, Any]:
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (%s, %s, %s, %s)
            RETURNING id, user_id, title, message, type, is_read, created_at;
        """, (user_id, title, message, notif_type))
        row = cur.fetchone()
        if row and isinstance(row.get('created_at'), datetime.datetime):
            row['created_at'] = row['created_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {}


def get_notifications(user_id: Optional[str] = None, unread_only: bool = False) -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        query = "SELECT * FROM notifications WHERE 1=1"
        params = []
        if user_id:
            query += " AND user_id = %s"
            params.append(user_id)
        if unread_only:
            query += " AND is_read = FALSE"
        query += " ORDER BY created_at DESC;"
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get('created_at'), datetime.datetime):
                d['created_at'] = d['created_at'].strftime("%Y-%m-%d %H:%M:%S")
            result.append(d)
        return result


def mark_notification_read(notification_id: int) -> bool:
    with get_db_cursor(commit=True) as cur:
        cur.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s;", (notification_id,))
        return True



