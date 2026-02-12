from app import app, db, User

with app.app_context():
    user = User.query.filter_by(email='admin@sussurros.pt').first()
    if user:
        if user.check_password('admin123'):
             print("LOGIN_SUCCESS")
        else:
             print("PASSWORD_FAIL")
    else:
        print("USER_NOT_FOUND")
