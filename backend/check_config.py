from app import app
import os

print(f"CWD: {os.getcwd()}")
print(f"DB URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
