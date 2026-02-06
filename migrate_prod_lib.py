import sqlite3
import os

db_path = "/app/instance/sussurros.db"

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='article'")
    if not cursor.fetchone():
        print("Table 'article' does not exist.")
        exit(1)

    # Check if column exists
    cursor.execute("PRAGMA table_info(article)")
    columns = [row[1] for row in cursor.fetchall()]
    
    if "semantic_metadata" not in columns:
        print("Adding column 'semantic_metadata'...")
        cursor.execute("ALTER TABLE article ADD COLUMN semantic_metadata TEXT")
        conn.commit()
        print("Column added successfully.")
    else:
        print("Column 'semantic_metadata' already exists.")
        
    cursor.execute("SELECT COUNT(*) FROM article")
    print(f"Total articles: {cursor.fetchone()[0]}")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
