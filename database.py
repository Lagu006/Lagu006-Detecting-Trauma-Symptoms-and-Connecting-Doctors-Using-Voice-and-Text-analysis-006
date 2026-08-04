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
    """Initializes all 7 PostgreSQL tables and populates baseline records."""
    ensure_database_exists()
    with get_db_cursor(commit=True) as cur:
        # 1. Users Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(100) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                emergency_contact VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Mood Logs Table
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

        # 3. Doctors Table
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

        # 4. Appointments Table
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

        # 5. Emergency Dispatches Table
        cur.execute("""
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
        """)

        # 6. Emergency Facilities Table
        cur.execute("""
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
        """)

        # 7. Chat Threads Module
        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_threads (
                id VARCHAR(100) PRIMARY KEY,
                user_id VARCHAR(100) DEFAULT 'usr_default',
                title VARCHAR(255) DEFAULT 'Trauma Support Session',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 8. Chat Messages Module
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

        # 9. Emergency Contacts Module (Trusted Care Circle)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS emergency_contacts (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(100) DEFAULT 'usr_default',
                name VARCHAR(255) NOT NULL,
                relationship VARCHAR(100),
                phone VARCHAR(50) NOT NULL,
                is_primary BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 10. Clinical Reports & Trajectory Module
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

        # 11. Patient Notifications & Alerts Module
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(100) DEFAULT 'usr_default',
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'ALERT',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Check and Seed Default User
        cur.execute("SELECT COUNT(*) as cnt FROM users;")
        if cur.fetchone()['cnt'] == 0:
            cur.execute("""
                INSERT INTO users (id, email, full_name, phone, emergency_contact)
                VALUES (%s, %s, %s, %s, %s);
            """, ('usr_default', 'patient@traumaguard.ai', 'Trauma Recovery Patient', '+91 98765 43210', '+91 98765 00000 (Dr. Relative)'))

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

        # Check and Seed Emergency Facilities
        cur.execute("SELECT COUNT(*) as cnt FROM emergency_facilities;")
        if cur.fetchone()['cnt'] == 0:
            facilities = [
                ('fac-1', 'NIMHANS Emergency Trauma & Crisis Centre', 'Bengaluru', '080-26995000', '14416', 'Hosur Road, Bengaluru, Karnataka 560029', 'Psychiatric Emergency Hospital', '2.4 km'),
                ('fac-2', 'AIIMS Department of Psychiatry Crisis Bay', 'New Delhi', '011-26588500', '14416', 'Ansari Nagar, New Delhi 110029', 'Apex Trauma Center', '3.8 km'),
                ('fac-3', 'KEM Hospital Acute Psychiatric & Trauma Ward', 'Mumbai', '022-24107000', '112', 'Acharya Donde Marg, Parel, Mumbai 400012', 'Public Emergency Care', '1.9 km'),
                ('fac-4', 'Institute of Mental Health (IMH) Crisis Unit', 'Chennai', '044-26441544', '104', 'Medavakkam Tank Road, Kilpauk, Chennai 600010', 'Specialized Care', '4.1 km'),
                ('fac-5', 'Apollo Emergency Trauma & Neuro Care Bay', 'Hyderabad', '040-23607777', '1066', 'Jubilee Hills, Road No 72, Hyderabad 500033', '24/7 Advanced Care', '5.0 km')
            ]
            for fac in facilities:
                cur.execute("""
                    INSERT INTO emergency_facilities (id, name, city, phone, hotline, address, type, distance)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
                """, fac)

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
get_facilities = get_emergency_facilities


def record_emergency_dispatch(dispatch_id: str, patient_name: str, contact_phone: str, latitude: float, longitude: float, distress_level: int = 90, maps_url: str = None) -> Dict[str, Any]:
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO emergency_dispatches (incident_code, patient_name, contact_phone, latitude, longitude, maps_url, distress_level, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'ACTIVE_DISPATCHED')
            RETURNING id, incident_code, patient_name, contact_phone, latitude, longitude, maps_url, distress_level, status, dispatched_at;
        """, (dispatch_id, patient_name, contact_phone, latitude, longitude, maps_url, distress_level))
        row = cur.fetchone()
        if row and isinstance(row.get('dispatched_at'), datetime.datetime):
            row['dispatched_at'] = row['dispatched_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {"incident_code": dispatch_id, "status": "ACTIVE_DISPATCHED"}


def save_user(email: str, full_name: str, phone: Optional[str] = None, emergency_contact: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
    uid = user_id or f"usr_{uuid.uuid4().hex[:8]}"
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO users (id, email, full_name, phone, emergency_contact)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (email) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                phone = COALESCE(EXCLUDED.phone, users.phone),
                emergency_contact = COALESCE(EXCLUDED.emergency_contact, users.emergency_contact)
            RETURNING id, email, full_name, phone, emergency_contact, created_at;
        """, (uid, email, full_name, phone, emergency_contact))
        row = cur.fetchone()
        if row and isinstance(row.get('created_at'), datetime.datetime):
            row['created_at'] = row['created_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {"id": uid, "email": email, "full_name": full_name}


def get_users() -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        cur.execute("SELECT id, email, full_name, phone, emergency_contact, created_at FROM users ORDER BY created_at DESC;")
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get('created_at'), datetime.datetime):
                d['created_at'] = d['created_at'].strftime("%Y-%m-%d %H:%M:%S")
            result.append(d)
        return result


# ----------------- Emergency Contacts Module -----------------

def add_emergency_contact(user_id: str, name: str, phone: str, relationship: Optional[str] = "Guardian", is_primary: bool = True) -> Dict[str, Any]:
    with get_db_cursor(commit=True) as cur:
        cur.execute("""
            INSERT INTO emergency_contacts (user_id, name, relationship, phone, is_primary)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, user_id, name, relationship, phone, is_primary, created_at;
        """, (user_id, name, relationship, phone, is_primary))
        row = cur.fetchone()
        if row and isinstance(row.get('created_at'), datetime.datetime):
            row['created_at'] = row['created_at'].strftime("%Y-%m-%d %H:%M:%S")
        return dict(row) if row else {}


def get_emergency_contacts(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    with get_db_cursor() as cur:
        if user_id:
            cur.execute("SELECT * FROM emergency_contacts WHERE user_id = %s ORDER BY is_primary DESC, id ASC;", (user_id,))
        else:
            cur.execute("SELECT * FROM emergency_contacts ORDER BY is_primary DESC, id ASC;")
        rows = cur.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            if isinstance(d.get('created_at'), datetime.datetime):
                d['created_at'] = d['created_at'].strftime("%Y-%m-%d %H:%M:%S")
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



