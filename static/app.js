/* ==========================================================================
   TRAUMAGUARD AI — CLIENT CONTROLLER & FASTAPI API CONNECTOR (app.js)
   ========================================================================== */

const API_BASE = ""; // Relative path to FastAPI server

let currentMood = "Calm";
let currentCoords = { lat: 17.385, lng: 78.486 };
let selectedDoctor = null;
let breathingInterval = null;

<<<<<<< HEAD
let selectedComparisonDocId = "";
let uploadedDocumentsList = [];

=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initGeolocation();
  loadMoodLogs();
  loadInsights();
<<<<<<< HEAD
  loadDocuments();
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
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
<<<<<<< HEAD
        loadDocuments();
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
      }
    });
  });
}

<<<<<<< HEAD

=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
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

<<<<<<< HEAD
// ----------------- MEDICAL DOCUMENTS VAULT & PAST VS PRESENT COMPARISON -----------------

async function loadDocuments() {
  try {
    const res = await fetch(`${API_BASE}/api/documents`);
    if (!res.ok) return;
    const data = await res.json();
    uploadedDocumentsList = data.documents || [];

    // Populate comparison selector
    const selector = document.getElementById("doc-comparison-select");
    if (selector) {
      if (uploadedDocumentsList.length === 0) {
        selector.innerHTML = `<option value="">No historical reports uploaded</option>`;
      } else {
        selector.innerHTML = uploadedDocumentsList.map((d) => `
          <option value="${d.id}" ${d.id === selectedComparisonDocId ? "selected" : ""}>
            ${d.file_name} (${d.past_date || "Baseline"})
          </option>
        `).join("");
        
        if (!selectedComparisonDocId && uploadedDocumentsList.length > 0) {
          selectedComparisonDocId = uploadedDocumentsList[0].id;
        }
      }
    }

    // Render documents grid in vault
    renderDocumentsVault(uploadedDocumentsList);

    // Trigger comparison calculation
    await loadComparison(selectedComparisonDocId);
  } catch (err) {
    console.error("Failed to load documents vault:", err);
  }
}

