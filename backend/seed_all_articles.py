from app import app, db
from models import Article, User
import sys

# Comprehensive article data based on articlesContent.ts
ARTICLES_DATA = [
    {
        'id': '1',
        'title': 'Computação Quântica: O Futuro da Tecnologia',
        'excerpt': 'Descubra como os qubits e a superposição podem revolucionar o processamento de dados e a criptografia mundial.',
        'author': 'Mergior Goriate',
        'date': '20 Out 2024',
        'category': 'Tecnologia',
        'image_url': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=60&w=800&auto=format&fit=crop',
        'read_time': 12,
        'tags': ['Inovação', 'Futuro', 'Engenharia', 'Digital']
    },
    {
        'id': '2',
        'title': 'CRISPR e a Engenharia Genética: O Futuro da Medicina Personalizada',
        'excerpt': 'Como a edição genética está a abrir portas para a cura de doenças hereditárias e terapias personalizadas.',
        'author': 'Mergior Goriate',
        'date': '18 Out 2024',
        'category': 'Ciência',
        'image_url': 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=60&w=800&auto=format&fit=crop',
        'read_time': 10,
        'tags': ['Pesquisa', 'Metodologia', 'Evidência', 'Saúde']
    },
    {
        'id': '3',
        'title': 'Como Podcasts Estão Transformando o Acesso à Informação e ao Entretenimento',
        'excerpt': 'O renascimento do áudio como meio primário de aprendizagem e cultura na era do on-demand.',
        'author': 'Mergior Goriate',
        'date': '15 Out 2024',
        'category': 'Entretenimento',
        'image_url': 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=60&w=800&auto=format&fit=crop',
        'read_time': 8,
        'tags': ['Cultura', 'Mídia', 'Educação', 'Digital']
    },
    {
        'id': '4',
        'title': 'As Últimas Descobertas Científicas: Um Olhar para the Futuro',
        'excerpt': 'Uma análise das inovações que marcaram o último trimestre no mundo da ciência.',
        'author': 'Mergior Goriate',
        'date': '12 Out 2024',
        'category': 'Ciência',
        'image_url': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=60&w=800&auto=format&fit=crop',
        'read_time': 14,
        'tags': ['Pesquisa', 'Inovação', 'Descobertas', 'Futuro']
    },
    {
        'id': '5',
        'title': 'A Influência da Cultura Pop Asiática: O Crescimento Global do K-pop, Doramas e Anime',
        'excerpt': 'Como a onda Hallyu e a animação japonesa conquistaram o ocidente e redefiniram o entretenimento.',
        'author': 'Mergior Goriate',
        'date': '10 Out 2024',
        'category': 'Entretenimento',
        'image_url': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=60&w=800&auto=format&fit=crop',
        'read_time': 8,
        'tags': ['Cultura', 'Global', 'Entretenimento', 'Sociedade']
    },
    {
        'id': '6',
        'title': 'Explorando a Neurociência: Um Mergulho na Complexidade do Cérebro',
        'excerpt': 'Desvendando os mistérios do órgão mais complexo do universo conhecido.',
        'author': 'Mergior Goriate',
        'date': '8 Out 2024',
        'category': 'Ciência',
        'image_url': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=60&w=800&auto=format&fit=crop',
        'read_time': 11,
        'tags': ['Neurociência', 'Cérebro', 'Pesquisa', 'Saúde']
    },
    {
        'id': '7',
        'title': 'Como o Cérebro Envelhece: Diferentes Trajetórias e Reserva Cognitiva',
        'excerpt': 'Por que algumas pessoas mantêm a mente afiada aos 90 anos enquanto outras declinam cedo.',
        'author': 'Mergior Goriate',
        'date': '5 Out 2024',
        'category': 'Saúde e Bem-estar',
        'image_url': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?q=60&w=800&auto=format&fit=crop',
        'read_time': 9,
        'tags': ['Envelhecimento', 'Neurociência', 'Saúde', 'Longevidade']
    },
    {
        'id': '8',
        'title': 'Serendipidade na Ciência: Descobertas Acidentais que Mudaram o Mundo',
        'excerpt': 'Da penicilina ao micro-ondas: quando o acaso encontra a mente preparada.',
        'author': 'Mergior Goriate',
        'date': '3 Out 2024',
        'category': 'Ciência',
        'image_url': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=60&w=800&auto=format&fit=crop',
        'read_time': 7,
        'tags': ['História', 'Descobertas', 'Inovação', 'Ciência']
    },
    {
        'id': '9',
        'title': 'Factos Surpreendentes Sobre o Cérebro Humano',
        'excerpt': 'Estatísticas e curiosidades sobre o órgão que consome 20% da energia do corpo.',
        'author': 'Mergior Goriate',
        'date': '1 Out 2024',
        'category': 'Ciência',
        'image_url': 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=60&w=800&auto=format&fit=crop',
        'read_time': 6,
        'tags': ['Neurociência', 'Curiosidades', 'Cérebro', 'Factos']
    },
    {
        'id': '10',
        'title': 'Rituais Culturais Fascinantes ao Redor do Mundo',
        'excerpt': 'Da dança com os mortos em Madagascar ao salto do diabo em Espanha.',
        'author': 'Mergior Goriate',
        'date': '28 Set 2024',
        'category': 'Entretenimento',
        'image_url': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=60&w=800&auto=format&fit=crop',
        'read_time': 8,
        'tags': ['Cultura', 'Antropologia', 'Tradições', 'Global']
    },
    {
        'id': '11',
        'title': 'A Ciência dos Sonhos: Por Que Sonhamos e O Que Significam',
        'excerpt': 'Entre Freud e a neurociência: desvendando o mistério das narrativas noturnas.',
        'author': 'Mergior Goriate',
        'date': '25 Set 2024',
        'category': 'Psicologia',
        'image_url': 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?q=60&w=800&auto=format&fit=crop',
        'read_time': 10,
        'tags': ['Psicologia', 'Neurociência', 'Sono', 'Mente']
    },
    {
        'id': '12',
        'title': 'IA Generativa: A Nova Revolução Criativa',
        'excerpt': 'Como os LLMs estão transformando a criação de conteúdo e o trabalho cognitivo.',
        'author': 'Mergior Goriate',
        'date': '22 Set 2024',
        'category': 'Tecnologia',
        'image_url': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=60&w=800&auto=format&fit=crop',
        'read_time': 12,
        'tags': ['IA', 'Tecnologia', 'Futuro', 'Inovação']
    },
    {
        'id': '13',
        'title': 'A Queda de Roma: Lições para o Mundo Moderno',
        'excerpt': 'Anatomia do colapso do maior império da antiguidade e seus paralelos contemporâneos.',
        'author': 'Mergior Goriate',
        'date': '20 Set 2024',
        'category': 'Entretenimento',
        'image_url': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=60&w=800&auto=format&fit=crop',
        'read_time': 13,
        'tags': ['História', 'Sociedade', 'Política', 'Lições']
    },
    {
        'id': '14',
        'title': 'Buracos Negros: O Abismo do Espaço-Tempo',
        'excerpt': 'Da teoria de Einstein à primeira imagem real: explorando o invisível.',
        'author': 'Mergior Goriate',
        'date': '18 Set 2024',
        'category': 'Astronomia',
        'image_url': 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=60&w=800&auto=format&fit=crop',
        'read_time': 11,
        'tags': ['Astronomia', 'Física', 'Espaço', 'Ciência']
    },
    {
        'id': '15',
        'title': 'Saúde Mental no Século XXI: A Epidemia Silenciosa',
        'excerpt': 'Por que estamos mais ansiosos e deprimidos apesar do progresso material.',
        'author': 'Mergior Goriate',
        'date': '15 Set 2024',
        'category': 'Saúde e Bem-estar',
        'image_url': 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=60&w=800&auto=format&fit=crop',
        'read_time': 10,
        'tags': ['Saúde Mental', 'Sociedade', 'Bem-estar', 'Psicologia']
    },
    {
        'id': '16',
        'title': 'Energias Renováveis: O Caminho para a Neutralidade Carbónica',
        'excerpt': 'Solar, eólica e hidrogénio verde: o mix tecnológico da transição energética.',
        'author': 'Mergior Goriate',
        'date': '12 Set 2024',
        'category': 'Sustentabilidade',
        'image_url': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=60&w=800&auto=format&fit=crop',
        'read_time': 11,
        'tags': ['Sustentabilidade', 'Energia', 'Clima', 'Futuro']
    },
    {
        'id': '17',
        'title': 'A Psicologia das Cores: Como Influenciam Decisões e Emoções',
        'excerpt': 'Do marketing ao cinema: o poder invisível das cores na nossa vida.',
        'author': 'Mergior Goriate',
        'date': '10 Set 2024',
        'category': 'Psicologia',
        'image_url': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=60&w=800&auto=format&fit=crop',
        'read_time': 8,
        'tags': ['Psicologia', 'Design', 'Marketing', 'Percepção']
    },
    {
        'id': '18',
        'title': 'Biohacking: Otimizando o Corpo e a Mente',
        'excerpt': 'Da nutrigenómica aos implantes: a fronteira entre humano e máquina.',
        'author': 'Mergior Goriate',
        'date': '8 Set 2024',
        'category': 'Saúde e Bem-estar',
        'image_url': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=60&w=800&auto=format&fit=crop',
        'read_time': 9,
        'tags': ['Biohacking', 'Saúde', 'Tecnologia', 'Futuro']
    },
    {
        'id': '19',
        'title': 'Big Data: A Revolução dos Dados e Seus Perigos',
        'excerpt': 'Os 5 Vs do Big Data e o capitalismo de vigilância.',
        'author': 'Mergior Goriate',
        'date': '5 Set 2024',
        'category': 'Big Data',
        'image_url': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=60&w=800&auto=format&fit=crop',
        'read_time': 10,
        'tags': ['Big Data', 'Tecnologia', 'Privacidade', 'IA']
    },
    {
        'id': '20',
        'title': 'A História das Alianças de Casamento',
        'excerpt': 'Do Antigo Egito à Vena Amoris: a origem de uma tradição milenar.',
        'author': 'Mergior Goriate',
        'date': '3 Set 2024',
        'category': 'Entretenimento',
        'image_url': 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=60&w=800&auto=format&fit=crop',
        'read_time': 6,
        'tags': ['História', 'Cultura', 'Tradições', 'Curiosidades']
    },
    {
        'id': '21',
        'title': 'O Que Acontece ao Cérebro no Momento da Morte',
        'excerpt': 'Ondas gama e o mistério da "vida passando diante dos olhos".',
        'author': 'Mergior Goriate',
        'date': '1 Set 2024',
        'category': 'Ciência',
        'image_url': 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=60&w=800&auto=format&fit=crop',
        'read_time': 7,
        'tags': ['Neurociência', 'Morte', 'Pesquisa', 'Mistério']
    },
    {
        'id': '22',
        'title': 'Por Que Esquecemos os Sonhos Tão Rapidamente',
        'excerpt': 'A química do esquecimento e o hipocampo desligado.',
        'author': 'Mergior Goriate',
        'date': '29 Ago 2024',
        'category': 'Psicologia',
        'image_url': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=60&w=800&auto=format&fit=crop',
        'read_time': 6,
        'tags': ['Psicologia', 'Neurociência', 'Sono', 'Memória']
    },
    {
        'id': '23',
        'title': 'Déjà Vu: A Ciência Por Trás da Sensação de "Já Vivi Isto"',
        'excerpt': 'Teorias neurocientíficas sobre o fenómeno que afeta 70% das pessoas.',
        'author': 'Mergior Goriate',
        'date': '27 Ago 2024',
        'category': 'Psicologia',
        'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=60&w=800&auto=format&fit=crop',
        'read_time': 7,
        'tags': ['Psicologia', 'Neurociência', 'Fenómenos', 'Mente']
    },
    {
        'id': '24',
        'title': 'A Matemática Impossível de Embaralhar Cartas',
        'excerpt': 'Por que cada embaralhamento cria uma sequência única na história do universo.',
        'author': 'Mergior Goriate',
        'date': '25 Ago 2024',
        'category': 'Inovação',
        'image_url': 'https://images.unsplash.com/photo-1571289868918-f1c0b1f8b6e0?q=60&w=800&auto=format&fit=crop',
        'read_time': 5,
        'tags': ['Matemática', 'Probabilidade', 'Curiosidades', 'Ciência']
    },
    {
        'id': '25',
        'title': 'O Primeiro "Bug" de Computador Foi Literal',
        'excerpt': 'A traça que entrou para a história da computação em 1947.',
        'author': 'Mergior Goriate',
        'date': '22 Ago 2024',
        'category': 'Tecnologia',
        'image_url': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=60&w=800&auto=format&fit=crop',
        'read_time': 4,
        'tags': ['História', 'Tecnologia', 'Curiosidades', 'Computação']
    },
    {
        'id': '26',
        'title': 'A Mensagem da Humanidade nas Voyager: O Disco de Ouro',
        'excerpt': 'Sons e imagens da Terra viajando pelo espaço interestelar.',
        'author': 'Mergior Goriate',
        'date': '20 Ago 2024',
        'category': 'Astronomia',
        'image_url': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?q=60&w=800&auto=format&fit=crop',
        'read_time': 7,
        'tags': ['Astronomia', 'Espaço', 'História', 'Humanidade']
    },
    {
        'id': '27',
        'title': 'A Engenharia de Precisão dos Blocos LEGO',
        'excerpt': 'Tolerância de 0.002mm: a obsessão pela perfeição que dura décadas.',
        'author': 'Mergior Goriate',
        'date': '18 Ago 2024',
        'category': 'Inovação',
        'image_url': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=60&w=800&auto=format&fit=crop',
        'read_time': 5,
        'tags': ['Engenharia', 'Design', 'Inovação', 'Precisão']
    },
    {
        'id': '28',
        'title': 'O Renascimento da Oralidade na Era Digital',
        'excerpt': 'Como podcasts e audiobooks estão a recuperar a tradição dos contadores de histórias.',
        'author': 'Mergior Goriate',
        'date': '15 Ago 2024',
        'category': 'Entretenimento',
        'image_url': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=60&w=800&auto=format&fit=crop',
        'read_time': 8,
        'tags': ['Cultura', 'Mídia', 'Digital', 'Comunicação']
    },
    {
        'id': '29',
        'title': 'Economia Circular: Repensar o Modelo "Fazer, Usar, Deitar Fora"',
        'excerpt': 'Inspirada na natureza: um sistema económico sem desperdício.',
        'author': 'Mergior Goriate',
        'date': '12 Ago 2024',
        'category': 'Sustentabilidade',
        'image_url': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=60&w=800&auto=format&fit=crop',
        'read_time': 9,
        'tags': ['Sustentabilidade', 'Economia', 'Ambiente', 'Futuro']
    },
    {
        'id': '30',
        'title': 'O Microbioma: Você É Mais Bactéria do Que Humano',
        'excerpt': 'O eixo intestino-cérebro e o segundo cérebro que vive em nós.',
        'author': 'Mergior Goriate',
        'date': '10 Ago 2024',
        'category': 'Biologia',
        'image_url': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=60&w=800&auto=format&fit=crop',
        'read_time': 10,
        'tags': ['Biologia', 'Saúde', 'Microbioma', 'Ciência']
    },
    {
        'id': '31',
        'title': 'O Valor do Criticismo na Era da Polarização',
        'excerpt': 'Recuperando a arte de discernir entre criticismo construtivo e cinismo.',
        'author': 'Mergior Goriate',
        'date': '8 Ago 2024',
        'category': 'Psicologia',
        'image_url': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=60&w=800&auto=format&fit=crop',
        'read_time': 8,
        'tags': ['Filosofia', 'Pensamento Crítico', 'Sociedade', 'Debate']
    },
    {
        'id': '32',
        'title': 'Como as Redes Sociais Estão a Mudar a Nossa Forma de Pensar',
        'excerpt': 'Neuroplasticidade, dopamina e a erosão da atenção profunda.',
        'author': 'Mergior Goriate',
        'date': '5 Ago 2024',
        'category': 'Psicologia',
        'image_url': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=60&w=800&auto=format&fit=crop',
        'read_time': 10,
        'tags': ['Psicologia', 'Tecnologia', 'Redes Sociais', 'Mente']
    },
    {
        'id': '33',
        'title': 'O Poder das Pequenas Decisões: Efeito Composto e Borboleta',
        'excerpt': 'Como micro-decisões diárias moldam toda a nossa trajetória de vida.',
        'author': 'Mergior Goriate',
        'date': '3 Ago 2024',
        'category': 'Psicologia',
        'image_url': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=60&w=800&auto=format&fit=crop',
        'read_time': 7,
        'tags': ['Psicologia', 'Hábitos', 'Decisões', 'Vida']
    },
    {
        'id': '34',
        'title': 'Inteligência Artificial: Ameaça ou Aliada da Humanidade?',
        'excerpt': 'O debate entre substituição e aumentação no futuro do trabalho.',
        'author': 'Mergior Goriate',
        'date': '1 Ago 2024',
        'category': 'Tecnologia',
        'image_url': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=60&w=800&auto=format&fit=crop',
        'read_time': 11,
        'tags': ['IA', 'Tecnologia', 'Futuro', 'Ética']
    },
    {
        'id': '35',
        'title': 'O Futuro da Educação: Aprendizagem Personalizada e IA',
        'excerpt': 'Como a tecnologia está a transformar a forma como aprendemos e ensinamos.',
        'author': 'Mergior Goriate',
        'date': '29 Jul 2024',
        'category': 'Inovação',
        'image_url': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=60&w=800&auto=format&fit=crop',
        'read_time': 9,
        'tags': ['Educação', 'IA', 'Futuro', 'Aprendizagem']
    }
]

