import os
import django
import sys
import time
import google.generativeai as genai
from django.conf import settings

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.articles.models import Article

def generate_academic_content(title, excerpt):
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("Erro: GEMINI_API_KEY não encontrada.")
        return None
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    
    prompt = f"""
    Atue como um Professor Catedrático e autor académico de renome.
    Escreva um artigo completo e rigoroso sobre o tema: "{title}".
    Contexto adicional: {excerpt}

    Estrutura Obrigatória:
    1. **Introdução**: Contextualização do problema e relevância.
    2. **Desenvolvimento**: Análise aprofundada, dividida em subtítulos claros (use Markdown ##).
    3. **Metodologia/Discussão**: Abordagem teórica ou prática sobre o tema.
    4. **Conclusão**: Síntese dos pontos principais e impacto futuro.
    5. **Referências Bibliográficas**: Cite e referencie 3 a 5 fontes académicas reais ou plausíveis (Formato APA).

    Requisitos de Estilo:
    - Tom formal, objectivo e científico (PT-PT).
    - Use formatação Markdown rica (negrito, itálico, listas).
    - Mínimo de 600 palavras.
    - O conteúdo deve ser original e fascinante.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Erro ao gerar conteúdo AI para '{title}': {e}")
        print(" -> Usando gerador de emergência (Fallback)...")
        return generate_fallback_content(title, excerpt)

def generate_fallback_content(title, excerpt):
    """Gera um artigo estruturado fictício quando a IA falha."""
    return f"""
## Introdução

O tema **{title}** representa um marco fundamental no estudo contemporâneo. Este artigo visa explorar as nuances de "{excerpt}" sob uma ótica académica e rigorosa.

## Fundamentos Teóricos

A compreensão de **{title}** exige uma análise multidisciplinar. Estudiosos argumentam que a evolução deste conceito tem seguido uma trajetória exponencial nas últimas décadas.
*   Ponto relevante 1 sobre {title}.
*   Ponto relevante 2 e suas implicações.

## Análise Crítica

Ao examinar os dados disponíveis, observa-se uma correlação direta entre as práticas modernas e os princípios fundamentais de **{title}**.
> "A verdadeira sabedoria está em reconhecer o impacto de {title} na sociedade." — *Citação Fictícia*

## Conclusão

Em suma, **{title}** continua a ser um campo fértil para investigação. As perspetivas futuras indicam uma integração ainda maior nas nossas vidas diárias.

## Referências Bibliográficas

1. Silva, A. (2024). *Estudos Avançados em {title}*. Editora Académica.
2. Santos, B., & Costa, C. (2023). "Impactos Globais: Uma Revisão". *Jornal de Ciências*, 12(3), 45-67.
3. Organization for Science. (2025). *Relatório Anual*. Recuperado de exemplo.com.
    """

def main():
    articles = Article.objects.all()
    total = articles.count()
    print(f"Iniciando a geração de conteúdo para {total} artigos...")
    
    for index, article in enumerate(articles, 1):
        print(f"[{index}/{total}] A gerar: {article.title}...")
        
        # Skip if content is already long (optional safeguard, removed for now to force regeneration)
        # if len(article.content) > 1000:
        #    print(" -> Conteúdo já parece completo. Saltando.")
        #    continue
            
        new_content = generate_academic_content(article.title, article.excerpt)
        
        if new_content:
            article.content = new_content
            # Also regenerate summary if needed
            # article.excerpt = ... 
            article.save()
            print(" -> Sucesso!")
        else:
            print(" -> Falha.")
            
        # Respect rate limits
        time.sleep(2)

    print("Concluído!")

if __name__ == "__main__":
    main()
