from app import app, db, User

with app.app_context():
    admin = User.query.filter_by(email='admin@sussurros.pt').first()
    if admin:
        admin.set_password('admin')
        db.session.commit()
        print("Admin password reset to 'admin'")
    else:
        print("Admin user not found")