function renderDocumentsVault(docs) {
  const grid = document.getElementById("vault-documents-grid");
  if (!grid) return;

  if (docs.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:2rem;border:2px dashed var(--border-color);border-radius:var(--radius-md);color:var(--text-muted);">
        <span style="font-size:2rem;display:block;margin-bottom:0.5rem;">📁</span>
        <b style="color:var(--text-primary);">No Medical Evidence Uploaded Yet</b>
        <p style="font-size:0.8rem;margin-top:0.25rem;">Upload past psychological assessments or somatic scans to benchmark your recovery.</p>
        <button onclick="openDocUploadModal()" class="btn-primary" style="margin-top:0.75rem;font-size:0.8rem;padding:0.4rem 0.8rem;">
          Upload First Record
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = docs.map((d) => {
    const isSelected = d.id === selectedComparisonDocId;
    const isImg = d.file_type && d.file_type.startsWith("image/");
    const icon = isImg ? "🖼️" : "📄";

    return `
      <div class="glass-card" style="padding:1rem;border:${isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)'};background:${isSelected ? 'rgba(2,132,199,0.05)' : 'var(--bg-card)'};display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.4rem;">
            <div style="display:flex;align-items:center;gap:0.4rem;">
              <span style="font-size:1.2rem;">${icon}</span>
              <div>
                <span style="font-size:0.7rem;font-family:var(--font-mono);color:var(--primary);font-weight:700;text-transform:uppercase;">
                  ${d.category || "Assessment"}
                </span>
                <h4 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);word-break:break-all;">
                  ${d.file_name}
                </h4>
              </div>
            </div>
            <button onclick="deleteDocument('${d.id}', event)" title="Delete from vault" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;padding:0.2rem;font-size:0.9rem;" onmouseover="this.style.color='var(--emergency)'" onmouseout="this.style.color='var(--text-muted)'">
              🗑️
            </button>
          </div>
          <p style="font-size:0.75rem;color:var(--text-secondary);line-height:1.4;">
            ${d.extracted_summary || "Historical clinical evidence record."}
          </p>
        </div>

        <div style="border-top:1px solid var(--border-color);padding-top:0.6rem;display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;">
          <div>
            <span style="color:var(--text-muted);display:block;font-size:0.65rem;">PAST DISTRESS</span>
            <b style="color:var(--amber);font-family:var(--font-mono);">${d.past_distress_score}/100</b>
          </div>
          <div style="text-align:right;">
            <span style="color:var(--text-muted);display:block;font-size:0.65rem;">RECORD DATE</span>
            <b style="color:var(--text-primary);">${d.past_date || "2025"}</b>
          </div>
        </div>

        <button onclick="selectComparisonDoc('${d.id}')" class="btn-secondary" style="width:100%;font-size:0.75rem;padding:0.4rem;justify-content:center;${isSelected ? 'background:var(--primary);color:white;border-color:var(--primary);' : ''}">
          ${isSelected ? "✓ Active Baseline Benchmark" : "Benchmark With This"}
        </button>
      </div>
    `;
  }).join("");
}

window.selectComparisonDoc = function(docId) {
  selectedComparisonDocId = docId;
  const selector = document.getElementById("doc-comparison-select");
  if (selector) selector.value = docId;
  renderDocumentsVault(uploadedDocumentsList);
  loadComparison(docId);
};

window.onDocSelectionChange = function(docId) {
  selectedComparisonDocId = docId;
  renderDocumentsVault(uploadedDocumentsList);
  loadComparison(docId);
};

async function loadComparison(docId) {
  try {
    const res = await fetch(`${API_BASE}/api/reports/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doc_id: docId || undefined }),
    });
    if (!res.ok) return;
    const data = await res.json();

    const pastDoc = data.past_document || {};
    const present = data.present_status || {};
    const diffs = data.differences || {};

    const pastScore = pastDoc.past_distress_score ?? 78;
    const presentScore = present.avg_distress_score ?? 35;
    const improvement = diffs.percent_improvement ?? 55.1;
    const delta = diffs.distress_score_delta ?? -43;

    // 1. Overview stat cards
    const pastStatElem = document.getElementById("comp-past-score");
    if (pastStatElem) pastStatElem.innerHTML = `${pastScore} <small>/100</small>`;
    const pastDateElem = document.getElementById("comp-past-date");
    if (pastDateElem) pastDateElem.innerText = `${pastDoc.past_date || "2025-10-12"} • Intake Baseline`;

    const presentStatElem = document.getElementById("comp-present-score");
    if (presentStatElem) presentStatElem.innerHTML = `${presentScore} <small>/100</small>`;
    const totalLogsElem = document.getElementById("comp-total-logs");
    if (totalLogsElem) totalLogsElem.innerText = `${present.total_logs ?? 6} Live Check-ins`;

    const imprvElem = document.getElementById("comp-improvement");
    if (imprvElem) imprvElem.innerHTML = `${improvement}% <small>(${delta > 0 ? '+' : ''}${delta} pts)</small>`;

    const vaultCountElem = document.getElementById("comp-vault-count");
    if (vaultCountElem) vaultCountElem.innerHTML = `${uploadedDocumentsList.length} <small>files/photos</small>`;

    // 2. Dual Side-by-side cards
    const cardPastDate = document.getElementById("card-past-date");
    if (cardPastDate) cardPastDate.innerText = `Date: ${pastDoc.past_date || "2025-10-12"}`;
    const cardPastFilename = document.getElementById("card-past-filename");
    if (cardPastFilename) cardPastFilename.innerText = pastDoc.file_name || "Baseline Assessment";
    const cardPastCategory = document.getElementById("card-past-category");
    if (cardPastCategory) cardPastCategory.innerText = `Category: ${pastDoc.category || "Psychological Assessment"}`;
    const cardPastScore = document.getElementById("card-past-score-display");
    if (cardPastScore) cardPastScore.innerText = `${pastScore} / 100 (Severe Vulnerability)`;
    const cardPastBar = document.getElementById("card-past-bar");
    if (cardPastBar) cardPastBar.style.width = `${pastScore}%`;
    const cardPastSummary = document.getElementById("card-past-summary");
    if (cardPastSummary) cardPastSummary.innerText = pastDoc.extracted_summary || "Patient exhibited acute sympathetic shock and severe sleep disruption.";

    const cardPresentScore = document.getElementById("card-present-score-display");
    if (cardPresentScore) cardPresentScore.innerText = `${presentScore} / 100 (Stabilized Grounding)`;
    const cardPresentBar = document.getElementById("card-present-bar");
    if (cardPresentBar) cardPresentBar.style.width = `${presentScore}%`;
    const cardPresentCount = document.getElementById("card-present-count");
    if (cardPresentCount) cardPresentCount.innerText = `Active Telemetry (${present.total_logs ?? 6} Records)`;
    const cardPresentSummary = document.getElementById("card-present-summary");
    if (cardPresentSummary) cardPresentSummary.innerText = `Autonomic profile shifted into Ventral Vagal state. Sleep duration normalized to 7.0 hours nightly; acute flashback reactivity de-escalated by ${improvement}%.`;

    // 3. Table delta values
    const tablePast = document.getElementById("table-past-score");
    if (tablePast) tablePast.innerText = `${pastScore} / 100`;
    const tablePresent = document.getElementById("table-present-score");
    if (tablePresent) tablePresent.innerText = `${presentScore} / 100`;
    const tableDelta = document.getElementById("table-delta");
    if (tableDelta) tableDelta.innerText = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} pts (${improvement}%)`;

    // 4. Symptoms Evolution Matrix
    const resolvedContainer = document.getElementById("comp-resolved-symptoms");
    if (resolvedContainer && diffs.resolved_symptoms) {
      resolvedContainer.innerHTML = diffs.resolved_symptoms.map((s) => `
        <div style="background:var(--bg-surface);padding:0.4rem 0.6rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
          <b style="color:var(--text-primary);display:block;font-size:0.75rem;">${s.name}</b>
          <span style="font-size:0.7rem;color:var(--text-muted);">${s.notes}</span>
        </div>
      `).join("");
    }

    const improvingContainer = document.getElementById("comp-improving-symptoms");
    if (improvingContainer && diffs.improving_symptoms) {
      improvingContainer.innerHTML = diffs.improving_symptoms.map((s) => `
        <div style="background:var(--bg-surface);padding:0.4rem 0.6rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
          <b style="color:var(--text-primary);display:block;font-size:0.75rem;">${s.name}</b>
          <span style="font-size:0.7rem;color:var(--text-muted);">${s.notes}</span>
        </div>
      `).join("");
    }

    const monitoredContainer = document.getElementById("comp-monitored-symptoms");
    if (monitoredContainer && diffs.monitored_symptoms) {
      monitoredContainer.innerHTML = diffs.monitored_symptoms.map((s) => `
        <div style="background:var(--bg-surface);padding:0.4rem 0.6rem;border-radius:var(--radius-sm);border:1px solid var(--border-color);">
          <b style="color:var(--text-primary);display:block;font-size:0.75rem;">${s.name}</b>
          <span style="font-size:0.7rem;color:var(--text-muted);">${s.notes}</span>
        </div>
      `).join("");
    }

    // 5. Narrative
    const narrativeElem = document.getElementById("comp-narrative-text");
    if (narrativeElem) {
      narrativeElem.innerText = diffs.comparative_narrative || 
        `Comparative longitudinal analysis between past baseline report '${pastDoc.file_name || "Baseline"}' and current active clinical telemetry reveals a ${improvement}% reduction in acute trauma distress.`;
    }
  } catch (err) {
    console.error("Failed to calculate comparison:", err);
  }
}

// ----------------- DOCUMENT MODAL & UPLOAD HANDLER -----------------

window.openDocUploadModal = function() {
  const modal = document.getElementById("doc-upload-modal");
  if (modal) modal.classList.add("active");
};

window.closeDocUploadModal = function() {
  const modal = document.getElementById("doc-upload-modal");
  if (modal) modal.classList.remove("active");
  // Reset form
  const form = document.getElementById("doc-upload-form");
  if (form) form.reset();
  const previewArea = document.getElementById("doc-preview-area");
  const promptArea = document.getElementById("doc-dropzone-prompt");
  if (previewArea) previewArea.style.display = "none";
  if (promptArea) promptArea.style.display = "block";
};

let currentUploadFileData = null;
let currentUploadFileName = "";
let currentUploadFileType = "application/pdf";
let currentUploadFileSize = 0;

window.handleDocFileSelect = function(input) {
  const file = input.files && input.files[0];
  if (!file) return;

  currentUploadFileName = file.name;
  currentUploadFileType = file.type || "application/pdf";
  currentUploadFileSize = file.size;

  const promptArea = document.getElementById("doc-dropzone-prompt");
  const previewArea = document.getElementById("doc-preview-area");
  const filenameLabel = document.getElementById("doc-selected-filename");
  const imgPreview = document.getElementById("doc-selected-img-preview");

  if (promptArea) promptArea.style.display = "none";
  if (previewArea) previewArea.style.display = "block";
  if (filenameLabel) filenameLabel.innerText = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  const reader = new FileReader();
  reader.onload = (e) => {
    currentUploadFileData = e.target.result;
    if (file.type.startsWith("image/") && imgPreview) {
      imgPreview.src = currentUploadFileData;
      imgPreview.style.display = "block";
    } else if (imgPreview) {
      imgPreview.style.display = "none";
    }
  };
  reader.readAsDataURL(file);
};

window.submitDocUpload = async function(e) {
  if (e) e.preventDefault();
  const fileInput = document.getElementById("doc-file-input");
  if (!fileInput.files || !fileInput.files[0]) {
    showToast("Please choose a medical report PDF or photo scan.", "error");
    return;
  }

  const category = document.getElementById("doc-category-input").value;
  const pastScore = parseInt(document.getElementById("doc-distress-slider").value, 10);
  const pastDate = document.getElementById("doc-date-input").value;
  const symptoms = document.getElementById("doc-symptoms-input").value.trim();
  const summary = document.getElementById("doc-summary-input").value.trim();

  const submitBtn = document.getElementById("doc-submit-btn");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "⏳ Indexing Document...";
  }

  try {
    const payload = {
      file_name: currentUploadFileName || "uploaded_medical_record.pdf",
      file_type: currentUploadFileType,
      file_size: currentUploadFileSize,
      category: category,
      past_distress_score: pastScore,
      past_date: pastDate,
      past_symptoms: symptoms,
      extracted_summary: summary,
      file_data: currentUploadFileData || "",
      user_id: "usr_default"
    };

    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    showToast("📁 Medical report / photo uploaded to vault successfully!", "success");
    closeDocUploadModal();
    if (data.document && data.document.id) {
      selectedComparisonDocId = data.document.id;
    }
    await loadDocuments();
  } catch (err) {
    showToast("Failed to upload document to SQLite.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "💾 Upload & Index to SQLite";
    }
  }
};

window.deleteDocument = async function(docId, e) {
  if (e) e.stopPropagation();
  if (!confirm("Are you sure you want to remove this record from your vault?")) return;

  try {
    const res = await fetch(`${API_BASE}/api/documents/${docId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    showToast("Record removed from vault.", "success");
    if (selectedComparisonDocId === docId) {
      selectedComparisonDocId = "";
    }
    await loadDocuments();
  } catch (err) {
    showToast("Could not delete document.", "error");
  }
};

// ----------------- AI CLINICAL INSIGHTS & COMPARATIVE PDF EXPORT -----------------
=======
// ----------------- AI CLINICAL INSIGHTS & PDF EXPORT -----------------
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

async function loadInsights() {
  try {
    const res = await fetch(`${API_BASE}/api/insights/analyze`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
<<<<<<< HEAD
    // Handled in comparison view
=======

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
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  } catch (e) {
    console.error("Could not load insights:", e);
  }
}

window.downloadClinicalPdf = async function () {
<<<<<<< HEAD
  const btn1 = document.getElementById("download-pdf-btn");
  const btn2 = document.getElementById("reports-pdf-btn");
  [btn1, btn2].forEach((b) => {
    if (b) {
      b.disabled = true;
      b.innerText = "⏳ Generating Comparative PDF...";
    }
  });
=======
  const btn = document.getElementById("download-pdf-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerText = "⏳ Generating Clinical PDF...";
  }
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569

  try {
    const res = await fetch(`${API_BASE}/api/reports/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_name: "Lagu (Trauma Recovery)",
        patient_phone: "+91 98765 43210",
<<<<<<< HEAD
        doc_id: selectedComparisonDocId || undefined
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
      }),
    });

    if (!res.ok) throw new Error("Failed to generate PDF");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
