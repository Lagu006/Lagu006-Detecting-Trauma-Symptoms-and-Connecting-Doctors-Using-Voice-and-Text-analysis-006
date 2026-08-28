import json
import urllib.request
import sys

url = "http://127.0.0.1:8000/api/chat"
payload = {
    "thread_id": "test_script_thread",
    "user_id": "usr_test",
    "message": "Can you guide me through a 5-4-3-2-1 grounding exercise to calm my anxiety?",
    "language": "en"
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        print("=== RESPONSE RECEIVED SUCCESSFULLY ===")
        print("HTTP Status:", resp.status)
        print("Matched Condition:", data.get("matched_condition"))
        print("Severity Level:", data.get("severity"))
        print("Confidence:", data.get("confidence"))
        print("\n--- Assistant Message Text ---")
        reply_text = data.get("text") or data.get("reply") or ""
        # Encode safely for Windows console
        sys.stdout.buffer.write(reply_text.encode("utf-8"))
        sys.stdout.buffer.write(b"\n")
except Exception as e:
    print("Error during request:", type(e), e)
