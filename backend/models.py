from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')
    avatar_url = db.Column(db.String(500), nullable=True)
    joined_date = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Article(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    excerpt = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=True)
    author = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(500), nullable=True)
    read_time = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='published')
    likes = db.Column(db.Integer, default=0)
    views = db.Column(db.Integer, default=0)
    tags = db.Column(db.Text, nullable=True) # JSON-encoded string
    semantic_metadata = db.Column(db.Text, nullable=True) # AI-generated index data
    
    # Metrics
    citations = db.Column(db.Integer, default=0)
    altmetric_score = db.Column(db.Integer, default=0)
    download_count = db.Column(db.Integer, default=0)
    
    # Journal Meta
    doi = db.Column(db.String(100), nullable=True)
    issn = db.Column(db.String(50), default='2024-99XX')
    volume = db.Column(db.Integer, default=1)
    issue = db.Column(db.Integer, default=1)
    received_date = db.Column(db.String(50), nullable=True)
    accepted_date = db.Column(db.String(50), nullable=True)

class Comment(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    article_id = db.Column(db.String(36), db.ForeignKey('article.id'), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected

class Footnote(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    article_id = db.Column(db.String(36), db.ForeignKey('article.id'), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30), default='correction') # correction, supplementary_link, insight
    status = db.Column(db.String(20), default='pending') # pending, approved, rejected
    date = db.Column(db.DateTime, default=datetime.utcnow)
    reference_text = db.Column(db.Text, nullable=True)

class Subscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    subscribed_date = db.Column(db.DateTime, default=datetime.utcnow)

class Setting(db.Model):
    key = db.Column(db.String(50), primary_key=True)
    value = db.Column(db.Text, nullable=True)