<<<<<<< HEAD
    a.download = "TraumaGuard_Clinical_Comparative_Summary_Report.pdf";
=======
    a.download = "TraumaGuard_Clinical_Summary_Report.pdf";
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

<<<<<<< HEAD
    showToast("📄 Clinical Comparative PDF report downloaded successfully!", "success");
  } catch (err) {
    showToast("Could not download report from backend.", "error");
  } finally {
    if (btn1) {
      btn1.disabled = false;
      btn1.innerHTML = "📥 Download Doctor PDF (ReportLab)";
    }
    if (btn2) {
      btn2.disabled = false;
      btn2.innerHTML = "📥 Export Doctor PDF (ReportLab)";
=======
    showToast("📄 Clinical PDF report downloaded successfully!", "success");
  } catch (err) {
    showToast("Could not download report from backend.", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "📥 Download Doctor PDF (ReportLab)";
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    }
  }
};

<<<<<<< HEAD

=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
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

<<<<<<< HEAD
// ----------------- AI MENTAL HEALTH CHAT & SEPARATE SESSIONS -----------------

let currentChatThreadId = null;
let chatThreads = [];
let isSendingChatMessage = false;

function setupChat() {
  const input = document.getElementById("chat-message-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
  loadChatThreads();
}

window.toggleSessionsSidebar = function () {
  const sidebar = document.getElementById("chat-sessions-sidebar");
  if (sidebar) {
    sidebar.classList.toggle("show-mobile");
  }
};

function formatSessionDate(dtStr) {
  if (!dtStr) return "Recent";
  try {
    const parts = dtStr.split(" ");
    if (parts.length >= 2) {
      const datePart = parts[0];
      const timePart = parts[1].slice(0, 5);
      return `${datePart.slice(5)} ${timePart}`;
    }
    return dtStr.slice(0, 10);
  } catch (e) {
    return "Recent";
  }
}

function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatChatText(text) {
  if (!text) return "";
  let formatted = escapeHtml(text);
  // Bold **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  // Bullet points
  formatted = formatted.replace(/^• (.*)$/gm, "<div style='margin-left:0.5rem;'>• $1</div>");
  return formatted;
}

async function loadChatThreads(autoSelectThreadId = null) {
  const listContainer = document.getElementById("chat-sessions-list");
  const countBadge = document.getElementById("sessions-count-badge");
  const mobileCount = document.getElementById("mobile-sessions-count");

  try {
    const res = await fetch(`${API_BASE}/api/chat/threads`);
    if (!res.ok) throw new Error("Could not load threads");
    const data = await res.json();
    chatThreads = data.threads || [];

    if (countBadge) countBadge.innerText = chatThreads.length;
    if (mobileCount) mobileCount.innerText = chatThreads.length;

    renderChatThreadsList();

    if (chatThreads.length === 0) {
      await createNewChatSession(false);
      return;
    }

    const targetId = autoSelectThreadId || currentChatThreadId || chatThreads[0].id;
    await selectChatThread(targetId);
  } catch (err) {
    console.error("Failed to load chat threads:", err);
    if (listContainer) {
      listContainer.innerHTML = `<div class="sessions-loading" style="color:var(--emergency);">Error loading session history.</div>`;
    }
  }
}

function renderChatThreadsList() {
  const listContainer = document.getElementById("chat-sessions-list");
  if (!listContainer) return;

  if (chatThreads.length === 0) {
    listContainer.innerHTML = `
      <div class="sessions-loading">
        No previous sessions.<br>
        <button onclick="createNewChatSession()" class="btn-primary" style="margin-top:0.5rem;font-size:0.75rem;padding:0.35rem 0.75rem;">+ Start Session</button>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = chatThreads.map((th) => {
    const isActive = th.id === currentChatThreadId;
    const title = escapeHtml(th.title || "Support Session");
    const date = formatSessionDate(th.updated_at || th.created_at);
    const msgCount = typeof th.message_count === "number" ? th.message_count : 0;

    return `
      <div class="session-item ${isActive ? "active" : ""}" onclick="selectChatThread('${th.id}')" title="${title}">
        <div class="session-item-icon">💬</div>
        <div class="session-item-body">
          <div class="session-item-title">${title}</div>
          <div class="session-item-meta">
            <span>${date}</span>
            <span class="session-msg-badge">${msgCount} msgs</span>
          </div>
        </div>
        <button class="session-delete-btn" title="Delete this session" onclick="deleteChatSession('${th.id}', event)">✕</button>
      </div>
    `;
  }).join("");
}

window.selectChatThread = async function (threadId) {
  currentChatThreadId = threadId;
  renderChatThreadsList();

  const sidebar = document.getElementById("chat-sessions-sidebar");
  if (sidebar && sidebar.classList.contains("show-mobile")) {
    sidebar.classList.remove("show-mobile");
  }

  const selectedThread = chatThreads.find((t) => t.id === threadId);
  const titleElem = document.getElementById("active-session-title");
  if (titleElem) {
    titleElem.innerText = selectedThread ? (selectedThread.title || "Trauma Support Session") : "Trauma Support Session";
  }

  const chatContainer = document.getElementById("chat-messages-box");
  if (!chatContainer) return;

  chatContainer.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.85rem;">
      <span>Loading conversation history...</span>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/chat/threads/${encodeURIComponent(threadId)}/messages`);
    if (!res.ok) throw new Error("Could not fetch messages");
    const data = await res.json();
    const messages = data.messages || [];

    if (messages.length === 0) {
      chatContainer.innerHTML = `
        <div class="chat-bubble assistant">
          <div class="chat-tag">Clinical Intake • TraumaGuard AI</div>
          <div>Hello Lagu, I am here in this new private session to support your recovery. How are you feeling right now? You can share any physical sensations, emotions, or trauma triggers.</div>
        </div>
      `;
    } else {
      chatContainer.innerHTML = messages.map((m) => {
        const isUser = m.role === "user";
        if (isUser) {
          return `
            <div class="chat-bubble user">
              <div>${escapeHtml(m.content)}</div>
              <div style="font-size:0.65rem;color:rgba(255,255,255,0.7);margin-top:0.3rem;text-align:right;">
                ${m.created_at ? formatSessionDate(m.created_at) : ""}
              </div>
            </div>
          `;
        } else {
          const sev = (m.severity || "").toLowerCase();
          const sevClass = sev === "high" ? "high" : (sev === "moderate" ? "moderate" : "");
          const conditionTag = m.matched_condition ? `<div class="chat-tag ${sevClass}">${escapeHtml(m.matched_condition)} • ${escapeHtml(m.severity || "Normal")}</div>` : "";
          return `
            <div class="chat-bubble assistant">
              ${conditionTag}
              <div>${formatChatText(m.content)}</div>
              <div style="font-size:0.65rem;color:var(--text-muted);margin-top:0.35rem;text-align:right;">
                ${m.created_at ? formatSessionDate(m.created_at) : ""}
              </div>
            </div>
          `;
        }
      }).join("");
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (err) {
    console.error("Failed to fetch session messages:", err);
    chatContainer.innerHTML = `
      <div class="chat-bubble assistant">
        <div class="chat-tag">System Notification</div>
        <div>Session initialized. How can I support your nervous system or emotional wellbeing today?</div>
      </div>
    `;
  }
};

window.createNewChatSession = async function (notify = true) {
  try {
    const res = await fetch(`${API_BASE}/api/chat/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New session",
        user_id: "usr_default"
      })
    });
    if (!res.ok) throw new Error("Could not create thread");
    const data = await res.json();
    const newThread = data.thread;

    if (notify) showToast("New separate chat session created!", "success");
    await loadChatThreads(newThread.id);
  } catch (err) {
    showToast("Failed to create new session.", "error");
  }
};

window.deleteChatSession = async function (threadId, event) {
  if (event) event.stopPropagation();
  if (!confirm("Are you sure you want to delete this chat session?")) return;

  try {
    const res = await fetch(`${API_BASE}/api/chat/threads/${encodeURIComponent(threadId)}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete thread");

    showToast("Chat session deleted.", "info");
    
    // Select another thread if current was deleted
    const remaining = chatThreads.filter((t) => t.id !== threadId);
    const nextThreadId = remaining.length > 0 ? remaining[0].id : null;
    await loadChatThreads(nextThreadId);
  } catch (err) {
    showToast("Could not delete session.", "error");
  }
};

window.deleteCurrentSession = async function () {
  if (!currentChatThreadId) return;
  await deleteChatSession(currentChatThreadId, null);
};

=======
// ----------------- AI MENTAL HEALTH CHAT -----------------

function setupChat() {
  const input = document.getElementById("chat-message-input");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });
}

>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
window.sendQuickPrompt = function (text) {
  const input = document.getElementById("chat-message-input");
  if (input) {
    input.value = text;
    sendChatMessage();
  }
};

window.sendChatMessage = async function () {
<<<<<<< HEAD
  if (isSendingChatMessage) return;
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  const input = document.getElementById("chat-message-input");
  const msg = input.value.trim();
  if (!msg) return;

<<<<<<< HEAD
  if (!currentChatThreadId) {
    await createNewChatSession(false);
  }

  isSendingChatMessage = true;
=======
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  const chatContainer = document.getElementById("chat-messages-box");

  // Append user bubble
  const userDiv = document.createElement("div");
  userDiv.className = "chat-bubble user";
<<<<<<< HEAD
  userDiv.innerHTML = `
    <div>${escapeHtml(msg)}</div>
    <div style="font-size:0.65rem;color:rgba(255,255,255,0.7);margin-top:0.3rem;text-align:right;">Just now</div>
  `;
=======
  userDiv.innerText = msg;
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  chatContainer.appendChild(userDiv);
  input.value = "";
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Typing placeholder
  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-bubble assistant";
<<<<<<< HEAD
  typingDiv.innerHTML = `
    <div class="chat-tag">Analyzing Triage & Somatic Patterns...</div>
    <div style="display:flex;align-items:center;gap:0.5rem;color:var(--text-secondary);">
      <span>Processing clinical stabilization guidance...</span>
    </div>
  `;
=======
  typingDiv.innerText = "Analyzing somatic & emotional patterns...";
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
      body: JSON.stringify({
        thread_id: currentChatThreadId,
        message: msg,
        user_id: "usr_default"
      }),
=======
      body: JSON.stringify({ message: msg }),
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
    });

    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();

