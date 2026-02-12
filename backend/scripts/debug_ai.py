import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel('gemini-1.5-flash') # Tentando o flash normal
    response = model.generate_content("Olá, teste rápido.")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error Type: {type(e)}")
    print(f"Error Message: {e}")