def seed_all_articles():
    with app.app_context():
        print(f"Target DB: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Check if admin exists
        admin = User.query.filter_by(email='admin@sussurros.pt').first()
        if not admin:
            print("Admin user not found. Creating admin...")
            admin = User(id='u1', name='Mergior Goriate', email='admin@sussurros.pt', role='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Admin user created.")
        
        # Delete existing articles
        Article.query.delete()
        db.session.commit()
        print("Existing articles deleted.")
        
        # Add all articles
        for art_data in ARTICLES_DATA:
            article = Article(
                id=art_data['id'],
                title=art_data['title'],
                excerpt=art_data['excerpt'],
                content=f"Conteúdo completo do artigo {art_data['id']}",  # Content will be loaded from articlesContent.ts in frontend
                author=art_data['author'],
                date=art_data['date'],
                category=art_data['category'],
                image_url=art_data['image_url'],
                read_time=art_data['read_time'],
                tags=",".join(art_data['tags']),
                likes=45 + int(art_data['id']) * 3,  # Vary likes
                views=2500 + int(art_data['id']) * 100,  # Vary views
                doi=f"10.3390/ss{art_data['id'].zfill(3)}"
            )
            db.session.add(article)
        
        db.session.commit()
        print(f"✅ Successfully added {len(ARTICLES_DATA)} articles to the database!")
        
        # Verify
        count = Article.query.count()
        print(f"Total articles in database: {count}")

if __name__ == '__main__':
    seed_all_articles()
