"""
Script de teste para verificar todas as funcionalidades do CMS
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"
ADMIN_EMAIL = "admin@sussurros.pt"
ADMIN_PASSWORD = "admin123"

def test_login():
    """Testa o login de administrador"""
    print("\n🔐 Testando Login...")
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login bem-sucedido! Token: {data['token'][:20]}...")
        return data['token']
    else:
        print(f"❌ Falha no login: {response.status_code}")
        return None

def test_get_articles(token=None):
    """Testa a listagem de artigos"""
    print("\n📚 Testando Listagem de Artigos...")
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    response = requests.get(f"{BASE_URL}/articles", headers=headers)
    if response.status_code == 200:
        articles = response.json()
        print(f"✅ {len(articles)} artigos encontrados")
        if articles:
            print(f"   Primeiro artigo: {articles[0]['title']}")
        return articles
    else:
        print(f"❌ Falha ao listar artigos: {response.status_code}")
        return []

def test_create_article(token):
    """Testa a criação de um artigo"""
    print("\n➕ Testando Criação de Artigo...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    new_article = {
        "title": "Artigo de Teste CMS",
        "excerpt": "Este é um artigo de teste criado via API",
        "content": "Conteúdo completo do artigo de teste",
        "author": "Mergior Goriate",
        "category": "Tecnologia",
        "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475",
        "readTime": 5,
        "tags": ["teste", "cms", "api"]
    }
    
    response = requests.post(f"{BASE_URL}/articles", headers=headers, json=new_article)
    if response.status_code in [200, 201]:
        print("✅ Artigo criado com sucesso!")
        return response.json()
    else:
        print(f"❌ Falha ao criar artigo: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def test_update_article(token, article_id):
    """Testa a atualização de um artigo"""
    print(f"\n✏️ Testando Atualização de Artigo (ID: {article_id})...")
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    updated_data = {
        "title": "Artigo de Teste CMS (Atualizado)",
        "excerpt": "Este artigo foi atualizado via API"
    }
    
    response = requests.put(f"{BASE_URL}/articles/{article_id}", headers=headers, json=updated_data)
    if response.status_code == 200:
        print("✅ Artigo atualizado com sucesso!")
        return True
    else:
        print(f"❌ Falha ao atualizar artigo: {response.status_code}")
        return False

def test_delete_article(token, article_id):
    """Testa a deleção de um artigo"""
    print(f"\n🗑️ Testando Deleção de Artigo (ID: {article_id})...")
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.delete(f"{BASE_URL}/articles/{article_id}", headers=headers)
    if response.status_code == 200:
        print("✅ Artigo deletado com sucesso!")
        return True
    else:
        print(f"❌ Falha ao deletar artigo: {response.status_code}")
        return False

def test_get_comments(token):
    """Testa a listagem de comentários"""
    print("\n💬 Testando Listagem de Comentários...")
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(f"{BASE_URL}/comments", headers=headers)
    if response.status_code == 200:
        comments = response.json()
        print(f"✅ {len(comments)} comentários encontrados")
        return comments
    else:
        print(f"❌ Falha ao listar comentários: {response.status_code}")
        return []

def test_get_subscribers(token):
    """Testa a listagem de assinantes"""
    print("\n👥 Testando Listagem de Assinantes...")
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(f"{BASE_URL}/subscribers", headers=headers)
    if response.status_code == 200:
        subscribers = response.json()
        print(f"✅ {len(subscribers)} assinantes encontrados")
        return subscribers
    else:
        print(f"❌ Falha ao listar assinantes: {response.status_code}")
        return []

def test_ai_insight():
    """Testa a geração de insights com IA"""
    print("\n🤖 Testando Geração de Insight com IA...")
    response = requests.post(f"{BASE_URL}/ai/insight", json={
        "topic": "computação quântica"
    })
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Insight gerado: {data['insight'][:100]}...")
        return True
    else:
        print(f"❌ Falha ao gerar insight: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return False

def run_all_tests():
    """Executa todos os testes"""
    print("=" * 60)
    print("🧪 INICIANDO TESTES DO CMS")
    print("=" * 60)
    
    # 1. Login
    token = test_login()
    if not token:
        print("\n❌ Não foi possível continuar sem autenticação")
        return
    
    # 2. Listar artigos
    articles = test_get_articles(token)
    
    # 3. Criar artigo
    new_article = test_create_article(token)
    
    # 4. Atualizar artigo (se criado)
    if new_article and 'id' in new_article:
        test_update_article(token, new_article['id'])
        
        # 5. Deletar artigo (se criado)
        test_delete_article(token, new_article['id'])
    
    # 6. Listar comentários
    test_get_comments(token)
    
    # 7. Listar assinantes
    test_get_subscribers(token)
    
    # 8. Testar IA
    test_ai_insight()
    
    print("\n" + "=" * 60)
    print("✅ TESTES CONCLUÍDOS!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERRO: Não foi possível conectar ao servidor.")
        print("   Certifique-se de que o backend está rodando em http://localhost:5000")
    except Exception as e:
        print(f"\n❌ ERRO INESPERADO: {e}")
