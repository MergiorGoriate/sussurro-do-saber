import os
import jwt
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from models import db, bcrypt, User, Article, Comment, Subscriber, Setting, Footnote
import uuid
from werkzeug.utils import secure_filename

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

# Create tables and directories
with app.app_context():
    db.create_all()
    if not os.path.exists(os.path.join(basedir, 'uploads')):
        os.makedirs(os.path.join(basedir, 'uploads'))

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    from flask import send_from_directory
    return send_from_directory(os.path.join(basedir, 'uploads'), filename)

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

    def safe_json_load(data):
        if not data:
            return None
        try:
            return json.loads(data)
        except Exception as e:
            print(f"Error parsing semantic_metadata: {e}")
            return None

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
        'semanticMetadata': safe_json_load(a.semantic_metadata),
        'metrics': {
            'citations': a.citations,
            'altmetricScore': a.altmetric_score,
            'viewCount': a.views,
            'downloadCount': a.download_count
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
        'semanticMetadata': json.loads(article.semantic_metadata) if article.semantic_metadata else None,
        'metrics': {
            'citations': article.citations,
            'altmetricScore': article.altmetric_score,
            'viewCount': article.views,
            'downloadCount': article.download_count
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
    
    article.semantic_metadata = data.get('semanticMetadata', article.semantic_metadata)
    
    db.session.commit()
    return jsonify({'message': 'Article updated'})

@app.route('/api/ai/index_article/<id>', methods=['POST'])
@token_required
def index_article(current_user, id):
    import google.generativeai as genai
    import json
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    
    article = Article.query.get_or_404(id)
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'message': 'Gemini API Key not configured'}), 500

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Como um Indexador Académico de alto nível, analise o seguinte manuscrito:
        Título: {article.title}
        Conteúdo: {article.content[:4000]}
        
        Gere uma ficha de indexação semântica em formato JSON estrictamente com:
        - key_concepts: (array) 5-7 conceitos técnicos/científicos centrais.
        - technical_summary: (string) Resumo denso e formal para motores de busca científicos.
        - interdisciplinary_links: (array) Outras áreas do saber relacionadas.
        - academic_rigor_score: (1-10) quão técnico é o texto.
        
        Retorne APENAS o JSON.
        """
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        metadata = response.text
        article.semantic_metadata = metadata
        db.session.commit()
        
        return jsonify(json.loads(metadata))
    except Exception as e:
        print(f"Indexing Error: {str(e)}")
        return jsonify({'message': 'Index generation failed', 'error': str(e)}), 500

@app.route('/api/ai/indexer', methods=['GET'])
def get_indexer_insights():
    import google.generativeai as genai
    import json
    articles = Article.query.filter(Article.semantic_metadata.isnot(None)).all()
    if not articles:
        return jsonify({'message': 'No indexed articles found'}), 404
    
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'message': 'IA pendente de configuração.'}), 500

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        corpus = "\n".join([f"Artigo: {a.title} | Conceitos: {json.loads(a.semanticMetadata).get('key_concepts', []) if a.semanticMetadata else ''}" for a in articles])
        
        prompt = f"""
        Analise o corpus bibliográfico atual do Sussurros do Saber:
        {corpus}
        
        Forneça um panorama geral (Insights do Indexador) em JSON com:
        - trending_topics: (array) Tópicos emergentes na biblioteca.
        - disciplinary_map: (array de objetos) {{field: str, count: int}}
        - general_summary: (string) Visão geral do conhecimento acumulado.
        
        Retorne APENAS o JSON.
        """
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return response.text
    except Exception as e:
        print(f"Indexer Error: {str(e)}")
        return jsonify({'message': 'Indexer analysis failed'}), 500

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

# FOOTNOTES ROUTES
@app.route('/api/articles/<id>/footnotes', methods=['GET'])
def get_article_footnotes(id):
    footnotes = Footnote.query.filter_by(article_id=id, status='approved').all()
    return jsonify([{
        'id': f.id,
        'author': f.author,
        'content': f.content,
        'type': f.type,
        'date': f.date.isoformat(),
        'referenceText': f.reference_text
    } for f in footnotes])

@app.route('/api/articles/<id>/recommendations', methods=['GET'])
def get_article_recommendations(id):
    import google.generativeai as genai
    import json
    current_article = Article.query.get_or_404(id)
    all_articles = Article.query.filter(Article.id != id).all()
    
    if not all_articles:
        return jsonify([])
        
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify([])

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        candidates = "\n".join([f"ID: {a.id} | Titulo: {a.title} | Resumo: {a.excerpt or ''}" for a in all_articles])
        
        prompt = f"""
        Você é um curador de conteúdo académico. 
        Analise a relação conceptual entre este artigo:
        Título: {current_article.title}
        Resumo: {current_article.excerpt or ''}

        E esta lista de candidatos:
        {candidates}

        Escolha os 3 artigos mais relevantes semanticamente.
        Retorne APENAS um array JSON com os IDs. Ex: ["id1", "id2", "id3"]
        """
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        recommended_ids = json.loads(response.text)
        
        recommended_articles = []
        for rid in recommended_ids:
            art = Article.query.get(rid)
            if art:
                recommended_articles.append({
                    'id': art.id,
                    'title': art.title,
                    'excerpt': art.excerpt,
                    'category': art.category,
                    'imageUrl': art.image_url
                })
        
        return jsonify(recommended_articles[:3])
    except Exception as e:
        print(f"Recommendations Error: {str(e)}")
        return jsonify([])

@app.route('/api/articles/<id>/footnotes', methods=['POST'])
def add_footnote_suggestion(id):
    data = request.json
    new_footnote = Footnote(
        id=f"f-{int(datetime.now().timestamp())}",
        article_id=id,
        author=data['author'],
        content=data['content'],
        type=data.get('type', 'correction'),
        reference_text=data.get('referenceText')
    )
    db.session.add(new_footnote)
    db.session.commit()
    return jsonify({'message': 'Suggestion submitted', 'id': new_footnote.id}), 201

@app.route('/api/footnotes', methods=['GET'])
@token_required
def get_all_footnotes(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    footnotes = Footnote.query.order_by(Footnote.date.desc()).all()
    return jsonify([{
        'id': f.id,
        'articleId': f.article_id,
        'author': f.author,
        'content': f.content,
        'type': f.type,
        'status': f.status,
        'date': f.date.isoformat(),
        'referenceText': f.reference_text
    } for f in footnotes])

@app.route('/api/footnotes/<id>', methods=['PUT'])
@token_required
def update_footnote_status(current_user, id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    footnote = Footnote.query.get_or_404(id)
    data = request.json
    if 'status' in data:
        footnote.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Footnote updated'})

@app.route('/api/footnotes/<id>', methods=['DELETE'])
@token_required
def delete_footnote(current_user, id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    footnote = Footnote.query.get_or_404(id)
    db.session.delete(footnote)
    db.session.commit()
    return jsonify({'message': 'Footnote deleted'})

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

@app.route('/api/ai/summary', methods=['POST'])
def ai_summary():
    import google.generativeai as genai
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({'message': 'Content is required'}), 400
        
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'message': 'IA pendente de configuração.'}), 500

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Você é um editor sénior do jornal académico "Sussurros do Saber".
        Leia o manuscrito abaixo e crie um sumário executivo de alto nível.
        O sumário deve consistir em 3 pontos fundamentais (bullet points), totalizando no máximo 80 palavras.
        Seja rigoroso, académico mas fascinante.
        
        Texto:
        {content[:4000]}
        """
        
        response = model.generate_content(prompt)
        return jsonify({'summary': response.text})
    except Exception as e:
        print(f"Summary Error: {str(e)}")
        return jsonify({'message': 'Não foi possível gerar o sumário.'}), 500

