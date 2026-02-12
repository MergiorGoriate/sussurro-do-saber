import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

models_to_test = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-flash-latest']

for model_name in models_to_test:
    print(f"\n--- Testing {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Olá, teste.")
        print(f"Success! Response: {response.text[:50]}...")
    except Exception as e:
        print(f"Error: {e}")
