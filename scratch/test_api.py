import requests, json
url = 'http://127.0.0.1:8000/api/counseling/analyze/'
payload = {
    "fullName": "Test User",
    "email": "test@example.com",
    "expectedMarks": 150,
    "category": "General",
    "interests": ["Computer Science"],
    "budget": 500000,
    "stream": "Engineering"
}
headers = {"Content-Type": "application/json", "Authorization": "Token dummy"}
resp = requests.post(url, json=payload, headers=headers)
print('Status:', resp.status_code)
print('Response:', resp.text)
