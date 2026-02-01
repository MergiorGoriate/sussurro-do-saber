import requests

try:
    response = requests.post("http://localhost:5000/api/ai/insight", json={
        "content": "A neurociência estuda como os neurônios se comunicam através de sinapses químicas e elétricas."
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
