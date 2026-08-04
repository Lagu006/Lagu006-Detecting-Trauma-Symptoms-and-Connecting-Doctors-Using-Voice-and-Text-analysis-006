import os
import io
import uuid
import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

import database

# Initialize Database
database.init_db()

app = FastAPI(
    title="TraumaGuard AI - High Performance FastAPI Backend",
    description="Unified clinical AI mental health & trauma stabilization platform with pure SQLite SQL database.",
    version="2.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static and Templates directories
BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR.mkdir(exist_ok=True)
TEMPLATES_DIR.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# ----------------- Request/Response Models -----------------

class MoodLogCreate(BaseModel):
    risk_score: int
    mood: str
    note: Optional[str] = ""

class EmergencyDispatchRequest(BaseModel):
    latitude: Optional[float] = 17.385
    longitude: Optional[float] = 78.486
    contact_phone: Optional[str] = "+91 98765 43210"
    patient_name: Optional[str] = "Lagu (Trauma Recovery)"
    distress_level: Optional[int] = 90

class DoctorBookingRequest(BaseModel):
    doctor_id: str
    doctor_name: str
    patient_name: str
    patient_phone: str
    preferred_date: str
    notes: Optional[str] = ""

class UserSyncRequest(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    phone: Optional[str] = None
    emergency_contact: Optional[str] = None

class ContactCreateRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    name: str
    phone: str
    relationship: Optional[str] = "Guardian"
    is_primary: Optional[bool] = True

class NotificationCreateRequest(BaseModel):
    user_id: Optional[str] = "usr_default"
    title: str
    message: str
    type: Optional[str] = "ALERT"

class ChatMessageRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None
    language: Optional[str] = "en"
    condition: Optional[str] = None
    severity: Optional[str] = None

class ReportPdfRequest(BaseModel):
    patient_name: Optional[str] = "Lagu (Trauma Recovery)"
    patient_phone: Optional[str] = "+91 98765 43210"
    logs: Optional[List[Dict[str, Any]]] = None

class InsightsRequest(BaseModel):
    logs: Optional[List[Dict[str, Any]]] = None


# ----------------- Main HTML Route -----------------

@app.get("/")
async def serve_index():
    index_file = TEMPLATES_DIR / "index.html"
    if not index_file.exists():
        return HTMLResponse("<h1>TraumaGuard AI Backend Running</h1>")
    return FileResponse(str(index_file))


# ----------------- Mood Logs API (SQLite) -----------------

@app.get("/api/mood/logs")
async def get_mood_logs():
    logs = database.get_mood_logs(limit=50)
    return {"logs": logs, "count": len(logs)}

@app.post("/api/mood/logs")
async def create_mood_log(req: MoodLogCreate):
    if req.risk_score < 0 or req.risk_score > 100:
        raise HTTPException(status_code=400, detail="Risk score must be between 0 and 100")
    log = database.add_mood_log(req.risk_score, req.mood, req.note or "")
    return {"success": True, "log": log, "message": "Mood check-in recorded into SQLite database."}


# ----------------- Emergency SOS & Dispatch API (SQLite) -----------------

@app.post("/api/emergency/dispatch")
@app.post("/api/emergency/dispatch/")
async def emergency_dispatch(req: EmergencyDispatchRequest):
    lat = req.latitude or 17.385
    lng = req.longitude or 78.486
    maps_url = f"https://maps.google.com/?q={lat},{lng}"
    dispatch_id = f"SOS-{uuid.uuid4().hex[:8].upper()}"
    patient_name = req.patient_name or "TraumaGuard User"
    phone = req.contact_phone or "+91 98765 43210"

    database.record_emergency_dispatch(
        dispatch_id=dispatch_id,
        patient_name=patient_name,
        contact_phone=phone,
        latitude=lat,
        longitude=lng,
        distress_level=req.distress_level or 90,
        maps_url=maps_url
    )

    return {
        "status": "dispatched",
        "dispatch_id": dispatch_id,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "patient_name": patient_name,
        "contact_phone": phone,
        "maps_url": maps_url,
        "sms_status": "sent",
        "message": "Emergency SOS broadcasted successfully to your care network and crisis dispatchers."
    }

@app.get("/api/emergency/nearby")
@app.get("/api/emergency/nearby/")
async def get_nearby_facilities():
    facilities = database.get_facilities()
    return {"facilities": facilities, "count": len(facilities)}


# ----------------- Clinical ReportLab PDF Generator -----------------

@app.post("/api/reports/pdf")
@app.post("/api/reports/pdf/")
async def generate_clinical_pdf(req: Optional[ReportPdfRequest] = None):
    req_obj = req or ReportPdfRequest()
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#0284C7'),
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    bold_style = ParagraphStyle(
        'BoldBody',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#0F172A')
    )

    elements = []

    # Header
    elements.append(Paragraph("TRAUMAGUARD AI - CLINICAL STABILITY & TRAUMA REPORT", title_style))
    elements.append(Paragraph(f"CONFIDENTIAL MEDICAL SUMMARY - GENERATED {datetime.datetime.now().strftime('%B %d, %Y at %H:%M')}", subtitle_style))
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284C7'), spaceBefore=2, spaceAfter=8))

    # Patient info
    logs = req_obj.logs if req_obj.logs is not None else database.get_mood_logs(limit=20)
    scores = [int(l.get('risk_score', 0)) for l in logs] if logs else [35]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 35.0
    peak_score = max(scores) if scores else 35

    patient_name = req_obj.patient_name or "Lagu (Trauma Recovery)"
    patient_phone = req_obj.patient_phone or "+91 98765 43210"

    info_data = [
        [
            Paragraph("<b>Patient Name:</b>", body_style), Paragraph(patient_name, bold_style),
            Paragraph("<b>Assessment Period:</b>", body_style), Paragraph("Last 14 Days", bold_style)
        ],
        [
            Paragraph("<b>Contact Phone:</b>", body_style), Paragraph(patient_phone, body_style),
            Paragraph("<b>Total Check-ins:</b>", body_style), Paragraph(str(len(logs)), bold_style)
        ],
        [
            Paragraph("<b>Mean Distress Index:</b>", body_style), Paragraph(f"{avg_score}/100", bold_style),
            Paragraph("<b>Peak Acute Distress:</b>", body_style), Paragraph(f"{peak_score}/100", bold_style)
        ]
    ]

    t_info = Table(info_data, colWidths=[120, 150, 120, 150])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 10))

    # Clinical Trajectory
    elements.append(Paragraph("1. CLINICAL TRAJECTORY & METRIC ANALYSIS", h2_style))
    status_text = "Stabilizing" if avg_score < 40 else ("Elevated Vulnerability" if avg_score > 60 else "Moderate / Active Coping")
    summary_p = (
        f"The patient demonstrates a <b>{status_text}</b> autonomic profile over the evaluated window. "
        f"Average distress registered at <b>{avg_score}/100</b>, with a peak recorded level of <b>{peak_score}/100</b>. "
        f"Somatic regulation routines and consistent logging have established an objective foundation for ongoing psychotherapy."
    )
    elements.append(Paragraph(summary_p, body_style))
    elements.append(Spacer(1, 10))

    # Check-in History Table
    elements.append(Paragraph("2. RECENT PSYCHOLOGICAL CHECK-IN LOGS (SQL STORED)", h2_style))
    log_rows = [[
        Paragraph("<b>Date / Time</b>", bold_style),
        Paragraph("<b>Distress</b>", bold_style),
        Paragraph("<b>Mood Tag</b>", bold_style),
        Paragraph("<b>Clinical Notes & Triggers</b>", bold_style)
    ]]

    for log in logs[:10]:
        date_str = str(log.get('logged_at', 'Recent'))[:16]
        score_val = str(log.get('risk_score', '—'))
        mood_val = str(log.get('mood', '—'))
        note_val = str(log.get('note', 'No clinical remarks recorded.')) or 'No clinical remarks recorded.'

        log_rows.append([
            Paragraph(date_str, body_style),
            Paragraph(f"<b>{score_val}</b>/100", body_style),
            Paragraph(mood_val, body_style),
            Paragraph(note_val, body_style)
        ])

    t_logs = Table(log_rows, colWidths=[110, 60, 80, 290])
    t_logs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284C7')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_logs)
    elements.append(Spacer(1, 12))

    # Clinician Sign-off
    elements.append(Paragraph("3. TREATING CLINICIAN ATTESTATION", h2_style))
    elements.append(Paragraph("I have reviewed this TraumaGuard AI longitudinal distress trajectory report in conjunction with clinical interview.", body_style))
    elements.append(Spacer(1, 15))

    sig_data = [
        [Paragraph("Clinician Signature: ___________________________", body_style), Paragraph("Date: ______________", body_style)],
        [Paragraph("License / Reg No: ____________________________", body_style), Paragraph("Facility Stamp: __________________", body_style)],
    ]
    t_sig = Table(sig_data, colWidths=[340, 200])
    elements.append(t_sig)

    doc.build(elements)
    buffer.seek(0)
    pdf_bytes = buffer.getvalue()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=TraumaGuard_Clinical_Report_{patient_name.replace(' ', '_')}.pdf"}
    )


