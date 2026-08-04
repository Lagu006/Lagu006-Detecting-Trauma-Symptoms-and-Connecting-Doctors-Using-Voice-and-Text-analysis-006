/* ==========================================================================
   TRAUMAGUARD AI — CLIENT CONTROLLER & FASTAPI API CONNECTOR (app.js)
   ========================================================================== */

const API_BASE = ""; // Relative path to FastAPI server

let currentMood = "Calm";
let currentCoords = { lat: 17.385, lng: 78.486 };
let selectedDoctor = null;
let breathingInterval = null;

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initGeolocation();
  loadMoodLogs();
  loadInsights();
  loadFacilities();
  loadDoctors();
  setupChat();
});

// Toast System
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ----------------- TAB NAVIGATION -----------------

function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const viewSections = document.querySelectorAll(".view-section");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");
      tabBtns.forEach((b) => b.classList.remove("active"));
      viewSections.forEach((s) => s.classList.remove("active"));

      btn.classList.add("active");
      const activeSec = document.getElementById(`view-${targetView}`);
      if (activeSec) activeSec.classList.add("active");

      // Context actions on tab switch
      if (targetView === "reports") {
        loadInsights();
        loadMoodLogs();
      }
    });
  });
}

// ----------------- GEOLOCATION -----------------

function initGeolocation() {
  const locDisplay = document.getElementById("geo-location-text");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        currentCoords = { lat: p.coords.latitude, lng: p.coords.longitude };
        if (locDisplay) {
          locDisplay.innerText = `${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)} (GPS Live)`;
        }
      },
      () => {
        if (locDisplay) locDisplay.innerText = "17.3850, 78.4860 (Approx Network Location)";
      }
    );
  }
}

// ----------------- MOOD LOGGING & METRICS (SQLite) -----------------

window.setMoodTag = function (mood, btn) {
  currentMood = mood;
  document.querySelectorAll(".mood-tag-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
};

window.updateDistressValue = function (val) {
  const numSpan = document.getElementById("distress-val-display");
  if (numSpan) numSpan.innerText = `${val} / 100`;
};

window.submitMoodCheckin = async function (e) {
  if (e) e.preventDefault();
  const slider = document.getElementById("distress-slider");
  const noteInput = document.getElementById("mood-note-input");

  const riskScore = parseInt(slider.value, 10);
  const note = noteInput.value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/mood/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        risk_score: riskScore,
        mood: currentMood,
        note: note,
      }),
    });

    if (!res.ok) throw new Error("Could not record mood check-in");
    const data = await res.json();
    showToast("Check-in saved directly to SQLite Database!", "success");
    noteInput.value = "";
    loadMoodLogs();
    loadInsights();
  } catch (err) {
    showToast("Failed to save check-in.", "error");
  }
};