@app.route('/api/ai/glossary', methods=['POST'])
def ai_glossary():
    import google.generativeai as genai
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({'message': 'Content is required'}), 400
        
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({'message': 'IA pendente de configuração.'}), 500

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        prompt = f"""
        Como editor académico do Sussurros do Saber, analise o texto abaixo.
        Identifique 5 a 8 termos técnicos, científicos ou conceitos complexos que necessitam de clarificação para um leitor culto mas não especialista.
        REGRAS CRÍTICAS:
        1. Ignore termos extremamente comuns (ex: Ciência, Tecnologia, Computador).
        2. Foque-se em conceitos específicos (ex: Entropia, Neuroplasticidade, Paradigma de Kuhn).
        3. A definição deve ter entre 10 e 20 palavras, num tom formal e enciclopédico.
        4. Retorne APENAS o JSON conforme o exemplo.
        
        Exemplo:
        [
            {{"term": "Entropia", "definition": "Medida da desordem ou aleatoriedade de um sistema físico, fundamental no segundo princípio da termodinâmica."}}
        ]
        
        Texto:
        {content[:3000]}
        """
        # Truncating content to 3000 chars to avoid token limits context window
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return response.text # Already JSON
    except Exception as e:
        print(f"Glossary Error: {str(e)}")
        # Fallback mocks for testing if AI fails
        return jsonify([
            {"term": "Processamento de Linguagem Natural", "definition": "Campo da IA focado na interação entre computadores e linguagem humana."},
            {"term": "Algoritmo", "definition": "Sequência de instruções para resolver um problema ou realizar uma tarefa."}
        ])

