import pytest
from django.contrib.auth.models import User
from apps.articles.models import Article, Category, AuthorMessage
from django.utils import timezone

@pytest.mark.django_db
class TestArticleModel:
    def test_create_article(self):
        user = User.objects.create_user(username='testauthor', password='password')
        category = Category.objects.create(name='Science', slug='science')
        article = Article.objects.create(
            title='Test Article',
            content='Test content',
            author=user,
            category=category,
            status='published'
        )
        assert article.slug == 'test-article'
        assert article.status == 'published'
        assert Article.objects.count() == 1

@pytest.mark.django_db
class TestAuthorMessageModel:
    def test_create_message(self):
        user = User.objects.create_user(username='recipient', password='password', is_staff=True)
        message = AuthorMessage.objects.create(
            author=user,
            name='Sender Name',
            email='sender@example.com',
            message='Hello author!'
        )
        assert message.author == user
        assert message.is_read is False
        assert str(message) == f"Mensagem de Sender Name para {user.username}"
