import google.generativeai as genai
import os
import json
from django.conf import settings

def get_gemini_model():
    # Carregar da variável de ambiente ou settings
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return None
    
    genai.configure(api_key=api_key)
    # Using 'models/gemini-2.5-flash' which works with this API Key
    return genai.GenerativeModel('models/gemini-2.5-flash')

def generate_ai_insight(content):
    model = get_gemini_model()
    if not model:
        return "Fascinante reflexão científica em processamento..."
    
    prompt = f"Como um curador científico, forneça um insight curto (máximo 3 frases) e fascinante sobre este artigo: {content[:4000]}"
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Insight Error: {str(e)}")
        return "Insight indisponível no momento."

def generate_ai_summary(content):
    model = get_gemini_model()
    if not model:
        return "IA pendente de configuração."
    
    prompt = f"""
    Você é um editor sénior do jornal académico "Sussurros do Saber".
    Leia o manuscrito abaixo e crie um sumário executivo de alto nível.
    O sumário deve consistir em 3 pontos fundamentais (bullet points), totalizando no máximo 80 palavras.
    Seja rigoroso, académico mas fascinante.
    
    Texto:
    {content[:4000]}
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Summary Error: {str(e)}")
        return "Não foi possível gerar o sumário."

def generate_ai_glossary(content):
    model = get_gemini_model()
    if not model:
        return []
    
    prompt = f"""
    Como editor académico do Sussurros do Saber, analise o texto abaixo.
    Identifique 5 a 8 termos técnicos, científicos ou conceitos complexos que necessitam de clarificação.
    REGRAS CRÍTICAS:
    1. Ignore termos extremamente comuns.
    2. Foque-se em conceitos específicos.
    3. A definição deve ter entre 10 e 20 palavras, num tom formal e enciclopédico.
    4. Retorne APENAS o JSON.
    
    Exemplo:
    [
        {{"term": "Entropia", "definition": "Medida da desordem ou aleatoriedade de um sistema físico."}}
    ]
    
    Texto:
    {content[:3000]}
    """
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Glossary Error: {str(e)}")
        return [
            {"term": "Algoritmo", "definition": "Sequência de instruções para resolver um problema ou realizar uma tarefa."}
        ]

def generate_ai_chat(message, history=None):
    model = get_gemini_model()
    if not model:
        return "IA indisponível."
    
    # Format history for Gemini (User: 'user', Model: 'model')
    formatted_history = []
    if history:
        for msg in history:
            role = 'user' if msg.get('role') == 'user' else 'model'
            formatted_history.append({'role': role, 'parts': [msg.get('text', '')]})

    chat = model.start_chat(history=formatted_history)
    try:
        response = chat.send_message(message)
        return response.text
    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return "O assistente está a descansar. Tente mais tarde."