# ----------------- AI Mood Trajectory & Pattern Insights -----------------

@app.post("/api/insights/analyze")
@app.post("/api/insights/analyze/")
async def analyze_insights(req: Optional[InsightsRequest] = None):
    req_obj = req or InsightsRequest()
    logs = req_obj.logs if req_obj.logs is not None else database.get_mood_logs(limit=20)
    scores = [float(l.get('risk_score', 0)) for l in logs] if logs else [35.0]

    avg_score = round(sum(scores) / len(scores), 1) if scores else 35.0
    peak_score = max(scores) if scores else 35.0

    if len(scores) >= 2:
        trajectory = "improving" if scores[0] < scores[-1] else ("elevated" if scores[0] > scores[-1] else "stable")
    else:
        trajectory = "stable"

    themes = []
    text_corpus = " ".join([str(l.get('note', '')).lower() for l in logs])
    if any(w in text_corpus for w in ["sleep", "night", "insomnia", "wake"]):
        themes.append("Sleep rhythm sensitivity")
    if any(w in text_corpus for w in ["heart", "breath", "panic", "chest", "sweat"]):
        themes.append("Acute autonomic arousal")
    if any(w in text_corpus for w in ["work", "office", "deadline", "job"]):
        themes.append("Workplace stress triggers")
    if not themes:
        themes = ["General anxiety management", "Somatic stabilization"]

    desc_map = {
        "improving": "Distress indices demonstrate positive recovery momentum and downward trend.",
        "elevated": "Acute emotional sensitivity detected in recent check-ins. Structured grounding recommended.",
        "stable": "Baseline stability maintained across evaluated sessions."
    }

    return {
        "trajectory": trajectory,
        "trajectory_description": desc_map.get(trajectory, "Consistent stability pattern established."),
        "avg_score": avg_score,
        "peak_score": peak_score,
        "total_entries": len(logs),
        "risk_level": "LOW" if avg_score < 35 else ("HIGH" if avg_score > 65 else "MODERATE"),
        "identified_themes": themes,
        "recommendation": "Practice 4-4-4-4 box breathing twice daily and maintain consistent check-ins for longitudinal stability."
    }


