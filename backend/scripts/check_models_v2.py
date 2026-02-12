import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY')

genai.configure(api_key=api_key)

with open('backend/models_list.txt', 'w') as f:
    f.write(f"Key prefix: {api_key[:10]}...\n")
    try:
        for m in genai.list_models():
            f.write(f"{m.name} - {m.supported_generation_methods}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
