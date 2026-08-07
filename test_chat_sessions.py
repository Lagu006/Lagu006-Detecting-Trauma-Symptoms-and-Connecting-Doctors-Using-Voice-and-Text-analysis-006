import sys
import io

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient
from main import app
import database

def test_endpoints():
    print("Testing chat sessions endpoints with FastAPI TestClient...")
    database.init_db()
    client = TestClient(app)
    
    # 1. Test GET /api/chat/threads
    res = client.get("/api/chat/threads")
    print(f"1. GET /api/chat/threads -> status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    print(f"   Sessions count: {data.get('count', len(data.get('threads', [])))}")
    threads = data.get("threads", [])
    for t in threads[:3]:
        print(f"   - ID: {t.get('id')} | Title: {t.get('title')} | Msgs: {t.get('message_count')}")
    
    # 2. Test POST /api/chat/threads
    res2 = client.post("/api/chat/threads", json={"title": "Test Flashback Support Session", "user_id": "usr_default"})
    print(f"2. POST /api/chat/threads -> status: {res2.status_code}")
    assert res2.status_code == 200, f"Expected 200, got {res2.status_code}"
    new_thread = res2.json().get("thread", {})
    new_thread_id = new_thread.get("id")
    print(f"   Created thread: {new_thread_id} ({new_thread.get('title')})")
    
    # 3. Test POST /api/chat with the new thread
    res3 = client.post("/api/chat", json={
        "thread_id": new_thread_id,
        "message": "I am experiencing acute panic and rapid heartbeat after hearing a loud crash.",
        "user_id": "usr_default"
    })
    print(f"3. POST /api/chat -> status: {res3.status_code}")
    assert res3.status_code == 200, f"Expected 200, got {res3.status_code}"
    chat_data = res3.json()
    print(f"   Matched Condition: {chat_data.get('matched_condition')} | Severity: {chat_data.get('severity')}")
    print(f"   AI Reply Snippet: {chat_data.get('reply', '')[:90]}...")

    # 4. Test GET /api/chat/threads/{thread_id}/messages
    res4 = client.get(f"/api/chat/threads/{new_thread_id}/messages")
    print(f"4. GET /api/chat/threads/{new_thread_id}/messages -> status: {res4.status_code}")
    assert res4.status_code == 200, f"Expected 200, got {res4.status_code}"
    msgs_data = res4.json()
    print(f"   Retrieved {len(msgs_data.get('messages', []))} messages for session {new_thread_id}")
    assert len(msgs_data.get('messages', [])) >= 2, "Expected at least 2 messages (user + assistant)"

    # 5. Test DELETE /api/chat/threads/{thread_id}
    res5 = client.delete(f"/api/chat/threads/{new_thread_id}")
    print(f"5. DELETE /api/chat/threads/{new_thread_id} -> status: {res5.status_code}")
    assert res5.status_code == 200, f"Expected 200, got {res5.status_code}"
    print(f"   Deleted status: {res5.json()}")

    print("\n✅ ALL CHAT SESSION TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_endpoints()