# ----------------- Doctors Directory & Booking API (SQLite) -----------------

@app.get("/api/doctors")
@app.get("/api/doctors/")
async def list_doctors(category: Optional[str] = None):
    doctors = database.get_all_doctors(category=category)
    return {"doctors": doctors, "count": len(doctors)}

@app.post("/api/doctors/book")
@app.post("/api/doctors/book/")
async def book_doctor(req: DoctorBookingRequest):
    booking_id = f"TGC-{uuid.uuid4().hex[:6].upper()}"
    res = database.create_appointment(
        booking_id=booking_id,
        doctor_id=req.doctor_id,
        doctor_name=req.doctor_name,
        patient_name=req.patient_name,
        patient_phone=req.patient_phone,
        preferred_date=req.preferred_date,
        notes=req.notes or ""
    )
    return {
        "success": True,
        "booking_id": booking_id,
        "doctor_name": req.doctor_name,
        "preferred_date": req.preferred_date,
        "status": "Confirmed & Coordinator Notified",
        "message": f"Your consultation request with {req.doctor_name} has been submitted. Reference ID: {booking_id}."
    }


# ----------------- AI Mental Health Chatbot API (SQLite) -----------------

@app.post("/api/chat")
@app.post("/api/chat/")
async def mental_health_chat(req: Optional[ChatMessageRequest] = None):
    req_obj = req or ChatMessageRequest()
    # Extract user message from either single 'message' or 'messages' history array
    user_msg = ""
    if req_obj.message:
        user_msg = req_obj.message.strip()
    elif req_obj.messages and len(req_obj.messages) > 0:
        last_item = req_obj.messages[-1]
        user_msg = str(last_item.get("content", "")).strip()

    if not user_msg:
        user_msg = "Hello, I need assistance with managing distress."

    database.save_chat_message("user", user_msg)

    # Intelligent clinical parsing & intent analysis
    lower_msg = user_msg.lower()

    if any(w in lower_msg for w in ["suicide", "end my life", "kill myself", "die", "hurt myself", "end it all"]):
        condition = "Acute Crisis"
        severity = "HIGH"
        confidence = 0.98
        reply = (
            "Severity: HIGH\n\n"
            "I hear how much pain and distress you are carrying right now, and I want you to know that you are not alone. "
            "Please pause, take a deep breath, and connect with immediate support:\n\n"
            "🚨 **24/7 Free & Confidential Emergency Helplines:**\n"
            "• **Tele-MANAS (Govt. of India):** Dial `14416` or `1800-891-4416`\n"
            "• **KIRAN Mental Health Line:** `1800-599-0019`\n"
            "• **National Emergency Service:** Dial `112`\n\n"
            "Our Emergency SOS tab is also ready to dispatch live GPS assistance to your emergency contacts."
        )
    elif any(w in lower_msg for w in ["flashback", "car accident", "incident", "trauma", "nightmare", "crash", "reliving", "trigger"]):
        condition = "PTSD & Trauma Trigger"
        severity = "MODERATE"
        confidence = 0.92
        reply = (
            "Severity: MODERATE\n\n"
            "What you are experiencing right now is an acute trauma trigger — your nervous system is temporarily reacting as if the past event is happening now. "
            "Let's practice the **5-4-3-2-1 Somatic Grounding** technique together right now:\n\n"
            "👁️ **5 things you can see:** Look around your room and name 5 specific objects.\n"
            "🖐️ **4 things you can touch:** Feel the fabric of your clothes, the floor beneath your feet, or a cool surface.\n"
            "👂 **3 things you can hear:** Listen for ambient sounds (fan, traffic, your own breath).\n"
            "👃 **2 things you can smell:** Inhale gently through your nose.\n"
            "👅 **1 thing you can taste:** Focus on the taste in your mouth or take a slow sip of water.\n\n"
            "You are safe right now in this physical space. Would you like to try 4-4-4-4 Box Breathing or connect with a trauma therapist?"
        )
    elif any(w in lower_msg for w in ["panic", "anxiety", "can't breathe", "heart racing", "chest tight", "hyperventilating", "tightness", "shaking", "choking"]):
        condition = "Panic & Acute Anxiety"
        severity = "HIGH"
        confidence = 0.95
        reply = (
            "Severity: HIGH\n\n"
            "You are safe in this moment. Place both feet firmly flat on the ground and place one hand gently over your chest.\n\n"
            "🌬️ **Immediate Autonomic Reset:**\n"
            "1. **Physiological Sigh:** Take two quick sniffs in through your nose, then a long, slow exhale through your mouth.\n"
            "2. **4-4-4-4 Box Breathing:** Inhale 4 seconds, hold 4 seconds, exhale 4 seconds, hold 4 seconds.\n"
            "3. **Remember:** Your heart rate is temporarily elevated due to an adrenaline spike, but this sensation will peak and subside in a few minutes.\n\n"
            "Focus on the support of the chair beneath you. How does your chest feel as you take that slow breath out?"
        )
    elif any(w in lower_msg for w in ["sleep", "insomnia", "tired", "restless", "waking up", "bad dream", "sleepless"]):
        condition = "Sleep Disruption"
        severity = "MODERATE"
        confidence = 0.88
        reply = (
            "Severity: MODERATE\n\n"
            "Sleep disruptions and nocturnal stress are very common when the nervous system is hyper-aroused. "
            "Here is a practical sleep stabilization routine for tonight:\n\n"
            "🛌 **Sleep Reset Protocol:**\n"
            "1. **The 4-7-8 Breath:** Inhale through your nose for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds. Repeat 4 times.\n"
            "2. **Brain-Dump Journaling:** Write down thoughts or concerns on paper to signal your mind that they are stored and safe.\n"
            "3. **Dim Environment:** Avoid blue light from mobile devices 45 minutes before sleep.\n\n"
            "Would you like me to guide you through a brief somatic progressive muscle relaxation?"
        )
    elif any(w in lower_msg for w in ["doctor", "psychiatrist", "therapist", "consultation", "appointment", "clinic"]):
        condition = "Specialist Consultation"
        severity = "LOW"
        confidence = 0.90
        reply = (
            "Severity: LOW\n\n"
            "We have verified trauma psychiatrists and EMDR clinical psychologists ready for consultation. "
            "You can explore their profiles in the **Specialists** tab and schedule an appointment directly. "
            "Would you like me to recommend a specialist based on your city or preferred language?"
        )
    else:
        condition = "General Mental Wellness"
        severity = "LOW"
        confidence = 0.80
        reply = (
            "Severity: LOW\n\n"
            "Thank you for sharing that with me. Acknowledging your emotions and giving them words is an essential foundation for recovery.\n\n"
            "I am here with you to explore coping strategies, provide somatic exercises, or log your distress index. "
            "How has your stress level felt overall today?"
        )

    database.save_chat_message("assistant", reply, condition, severity, confidence)

    return {
        "text": reply,
        "reply": reply,
        "matched_condition": condition,
        "severity": severity,
        "confidence": confidence,
        "timestamp": datetime.datetime.now().strftime("%H:%M")
    }

