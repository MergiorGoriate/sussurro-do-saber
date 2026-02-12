import sqlite3
import os

basedir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
db_path = os.path.join(basedir, 'instance', 'sussurros.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE article ADD COLUMN semantic_metadata TEXT")
    conn.commit()
    print("Column semantic_metadata added successfully.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Column semantic_metadata already exists.")
    else:
        print(f"Error: {e}")
finally:
    conn.close()