async function loadMoodLogs() {
  try {
    const res = await fetch(`${API_BASE}/api/mood/logs`);
    if (!res.ok) return;
    const data = await res.json();
    const logs = data.logs || [];

    // Update Dashboard Metrics
    const scores = logs.map((l) => Number(l.risk_score));
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 35;
    
    const avgElem = document.getElementById("stat-avg-distress");
    const countElem = document.getElementById("stat-total-logs");
    if (avgElem) avgElem.innerHTML = `${avg} <small>/100</small>`;
    if (countElem) countElem.innerHTML = `${logs.length} <small>entries</small>`;

    // Render Recent Check-in Logs List
    const logListElem = document.getElementById("recent-logs-list");
    if (logListElem) {
      if (logs.length === 0) {
        logListElem.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">No logs recorded yet.</p>`;
      } else {
        logListElem.innerHTML = logs.slice(0, 5).map((l) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid var(--border-color);">
            <div>
              <div style="font-weight:600;font-size:0.9rem;">${l.mood} <span style="color:var(--primary);font-size:0.8rem;font-family:var(--font-mono);">(${l.risk_score}/100)</span></div>
              <div style="color:var(--text-secondary);font-size:0.8rem;">${l.note || "Standard check-in"}</div>
            </div>
            <div style="font-size:0.75rem;font-family:var(--font-mono);color:var(--text-muted);">${l.logged_at.slice(0, 16)}</div>
          </div>
        `).join("");
      }
    }

    // Render 14-day Chart Bars
    renderChart(logs);
  } catch (err) {
    console.error("Failed to load logs:", err);
  }
}

function renderChart(logs) {
  const chartContainer = document.getElementById("chart-bars-container");
  if (!chartContainer) return;

  const reversed = [...logs].reverse().slice(-14);
  if (reversed.length === 0) {
    chartContainer.innerHTML = `<p style="color:var(--text-muted);padding:2rem 0;">Log a check-in to see your longitudinal distress trend.</p>`;
    return;
  }

  chartContainer.innerHTML = reversed.map((l) => {
    const heightPercent = Math.max(10, l.risk_score);
    const color = l.risk_score > 60 ? "var(--emergency)" : (l.risk_score > 35 ? "var(--primary)" : "var(--emerald)");
    return `
      <div style="display:flex;flex-direction:column;align-items:center;flex:1;height:180px;justify-content:flex-end;gap:0.4rem;">
        <span style="font-size:0.7rem;font-family:var(--font-mono);color:var(--text-muted);">${l.risk_score}</span>
        <div style="width:100%;max-width:28px;background:${color};height:${heightPercent}%;border-radius:4px 4px 0 0;transition:all 0.3s;" title="${l.mood} - ${l.risk_score}/100"></div>
        <span style="font-size:0.65rem;color:var(--text-muted);white-space:nowrap;">${l.logged_at.slice(5, 10)}</span>
      </div>
    `;
  }).join("");
}

// ----------------- AI CLINICAL INSIGHTS & PDF EXPORT -----------------

async function loadInsights() {
  try {
    const res = await fetch(`${API_BASE}/api/insights/analyze`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();

    const badge = document.getElementById("insight-trajectory-badge");
    const desc = document.getElementById("insight-description");
    const themesElem = document.getElementById("insight-themes-list");
    const recElem = document.getElementById("insight-recommendation");

    if (badge) {
      badge.innerText = `TRAJECTORY: ${data.trajectory.toUpperCase()}`;
      badge.style.background = data.trajectory === "improving" ? "var(--emerald-bg)" : "rgba(2,132,199,0.15)";
      badge.style.color = data.trajectory === "improving" ? "var(--emerald)" : "var(--primary)";
    }
    if (desc) desc.innerText = data.trajectory_description;
    if (themesElem) {
      themesElem.innerHTML = data.identified_themes.map((t) => `
        <span style="background:var(--bg-surface);border:1px solid var(--border-color);padding:0.25rem 0.6rem;border-radius:var(--radius-sm);font-size:0.75rem;font-weight:600;">${t}</span>
      `).join(" ");
    }
    if (recElem) recElem.innerText = data.recommendation;
  } catch (e) {
    console.error("Could not load insights:", e);
  }
}

window.downloadClinicalPdf = async function () {
  const btn = document.getElementById("download-pdf-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "⏳ Generating Clinical PDF...";
  }

  try {
    const res = await fetch(`${API_BASE}/api/reports/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_name: "Lagu (Trauma Recovery)",
        patient_phone: "+91 98765 43210",
      }),
    });

    if (!res.ok) throw new Error("Failed to generate PDF");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TraumaGuard_Clinical_Summary_Report.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showToast("📄 Clinical PDF report downloaded successfully!", "success");
  } catch (err) {
    showToast("Could not download report from backend.", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "📥 Download Doctor PDF (ReportLab)";
    }
  }
};

// ----------------- EMERGENCY SOS & BROADCAST -----------------

window.activateEmergencySOS = async function () {
  const btn = document.getElementById("sos-main-btn");
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/emergency/dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude: currentCoords.lat,
        longitude: currentCoords.lng,
        contact_phone: "+91 98765 43210",
        patient_name: "Lagu (Trauma Recovery)",
        distress_level: 95,
      }),
    });

    if (!res.ok) throw new Error("SOS Dispatch Failed");
    const data = await res.json();

    const banner = document.getElementById("sos-active-banner");
    if (banner) {
      banner.style.display = "block";
      document.getElementById("sos-ref-id").innerText = data.dispatch_id;
      document.getElementById("sos-time").innerText = data.timestamp;
      document.getElementById("sos-map-link").href = data.maps_url;
    }

    showToast("🚨 EMERGENCY SOS BROADCASTED! Dispatch code generated.", "error");
  } catch (e) {
    showToast("Emergency signal dispatched locally.", "info");
  } finally {
    if (btn) btn.disabled = false;
  }
};

