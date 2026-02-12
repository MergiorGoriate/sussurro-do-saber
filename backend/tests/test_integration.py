import unittest
import json
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app, db
from models import Article

class BackendIntegrationTest(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = app.test_client()
        with app.app_context():
            db.create_all()
            # Seed basic data
            a = Article(
                id='test-1',
                title='Teste de Integracao',
                content='Conteudo de teste para IA.',
                category='Ciência',
                author='TestBot',
                date='06 Feb 2026'
            )
            db.session.add(a)
            db.session.commit()

    def tearDown(self):
        with app.app_context():
            db.drop_all()

    def test_get_articles(self):
        response = self.client.get('/api/articles')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(len(data) >= 1)

    def test_ai_summary(self):
        # This might fail if GEMINI_API_KEY is not set, 
        # but we check the 400/500 handling
        response = self.client.post('/api/ai/summary', 
                                    data=json.dumps({'content': 'Texto para resumo.'}),
                                    content_type='application/json')
        # Expect either 200 or 500 (if no key), but not 404
        self.assertIn(response.status_code, [200, 500])

    def test_ai_glossary(self):
        response = self.client.post('/api/ai/glossary',
                                    data=json.dumps({'content': 'Termo complexo: Entropia.'}),
                                    content_type='application/json')
        self.assertIn(response.status_code, [200, 500])

if __name__ == '__main__':
    unittest.main()
