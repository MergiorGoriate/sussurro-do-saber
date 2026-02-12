import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest']

for m in models:
    print(f"Testing {m}...")
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content("Responda apenas 'OK'")
        print(f"Result for {m}: {response.text.strip()}")
    except Exception as e:
        print(f"Result for {m}: ERROR - {str(e)}")