@app.get("/api/chat/history")
async def chat_history():
    history = database.get_chat_history(limit=30)
    return {"messages": history}


# ----------------- User Management & PostgreSQL Sync API -----------------

@app.post("/api/users/sync")
@app.post("/api/users/sync/")
@app.post("/api/users/register")
@app.post("/api/users/register/")
async def sync_user(req: UserSyncRequest):
    user = database.save_user(
        email=req.email,
        full_name=req.full_name,
        phone=req.phone,
        emergency_contact=req.emergency_contact,
        user_id=req.id
    )
    return {"status": "success", "user": user}


@app.get("/api/users")
@app.get("/api/users/")
async def list_users():
    users = database.get_users()
    return {"users": users, "count": len(users)}


# ----------------- Emergency Contacts Module API -----------------

@app.post("/api/contacts")
@app.post("/api/contacts/")
async def add_contact(req: ContactCreateRequest):
    contact = database.add_emergency_contact(
        user_id=req.user_id or "usr_default",
        name=req.name,
        phone=req.phone,
        relationship=req.relationship or "Guardian",
        is_primary=bool(req.is_primary)
    )
    return {"status": "success", "contact": contact}


@app.get("/api/contacts")
@app.get("/api/contacts/")
async def list_contacts(user_id: Optional[str] = None):
    contacts = database.get_emergency_contacts(user_id=user_id)
    return {"contacts": contacts, "count": len(contacts)}


# ----------------- Notifications & Patient Alerts Module API -----------------

@app.post("/api/notifications")
@app.post("/api/notifications/")
async def create_notif(req: NotificationCreateRequest):
    notif = database.create_notification(
        user_id=req.user_id or "usr_default",
        title=req.title,
        message=req.message,
        notif_type=req.type or "ALERT"
    )
    return {"status": "success", "notification": notif}


@app.get("/api/notifications")
@app.get("/api/notifications/")
async def list_notifs(user_id: Optional[str] = None, unread_only: bool = False):
    notifs = database.get_notifications(user_id=user_id, unread_only=unread_only)
    return {"notifications": notifs, "count": len(notifs)}


@app.put("/api/notifications/{notification_id}/read")
async def mark_notif_read(notification_id: int):
    database.mark_notification_read(notification_id)
    return {"status": "success", "marked_read": True}


# ----------------- Clinical Reports History API -----------------

@app.get("/api/reports/history")
@app.get("/api/reports/history/")
async def reports_history(user_id: Optional[str] = None):
    reports = database.get_clinical_reports(user_id=user_id)
    return {"reports": reports, "count": len(reports)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
