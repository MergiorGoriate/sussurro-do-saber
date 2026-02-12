import requests
import json

url = 'http://127.0.0.1:5000/api/auth/login'
headers = {'Content-Type': 'application/json'}
data = {'email': 'admin@sussurros.pt', 'password': 'admin123'}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Login SUCCESS via API")
        print(response.json())
    else:
        print("Login FAILED via API")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
