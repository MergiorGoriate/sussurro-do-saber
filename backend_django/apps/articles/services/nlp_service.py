
from .ai_service import AIService

class NLPService:
    def __init__(self):
        self.ai = AIService()

    def analyze_scientific_structure(self, content):
        """Avalia e sugere melhorias na estrutura do artigo"""
        prompt = f"""
        Analise a estrutura científica deste texto:
        {content}
        
        Sugira:
        1. Melhorias na Introdução
        2. Consistência das Metodologias
        3. Clareza da Conclusão
        """
        response = self.ai.model.generate_content(prompt)
        return response.text

    def extract_key_concepts(self, content):
        """Extrai conceitos chave para o indexador semântico"""
        prompt = f"Extraia os 10 conceitos científicos mais importantes deste texto em formato JSON list: {content}"
        response = self.ai.model.generate_content(prompt)
        return response.text
