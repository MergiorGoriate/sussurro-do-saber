import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, db, Article

with app.app_context():
    count = Article.query.count()
    print(f"Total Articles: {count}")
    articles = Article.query.all()
    for a in articles:
        print(f"ID: {a.id} | Title: {a.title} | Status: {a.status}")
        try:
            import json
            if a.semantic_metadata:
                json.loads(a.semantic_metadata)
                print("  - Semantic Metadata: VALID JSON")
            else:
                print("  - Semantic Metadata: None")
        except Exception as e:
            print(f"  - Semantic Metadata: INVALID JSON ({e})")
