import os
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, bcrypt, User, Article, Comment, Subscriber, Setting
import uuid

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))
# genai configuration removed here as it's now back to frontend for chat, 
# but we keep it local in routes for other AI features if needed.

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(basedir, 'instance', 'sussurros.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')

CORS(app, resources={r"/api/*": {"origins": "*"}}) # In production, replace * with your frontend domain
db.init_app(app)
bcrypt.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Middleware for JWT
def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = token.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.check_password(data.get('password')):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'avatarUrl': user.avatar_url
            }
        })
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/auth/profile', methods=['GET', 'PUT'])
@token_required
def profile(current_user):
    if request.method == 'PUT':
        data = request.json
        current_user.name = data.get('name', current_user.name)
        current_user.email = data.get('email', current_user.email)
        current_user.avatar_url = data.get('avatarUrl', current_user.avatar_url)
        if data.get('password'):
            current_user.set_password(data['password'])
        db.session.commit()
        return jsonify({'message': 'Profile updated', 'user': {
            'id': current_user.id,
            'name': current_user.name,
            'email': current_user.email,
            'role': current_user.role,
            'avatarUrl': current_user.avatar_url
        }})
    
    return jsonify({
        'id': current_user.id,
        'name': current_user.name,
        'email': current_user.email,
        'role': current_user.role,
        'avatarUrl': current_user.avatar_url,
        'joinedDate': current_user.joined_date.isoformat()
    })

@app.route('/api/articles', methods=['GET'])
def get_articles():
    category = request.args.get('category')
    query = request.args.get('q')
    
    articles_query = Article.query
    if category:
        articles_query = articles_query.filter_by(category=category)
    if query:
        articles_query = articles_query.filter(Article.title.contains(query) | Article.excerpt.contains(query))
        
    articles = articles_query.order_by(Article.date.desc()).all()
    
    # Helper to get author avatar
    def get_author_avatar(author_name):
        user = User.query.filter_by(name=author_name).first()
        return user.avatar_url if user else None

    return jsonify([{
        'id': a.id,
        'title': a.title,
        'excerpt': a.excerpt,
        'author': a.author,
        'authorAvatarUrl': get_author_avatar(a.author),
        'date': a.date,
        'category': a.category,
        'imageUrl': a.image_url,
        'readTime': a.read_time,
        'status': a.status,
        'likes': a.likes,
        'views': a.views,
        'tags': a.tags.split(',') if a.tags else [],
        'metrics': {
            'citations': a.citations,
            'altmetricScore': a.altmetric_score,
            'viewCount': a.views,
            'downloadCount': a.download_count
        },
        'journalMeta': {
            'doi': a.doi,
            'issn': a.issn,
            'volume': a.volume,
            'issue': a.issue,
            'receivedDate': a.received_date,
            'acceptedDate': a.accepted_date
        }
    } for a in articles])

@app.route('/api/articles/<id>', methods=['GET'])
def get_article(id):
    article = Article.query.filter_by(id=id).first_or_404()
    article.views += 1
    db.session.commit()
    
    author_user = User.query.filter_by(name=article.author).first()
    author_avatar = author_user.avatar_url if author_user else None

    return jsonify({
        'id': article.id,
        'title': article.title,
        'excerpt': article.excerpt,
        'content': article.content,
        'author': article.author,
        'authorAvatarUrl': author_avatar,
        'date': article.date,
        'category': article.category,
        'imageUrl': article.image_url,
        'readTime': article.read_time,
        'status': article.status,
        'likes': article.likes,
        'views': article.views,
        'tags': article.tags.split(',') if article.tags else [],
        'metrics': {
            'citations': article.citations,
            'altmetricScore': article.altmetric_score,
            'viewCount': article.views,
            'downloadCount': article.download_count
        },
        'journalMeta': {
            'doi': article.doi,
            'issn': article.issn,
            'volume': article.volume,
            'issue': article.issue,
            'receivedDate': article.received_date,
            'acceptedDate': article.accepted_date
        }
    })

