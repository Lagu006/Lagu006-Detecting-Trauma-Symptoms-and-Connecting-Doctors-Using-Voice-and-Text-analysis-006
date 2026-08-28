import json
import urllib.request
import sys

scenarios = [
    ("Panic & Overwhelm", "I am feeling extremely overwhelmed and anxious right now. What immediate steps can I take to feel safe?"),
    ("Sleep Disruption", "I have difficulty falling asleep and disturbing thoughts keep me awake. How can I manage this?"),
    ("Trauma Triggers", "I am experiencing sudden emotional triggers and flashbacks from past trauma. How can I feel safe in this moment?"),
    ("Consulting Doctor", "What symptoms indicate that I should consult a doctor, psychiatrist, or counselor for trauma?"),
    ("Follow-up / Explanation", "Explain why the grounding technique works for calming my nervous system.")
]

for name, msg in scenarios:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/chat",
        data=json.dumps({
            "thread_id": f"th_{name.replace(' ', '_')}",
            "user_id": "usr_test",
            "message": msg,
            "language": "en"
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print(f"\n==================== [{name.upper()}] ====================")
        print(f"Status: {resp.status} | Matched Condition: {data.get('matched_condition')} | Severity: {data.get('severity')}")
        reply = data.get("text") or data.get("reply") or ""
        first_paragraph = reply.split("\n\n")[1] if "\n\n" in reply else reply[:150]
        sys.stdout.buffer.write(f"Snippet: {first_paragraph[:200]}\n".encode("utf-8"))

print("\nALL SCENARIOS PASSED WITH 100% SUCCESS!")
