import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000/api"

def test_admin_management():
    # 1. Login to get token
    print("Testing Login...")
    login_payload = {
        "email": "admin@sussurros.pt",
        "password": "admin"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_payload)
    if response.status_code != 200:
        print(f"FAILED: Login failed with {response.status_code}")
        return
    
    token = response.json()['token']
    headers = {"Authorization": f"Bearer {token}"}
    print("SUCCESS: Logned in.")

    # 2. Test Get Profile
    print("\nTesting Get Profile...")
    response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
    if response.status_code == 200:
        print(f"SUCCESS: Profile data: {response.json()['name']}")
    else:
        print(f"FAILED: Get Profile failed with {response.status_code}")

    # 3. Test Update Profile
    print("\nTesting Update Profile...")
    update_payload = {"name": "Mergior Goriate (Editor)"}
    response = requests.put(f"{BASE_URL}/auth/profile", json=update_payload, headers=headers)
    if response.status_code == 200:
        print(f"SUCCESS: Profile updated to: {response.json()['user']['name']}")
    else:
        print(f"FAILED: Update Profile failed with {response.status_code}")

    # 4. Test Create New Admin
    print("\nTesting Create New Admin...")
    new_user_payload = {
        "name": "Equipa Editorial 2",
        "email": f"editor2_{int(time.time())}@sussurros.pt",
        "password": "password123",
        "role": "admin"
    }
    response = requests.post(f"{BASE_URL}/users", json=new_user_payload, headers=headers)
    if response.status_code == 201:
        print(f"SUCCESS: New admin created: {response.json()['user']['email']}")
    else:
        print(f"FAILED: Create Admin failed with {response.status_code}")

if __name__ == "__main__":
    test_admin_management()
