import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from apps.articles.models import Article, Category

@pytest.mark.django_db
class TestArticleAPI:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testapi', password='password')
        self.category = Category.objects.create(name='Tech', slug='tech')
        self.article = Article.objects.create(
            title='API Test Article',
            content='Content',
            author=self.user,
            category=self.category,
            status='published'
        )

    def test_list_articles(self):
        response = self.client.get('/api/articles/')
        assert response.status_code == 200
        assert len(response.data['results']) == 1
        assert response.data['results'][0]['title'] == 'API Test Article'

    def test_retrieve_article(self):
        response = self.client.get(f'/api/articles/{self.article.slug}/')
        assert response.status_code == 200
        assert response.data['title'] == 'API Test Article'
        
    def test_author_message_endpoint(self):
        url = f'/api/authors/{self.user.username}/send_message/'
        data = {
            'name': 'Reader',
            'email': 'reader@test.com',
            'message': 'Great article!'
        }
        response = self.client.post(url, data, format='json')
        assert response.status_code == 201
        assert response.data['message'] == 'Great article!'
