import time
import database
import main

t0 = time.time()
print("1. DB Init:", round(time.time() - t0, 3), flush=True)

user_msg = "Can you guide me through a 5-4-3-2-1 grounding exercise to calm my anxiety?"
thread_id = "debug_thread_1"
user_id = "usr_debug"

t1 = time.time()
database.save_chat_message("user", user_msg, thread_id=thread_id, user_id=user_id)
print("2. Save message:", round(time.time() - t1, 3), flush=True)

t2 = time.time()
db_messages = database.get_thread_messages(thread_id)
current_state = database.get_user_state(thread_id)
print("3. Get messages & state:", round(time.time() - t2, 3), flush=True)

t3 = time.time()
state = main.analyze_trauma_and_state(user_msg, db_messages, current_state)
print("4. Analyze trauma state:", round(time.time() - t3, 3), "State:", state, flush=True)

t4 = time.time()
summary = main.summarize_conversation_if_needed(thread_id, db_messages, (current_state or {}).get("summary", ""))
print("5. Summarize:", round(time.time() - t4, 3), flush=True)

t5 = time.time()
system_prompt = main.build_traumaguard_system_prompt(state, language="en", summary=summary)
print("6. Build prompt:", round(time.time() - t5, 3), flush=True)

t6 = time.time()
reply = main.build_practical_response(state, user_msg, language="en")
print("7. Build response:", round(time.time() - t6, 3), flush=True)

t7 = time.time()
database.save_chat_message("assistant", reply, thread_id=thread_id, user_id=user_id)
database.save_user_state(thread_id=thread_id, user_id=user_id, severity=state["severity"], primary_concern=state["primary_concern"], risk_level=state["risk_level"], panic_level=state["panic_level"], sleep_issue=state["sleep_issue"], doctor_recommended=state["doctor_recommended"], confidence=state["confidence"], summary=summary)
print("8. Save state & response:", round(time.time() - t7, 3), flush=True)

print("TOTAL TIME:", round(time.time() - t0, 3), flush=True)
