"""
TraumaGuard AI - Database & Customer Records Table Viewer
Inspect full customer profiles, login metrics, timestamps, and activity in clean rows & columns.

Usage:
    python view_db.py               (Prints full Customers dossier table)
    python view_db.py users         (Full customer table with login counts & stats)
    python view_db.py logins        (Audit log of individual user login sessions)
    python view_db.py mood_logs     (Recent patient mood check-in records)
    python view_db.py doctors       (Clinical specialists directory)
    python view_db.py appointments  (Consultation bookings)
    python view_db.py chat_messages (AI clinical chat messages)
"""
import sys
import os

# Ensure safe UTF-8 output on Windows PowerShell
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import database


def print_customers_table():
    users = database.get_users()
    print("\n" + "=" * 140)
    print(" [*] TRAUMAGUARD AI -- CUSTOMER MASTER RECORDS & LOGIN METRICS TABLE")
    print("=" * 140)
    
    headers = [
        ("USER ID", 15),
        ("FULL NAME", 22),
        ("EMAIL ADDRESS", 26),
        ("PHONE", 14),
        ("LOGINS", 8),
        ("LAST LOGIN TIME", 20),
        ("CHECK-INS", 10),
        ("AVG DISTRESS", 13),
        ("STATUS", 10),
        ("CREATED DATE", 20)
    ]
    
    header_str = " | ".join([f"{h[0]:<{h[1]}}" for h in headers])
    print(header_str)
    print("-" * 140)
    
    if not users:
        print("  No customer records found.")
    else:
        for u in users:
            uid = str(u.get('id', ''))[:13] + ".." if len(str(u.get('id', ''))) > 15 else str(u.get('id', ''))
            name = str(u.get('full_name', ''))[:20]
            email = str(u.get('email', ''))[:24]
            phone = str(u.get('phone', 'N/A'))[:12]
            logins = str(u.get('login_count', 1))
            last_login = str(u.get('last_login_at', 'Never'))[:19]
            checkins = str(u.get('total_checkins', 0))
            avg_distress = f"{u.get('avg_distress', 0.0)}%"
            status = str(u.get('status', 'Active'))
            created = str(u.get('created_at', ''))[:19]
            
            row = [
                f"{uid:<15}",
                f"{name:<22}",
                f"{email:<26}",
                f"{phone:<14}",
                f"{logins:<8}",
                f"{last_login:<20}",
                f"{checkins:<10}",
                f"{avg_distress:<13}",
                f"{status:<10}",
                f"{created:<20}"
            ]
            print(" | ".join(row))
            
    print("-" * 140)
    print(f" Total Registered Customers: {len(users)}")
    print("=" * 140 + "\n")


def print_logins_table():
    logins = database.get_user_logins(limit=30)
    print("\n" + "=" * 105)
    print(" [*] USER LOGIN SESSIONS AUDIT LOG")
    print("=" * 105)
    headers = [("SESSION ID", 12), ("USER ID", 15), ("EMAIL", 28), ("IP ADDRESS", 16), ("LOGGED AT", 20)]
    print(" | ".join([f"{h[0]:<{h[1]}}" for h in headers]))
    print("-" * 105)
    for l in logins:
        sid = f"#{l.get('id')}"
        uid = str(l.get('user_id', ''))[:13]
        email = str(l.get('email', ''))[:26]
        ip = str(l.get('ip_address', '127.0.0.1'))
        logged = str(l.get('logged_at', ''))[:19]
        print(f"{sid:<12} | {uid:<15} | {email:<28} | {ip:<16} | {logged:<20}")
    print("-" * 105)
    print(f" Total Logins Shown: {len(logins)}\n")


def print_threads_table():
    threads = database.get_chat_threads()
    print("\n" + "=" * 115)
    print(" [*] TRAUMAGUARD AI -- CHAT SESSIONS & THREADS MASTER TABLE")
    print("=" * 115)
    headers = [("SESSION ID", 18), ("USER ID", 16), ("SESSION TITLE", 35), ("MSGS", 8), ("LAST UPDATED", 22)]
    print(" | ".join([f"{h[0]:<{h[1]}}" for h in headers]))
    print("-" * 115)
    if not threads:
        print("  No chat sessions found.")
    else:
        for th in threads:
            tid = str(th.get('id', ''))[:16]
            uid = str(th.get('user_id', ''))[:14]
            title = str(th.get('title', ''))[:33]
            count = str(th.get('message_count', 0))
            updated = str(th.get('updated_at', ''))[:19]
            print(f"{tid:<18} | {uid:<16} | {title:<35} | {count:<8} | {updated:<22}")
    print("-" * 115)
    print(f" Total Chat Sessions: {len(threads)}\n")


def print_chat_messages_table():
    threads = database.get_chat_threads()
    print("\n" + "=" * 135)
    print(" [*] TRAUMAGUARD AI -- CHAT MESSAGES BY SESSION")
    print("=" * 135)
    headers = [("SESSION ID", 18), ("ROLE", 10), ("CONDITION", 24), ("SEVERITY", 10), ("CONTENT SNIPPET", 55)]
    print(" | ".join([f"{h[0]:<{h[1]}}" for h in headers]))
    print("-" * 135)
    total_msgs = 0
    for th in threads:
        msgs = database.get_thread_messages(th['id'])
        for m in msgs:
            total_msgs += 1
            tid = str(m.get('thread_id', ''))[:16]
            role = str(m.get('role', '')).upper()[:8]
            cond = str(m.get('matched_condition', 'N/A') or 'N/A')[:22]
            sev = str(m.get('severity', 'N/A') or 'N/A')[:8]
            content = str(m.get('content', '')).replace("\n", " ")[:53]
            print(f"{tid:<18} | {role:<10} | {cond:<24} | {sev:<10} | {content:<55}")
    print("-" * 135)
    print(f" Total Messages across all sessions: {total_msgs}\n")


def print_generic_table(table_name):
    with database.get_db_cursor() as cur:
        cur.execute(f'SELECT * FROM "{table_name}" ORDER BY 1 DESC LIMIT 25')
        rows = cur.fetchall()
        print(f"\n" + "=" * 90)
        print(f" [*] TABLE: {table_name.upper()}")
        print("=" * 90)
        if not rows:
            print(f"  No records found in table '{table_name}'.")
            return
        columns = list(rows[0].keys())
        print(" | ".join([f"{c.upper()[:20]:<20}" for c in columns]))
        print("-" * 90)
        for r in rows:
            vals = []
            for c in columns:
                v = str(r[c]).replace("\n", " ") if r[c] is not None else "NULL"
                if len(v) > 18:
                    v = v[:16] + ".."
                vals.append(f"{v:<20}")
            print(" | ".join(vals))
        print("-" * 90)
        print(f" Total Rows: {len(rows)}\n")


def main():
    try:
        database.init_db()
    except Exception as e:
        print(f"Database error: {e}")
        return

    arg = sys.argv[1].lower() if len(sys.argv) > 1 else "users"

    if arg in ["users", "customers", "all"]:
        print_customers_table()
    elif arg in ["logins", "sessions", "history"]:
        print_logins_table()
    elif arg in ["threads", "chat_threads"]:
        print_threads_table()
    elif arg in ["chat", "chat_messages", "messages"]:
        print_chat_messages_table()
    else:
        print_generic_table(arg)


if __name__ == "__main__":
    main()

