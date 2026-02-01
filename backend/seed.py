from app import app, db
from models import Article, User, Setting
import uuid

# Initial Articles Data (Simplified version for seeding)
INITIAL_ARTICLES = [
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
    }
]

ARTICLES_CONTENT = {
    '1': "A computação quântica representa uma mudança de paradigma. Enquanto os computadores clássicos usam bits (0 ou 1), os quânticos usam qubits que podem existir em múltiplos estados simultaneamente. ## Superposição e Entrelaçamento \n Estes são os pilares da mecânica quântica...",
    '2': "A tecnologia CRISPR-Cas9 (Clustered Regularly Interspaced Short Palindromic Repeats) permite a edição precisa do DNA. ## Aplicações Médicas \n Desde a cura da anemia falciforme até novos tratamentos contra o cancro..."
}

def seed_db():
    with app.app_context():
        # Clean existing tables
        db.drop_all()
        db.create_all()

        # Create Admin User
        admin = User(id='u1', name='Mergior Goriate', email='admin@sussurros.pt', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)

        # Let's add the articles from INITIAL_ARTICLES
        for art_data in INITIAL_ARTICLES:
            article = Article(
                id=art_data['id'],
                title=art_data['title'],
                excerpt=art_data['excerpt'],
                content=ARTICLES_CONTENT.get(art_data['id'], ""),
                author=art_data['author'],
                date=art_data['date'],
                category=art_data['category'],
                image_url=art_data['image_url'],
                read_time=art_data['read_time'],
                tags=",".join(art_data['tags']),
                likes=45,
                views=2500,
                doi=f"10.3390/ss{art_data['id']}0"
            )
            db.session.add(article)

        db.session.commit()
        print("Database seeded with tags!")

if __name__ == '__main__':
    seed_db()
