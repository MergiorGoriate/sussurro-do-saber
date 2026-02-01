from app import app, db, User
import os

print(f"Target DB: {app.config['SQLALCHEMY_DATABASE_URI']}")

with app.app_context():
    db.create_all()
    user = User.query.filter_by(email='admin@sussurros.pt').first()
    if not user:
        print("Creating admin user...")
        # Ensure ID u1 is not taken or use UUID
        existing_u1 = User.query.get('u1')
        uid = 'u1' if not existing_u1 else None
        
        admin = User(id=uid, name='Mergior Goriate', email='admin@sussurros.pt', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Admin user created.")
    else:
        print("Admin user already exists. Updating password to 'admin123'...")
        user.set_password('admin123')
        db.session.commit()
        print("Password updated.")