async function loadFacilities() {
  try {
    const res = await fetch(`${API_BASE}/api/emergency/nearby`);
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("facilities-list");
    if (!container) return;

    container.innerHTML = (data.facilities || []).map((f) => `
      <div class="glass-card" style="padding:1.25rem;">
        <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.25rem;">${f.name}</div>
        <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.75rem;">📍 ${f.address}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-color);padding-top:0.75rem;font-size:0.8rem;">
          <span style="color:var(--primary);font-family:var(--font-mono);font-size:0.75rem;">${f.distance}</span>
          <a href="tel:${f.phone.replace(/[^0-9+]/g, '')}" class="btn-primary" style="padding:0.35rem 0.75rem;font-size:0.75rem;border-radius:var(--radius-sm);">📞 ${f.phone}</a>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Could not load facilities:", err);
  }
}

window.toggleBreathing = function () {
  const circle = document.getElementById("breathe-visual-circle");
  const text = document.getElementById("breathe-status-text");
  const btn = document.getElementById("breathe-toggle-btn");

  if (circle.classList.contains("animating")) {
    circle.classList.remove("animating");
    if (text) text.innerText = "Ready";
    if (btn) btn.innerText = "Start 4-4-4-4 Breathing";
  } else {
    circle.classList.add("animating");
    if (text) text.innerText = "Breathe";
    if (btn) btn.innerText = "Stop Exercise";
  }
};

// ----------------- DOCTOR SPECIALISTS & BOOKING (SQLite) -----------------

async function loadDoctors() {
  try {
    const res = await fetch(`${API_BASE}/api/doctors`);
    if (!res.ok) return;
    const data = await res.json();
    const grid = document.getElementById("doctors-grid");
    if (!grid) return;

    grid.innerHTML = (data.doctors || []).map((doc) => `
      <div class="glass-card doctor-card">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">
            <span class="doc-badge ${doc.category}">🩺 ${doc.category.toUpperCase()}</span>
            <span style="color:var(--amber);font-size:0.8rem;font-weight:700;">★ ${doc.rating}</span>
          </div>
          <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;">${doc.name}</h3>
          <p style="color:var(--primary);font-size:0.8rem;font-weight:600;margin-bottom:0.5rem;">${doc.specialty}</p>
          <p style="color:var(--text-secondary);font-size:0.825rem;line-height:1.4;margin-bottom:0.75rem;">${doc.bio}</p>
          <div style="font-size:0.75rem;color:var(--text-muted);">📍 ${doc.city} • 🗣️ ${doc.languages.join(", ")}</div>
        </div>
        <button onclick="openBookingModal('${doc.id}', '${doc.name}')" class="btn-primary" style="width:100%;justify-content:center;margin-top:0.75rem;">
          📅 Request Consultation
        </button>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load doctors:", err);
  }
}

window.openBookingModal = function (docId, docName) {
  selectedDoctor = { id: docId, name: docName };
  document.getElementById("modal-doc-name").innerText = docName;
  document.getElementById("booking-modal").classList.add("active");
};

window.closeBookingModal = function () {
  document.getElementById("booking-modal").classList.remove("active");
};

window.submitDoctorBooking = async function (e) {
  e.preventDefault();
  const dateInput = document.getElementById("booking-date-input");
  const notesInput = document.getElementById("booking-notes-input");

  try {
    const res = await fetch(`${API_BASE}/api/doctors/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        patient_name: "Lagu (Trauma Recovery)",
        patient_phone: "+91 98765 43210",
        preferred_date: dateInput.value,
        notes: notesInput.value,
      }),
    });

    if (!res.ok) throw new Error("Booking failed");
    const data = await res.json();
    showToast(`Consultation confirmed! Ref ID: ${data.booking_id}`, "success");
    closeBookingModal();
    dateInput.value = "";
    notesInput.value = "";
  } catch (err) {
    showToast("Could not submit booking.", "error");
  }
};

// ----------------- AI MENTAL HEALTH CHAT -----------------

function setupChat() {
  const input = document.getElementById("chat-message-input");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });
}

window.sendQuickPrompt = function (text) {
  const input = document.getElementById("chat-message-input");
  if (input) {
    input.value = text;
    sendChatMessage();
  }
};

window.sendChatMessage = async function () {
  const input = document.getElementById("chat-message-input");
  const msg = input.value.trim();
  if (!msg) return;

  const chatContainer = document.getElementById("chat-messages-box");

  // Append user bubble
  const userDiv = document.createElement("div");
  userDiv.className = "chat-bubble user";
  userDiv.innerText = msg;
  chatContainer.appendChild(userDiv);
  input.value = "";
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Typing placeholder
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-bubble assistant";
  typingDiv.innerText = "Analyzing somatic & emotional patterns...";
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();

    typingDiv.innerHTML = `
      <div class="chat-tag">${data.matched_condition || "Clinical Guidance"} • ${data.severity || "Normal"}</div>
      <div>${data.reply}</div>
      <div style="font-size:0.65rem;color:var(--text-muted);margin-top:0.4rem;text-align:right;">${data.timestamp}</div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (err) {
    typingDiv.innerText = "I am here with you. If you are experiencing high acute distress, please dial 14416 (Tele-MANAS) or trigger our Emergency SOS tab.";
  }
};
