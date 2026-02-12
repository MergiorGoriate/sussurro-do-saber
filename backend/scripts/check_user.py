from app import app, db, User

with app.app_context():
    user = User.query.filter_by(email='admin@sussurros.pt').first()
    if user:
        print(f"User found: {user.email}, Role: {user.role}")
        if user.check_password('admin123'):
             print("Password 'admin123' IS correct.")
        else:
             print("Password 'admin123' IS NOT correct.")
    else:
        print("User 'admin@sussurros.pt' NOT found.")