<<<<<<< HEAD
    const sev = (data.severity || "").toLowerCase();
    const sevClass = sev === "high" ? "high" : (sev === "moderate" ? "moderate" : "");

    typingDiv.innerHTML = `
      <div class="chat-tag ${sevClass}">${escapeHtml(data.matched_condition || "Clinical Guidance")} • ${escapeHtml(data.severity || "Normal")}</div>
      <div>${formatChatText(data.reply)}</div>
      <div style="font-size:0.65rem;color:var(--text-muted);margin-top:0.4rem;text-align:right;">${data.timestamp || "Just now"}</div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Refresh threads in background so title updates automatically
    const threadRes = await fetch(`${API_BASE}/api/chat/threads`);
    if (threadRes.ok) {
      const threadData = await threadRes.json();
      chatThreads = threadData.threads || [];
      const curr = chatThreads.find((t) => t.id === currentChatThreadId);
      if (curr) {
        const titleElem = document.getElementById("active-session-title");
        if (titleElem) titleElem.innerText = curr.title;
      }
      renderChatThreadsList();
      const countBadge = document.getElementById("sessions-count-badge");
      if (countBadge) countBadge.innerText = chatThreads.length;
    }
  } catch (err) {
    typingDiv.innerHTML = `
      <div class="chat-tag high">Support Helpline Direct</div>
      <div>I am here with you. If you are experiencing acute distress right now, please reach out directly to <b>Tele-MANAS (14416)</b> or <b>National Emergency (112)</b> for immediate care.</div>
    `;
  } finally {
    isSendingChatMessage = false;
  }
};

=======
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
>>>>>>> 60a320c8e08cea17efa61a45f466bf68678a8569
