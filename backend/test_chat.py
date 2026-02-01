import requests

try:
    response = requests.post("http://localhost:5000/api/ai/chat", json={
        "message": "Olá, sugeres algum artigo?",
        "history": []
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