# Route ai_chat removed for undo

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(Article.category).distinct().all()
    return jsonify([c[0] for c in categories])

@app.route('/api/tags', methods=['GET'])
def get_tags():
    all_tags_raw = db.session.query(Article.tags).all()
    unique_tags = set()
    for row in all_tags_raw:
        if row[0]:
            tags = [t.strip() for t in row[0].split(',') if t.strip()]
            unique_tags.update(tags)
    return jsonify(list(unique_tags))

@app.route('/api/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin only!'}), 403
    
    if 'file' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    
    if file:
        filename = f"{int(datetime.now().timestamp())}_{secure_filename(file.filename)}"
        file_path = os.path.join(basedir, 'uploads', filename)
        file.save(file_path)
        
        # Determine the protocol based on the request (or hardcode https if preferred)
        protocol = "https" if request.is_secure or os.getenv('PROD') == 'true' else "http"
        host = request.host
        
        return jsonify({
            'message': 'File uploaded successfully',
            'url': f"{protocol}://{host}/uploads/{filename}",
            'filename': filename
        }), 201

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

@app.route('/sitemap.xml', methods=['GET'])
def sitemap():
    try:
        pages = []
        # Hardcoded static pages
        base_url = "https://sussurrosdosaber.com"
        now = datetime.now().strftime('%Y-%m-%d')
        
        pages.append({
            'loc': base_url + "/",
            'lastmod': now,
            'changefreq': 'daily',
            'priority': '1.0'
        })
        
        pages.append({
            'loc': base_url + "/terms",
            'lastmod': now,
            'changefreq': 'monthly',
            'priority': '0.3'
        })

        # Dynamic article pages
        articles = Article.query.all()
        for article in articles:
            # Assuming article IDs translate to /article/<id>
            # If the frontend route is different, adjust accordingly.
            pages.append({
                'loc': f"{base_url}/article/{article.id}",
                'lastmod': article.date, # Ideally this would be a real ISO date
                'changefreq': 'weekly',
                'priority': '0.7'
            })

        xml_sitemap = '<?xml version="1.0" encoding="UTF-8"?>'
        xml_sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        
        for page in pages:
            xml_sitemap += '<url>'
            xml_sitemap += f'<loc>{page["loc"]}</loc>'
            xml_sitemap += f'<lastmod>{page["lastmod"]}</lastmod>'
            xml_sitemap += f'<changefreq>{page["changefreq"]}</changefreq>'
            xml_sitemap += f'<priority>{page["priority"]}</priority>'
            xml_sitemap += '</url>'
            
        xml_sitemap += '</urlset>'
        
        return xml_sitemap, 200, {'Content-Type': 'application/xml'}
    except Exception as e:
        print(f"Sitemap error: {e}")
        return str(e), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
