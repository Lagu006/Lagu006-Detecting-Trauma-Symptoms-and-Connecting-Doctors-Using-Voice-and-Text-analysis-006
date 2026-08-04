"""
TraumaGuard AI - PostgreSQL Database Quick Viewer Script
Run this script anytime to inspect PostgreSQL database tables directly in your terminal.
Usage:
    python view_db.py                  (Shows summary of all PostgreSQL tables)
    python view_db.py mood_logs        (Shows records from mood_logs)
    python view_db.py doctors          (Shows all doctors)
    python view_db.py chat_messages     (Shows recent chat history)
    python view_db.py emergency_facilities (Shows 24/7 crisis centers)
"""
import sys
import os
import database

def print_divider(title=""):
    print("\n" + "=" * 70)
    if title:
        print(f"  {title}")
        print("=" * 70)

def main():
    try:
        database.init_db()
    except Exception as e:
        print(f"Database connection error: {e}")
        return

    with database.get_db_cursor() as cur:
        # Get all public tables in PostgreSQL
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row['table_name'] for row in cur.fetchall()]

        arg = sys.argv[1] if len(sys.argv) > 1 else None

        if not arg or arg not in tables:
            print_divider("TRAUMAGUARD AI - POSTGRESQL DATABASE OVERVIEW (traumaguard_db)")
            print(f"Host:     {database.POSTGRES_HOST}:{database.POSTGRES_PORT}")
            print(f"Database: {database.POSTGRES_DB}")
            print(f"User:     {database.POSTGRES_USER}\n")
            print(f"{'TABLE NAME':<25} | {'RECORD COUNT':<15} | {'VIEW COMMAND'}")
            print("-" * 70)
            for t in tables:
                cur.execute(f'SELECT COUNT(*) as cnt FROM "{t}"')
                cnt = cur.fetchone()['cnt']
                print(f"{t:<25} | {cnt:<15} | python view_db.py {t}")
            print("-" * 70)
            print("\nTIP: Run 'python view_db.py <table_name>' to view rows in that table.")
            return

        # Display specific table rows
        table_name = arg
        print_divider(f"TABLE: {table_name.upper()}")
        cur.execute(f'SELECT * FROM "{table_name}" ORDER BY 1 DESC LIMIT 20')
        rows = cur.fetchall()

        if not rows:
            print(f"No records found in table '{table_name}'.")
            return

        columns = list(rows[0].keys())
        print(" | ".join([f"{col.upper()}" for col in columns]))
        print("-" * 70)

        for r in rows:
            row_dict = dict(r)
            values = []
            for col in columns:
                val = str(row_dict[col]) if row_dict[col] is not None else "NULL"
                val = val.replace("\n", " ")
                if len(val) > 35:
                    val = val[:32] + "..."
                values.append(val)
            print(" | ".join(values))

        print(f"\nTotal rows shown: {len(rows)}")

if __name__ == "__main__":
    main()