@app.route('/api/articles', methods=['POST'])
@token_required
def create_article(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    data = request.json
    new_article = Article(
        id=f"a-{int(datetime.now().timestamp())}",
        title=data['title'],
        excerpt=data.get('excerpt'),
        content=data.get('content'),
        author=current_user.name,
        date=datetime.now().strftime('%d %b %Y'),
        category=data['category'],
        image_url=data.get('imageUrl'),
        read_time=data.get('readTime', 0),
        tags=",".join(data.get('tags', [])),
        doi=f"10.3390/ss{int(datetime.now().timestamp())}"
    )
    db.session.add(new_article)
    db.session.commit()
    return jsonify({'message': 'Article created', 'id': new_article.id}), 201

@app.route('/api/articles/<id>', methods=['PUT', 'DELETE'])
@token_required
def update_or_delete_article(current_user, id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    
    article = Article.query.get_or_404(id)
    
    if request.method == 'DELETE':
        db.session.delete(article)
        db.session.commit()
        return jsonify({'message': 'Article deleted'})
    
    data = request.json
    article.title = data.get('title', article.title)
    article.excerpt = data.get('excerpt', article.excerpt)
    article.content = data.get('content', article.content)
    article.category = data.get('category', article.category)
    article.image_url = data.get('imageUrl', article.image_url)
    article.read_time = data.get('readTime', article.read_time)
    if 'tags' in data:
        article.tags = ",".join(data['tags'])
    
    db.session.commit()
    return jsonify({'message': 'Article updated'})

@app.route('/api/articles/<id>/like', methods=['POST'])
def like_article(id):
    article = Article.query.get_or_404(id)
    article.likes += 1
    db.session.commit()
    return jsonify({'likes': article.likes})

@app.route('/api/articles/<id>/comments', methods=['GET'])
def get_comments(id):
    comments = Comment.query.filter_by(article_id=id, status='approved').all()
    return jsonify([{
        'id': c.id,
        'author': c.author,
        'content': c.content,
        'date': c.date.isoformat()
    } for c in comments])

@app.route('/api/articles/<id>/comments', methods=['POST'])
def add_comment(id):
    data = request.json
    new_comment = Comment(
        id=f"c-{int(datetime.now().timestamp())}",
        article_id=id,
        author=data['author'],
        content=data['content']
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({'message': 'Comment submitted', 'id': new_comment.id}), 201

@app.route('/api/subscribers', methods=['POST'])
def add_subscriber():
    data = request.json
    if Subscriber.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Already subscribed'}), 400
    new_sub = Subscriber(email=data['email'])
    db.session.add(new_sub)
    db.session.commit()
    return jsonify({'message': 'Subscribed successfully'}), 201

@app.route('/api/comments', methods=['GET'])
@token_required
def get_all_comments(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    comments = Comment.query.order_by(Comment.date.desc()).all()
    return jsonify([{
        'id': c.id,
        'articleId': c.article_id,
        'author': c.author,
        'content': c.content,
        'date': c.date.isoformat(),
        'status': c.status
    } for c in comments])

@app.route('/api/comments/<id>', methods=['PUT'])
@token_required
def update_comment(current_user, id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    comment = Comment.query.get_or_404(id)
    data = request.json
    if 'status' in data:
        comment.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Comment updated'})

@app.route('/api/comments/<id>', methods=['DELETE'])
@token_required
def delete_comment_route(current_user, id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    comment = Comment.query.get_or_404(id)
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'})

@app.route('/api/settings', methods=['GET', 'PUT'])
def handle_settings():
    if request.method == 'PUT':
        # Auth check manual for PUT
        token = request.headers.get('Authorization')
        if not token: return jsonify({'message': 'Token missing'}), 401
        try:
            token = token.split(" ")[1]
            data_jwt = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            admin = User.query.get(data_jwt['user_id'])
            if not admin or admin.role != 'admin': return jsonify({'message': 'Unauthorized'}), 403
        except: return jsonify({'message': 'Invalid token'}), 401

        data = request.json
        for key, value in data.items():
            setting = Setting.query.filter_by(key=key).first()
            if setting:
                setting.value = str(value)
            else:
                db.session.add(Setting(key=key, value=str(value)))
        db.session.commit()
        return jsonify({'message': 'Settings updated'})
    
    settings = Setting.query.all()
    # Default settings if empty
    if not settings:
        defaults = {
            'name': 'Sussurros do Saber Journal',
            'description': 'Multidisciplinary Academic Open Access Journal',
            'impactFactor': '3.84',
            'hIndex': '12',
            'contactEmail': 'journal@sussurros.pt'
        }
        return jsonify(defaults)
        
    return jsonify({s.key: s.value for s in settings})

@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'email': u.email,
        'role': u.role,
        'avatarUrl': u.avatar_url,
        'joinedDate': u.joined_date.isoformat()
    } for u in users])

@app.route('/api/users', methods=['POST'])
@token_required
def create_user(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    data = request.json
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email already exists'}), 400
        
    new_user = User(
        id=str(uuid.uuid4()),
        name=data.get('name'),
        email=data.get('email'),
        role=data.get('role', 'admin')
    )
    new_user.set_password(data.get('password', 'sussurros123'))
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'user': {
        'id': new_user.id,
        'name': new_user.name,
        'email': new_user.email
    }}), 201

@app.route('/api/subscribers', methods=['GET'])
@token_required
def get_subscribers(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    subs = Subscriber.query.all()
    return jsonify([s.email for s in subs])

@app.route('/api/ai/insight', methods=['POST'])
def ai_insight():
    data = request.json
    article_content = data.get('content')
    
    if not article_content:
        return jsonify({'message': 'Content is required'}), 400
        
    try:
        import google.generativeai as genai
        api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = f"Como um curador científico, forneça um insight curto (máximo 3 frases) e fascinante sobre este artigo: {article_content}"
        response = model.generate_content(prompt)
        return jsonify({'insight': response.text})
    except Exception as e:
        print(f"Insight Error: {str(e)}")
        return jsonify({'insight': 'Fascinante reflexão científica em processamento...'}), 200

@app.route('/api/ai/generate', methods=['POST'])
def ai_generate():
    data = request.json
    topic = data.get('topic')
    type_ = data.get('type') # 'explanation' or 'essay'
    
    try:
        import google.generativeai as genai
        api_key = os.getenv('GEMINI_API_KEY')
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        system_instruction = "Você é um redator académico experiente para o blog 'Sussurros do Saber'. Seu estilo é claro, acessível e objectivo, mas com rigor científico. Responda em JSON com os campos: title, excerpt, content."
        
        prompt = f"Explique o conceito de '{topic}' simplificando a complexidade sem perder o rigor." if type_ == 'explanation' else f"Escreva um ensaio reflexivo sobre '{topic}' criando pontes com o quotidiano."
        
        response = model.generate_content(
            f"{system_instruction}\n\n{prompt}",
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return response.text
    except Exception as e:
        print(f"Generate Error: {str(e)}")
        return jsonify({'message': str(e)}), 500

# Route ai_chat removed for undo

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    import google.generativeai as genai
    data = request.json
    message = data.get('message')
    history = data.get('history', [])
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'message': 'IA pendente de configuração.'}), 500

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Build prompt with history for context
        prompt = "Você é o Assistente do Sussurros do Saber. Regras: Tom culto porém acessível, focado em ciência e cultura, sem #, use listas se necessário.\n\n"
        for msg in history[-5:]: # Last 5 messages for context
            role = "Leitor" if msg['role'] == 'user' else "Assistente"
            prompt += f"{role}: {msg['text']}\n"
        
        prompt += f"Leitor: {message}\nAssistente:"
        
        response = model.generate_content(prompt)
        return jsonify({'text': response.text})
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({'message': 'Ocorreu um erro no processamento AI. Tente novamente.'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
