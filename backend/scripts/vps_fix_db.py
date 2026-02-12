import sqlite3
import os

# Check common paths for sussurros.db in production
paths = [
    "/home/mergior/apps/sussurro-do-saber/backend/instance/sussurros.db",
    "/home/mergior/apps/sussurro-do-saber/instance/sussurros.db"
]

for db_path in paths:
    if os.path.exists(db_path):
        print(f"Checking database at: {db_path}")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("PRAGMA table_info(article)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if "semantic_metadata" not in columns:
            print(f"Adding column 'semantic_metadata' to {db_path}...")
            try:
                cursor.execute("ALTER TABLE article ADD COLUMN semantic_metadata TEXT")
                conn.commit()
                print("Column added successfully.")
            except Exception as e:
                print(f"Error adding column: {e}")
        else:
            print(f"Column 'semantic_metadata' already exists in {db_path}.")
            
        # Check article count
        cursor.execute("SELECT COUNT(*) FROM article")
        count = cursor.fetchone()[0]
        print(f"Total articles in {db_path}: {count}")
        
        conn.close()
    else:
        print(f"No database found at: {db_path}")
