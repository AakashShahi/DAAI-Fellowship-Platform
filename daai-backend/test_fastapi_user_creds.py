import urllib.request, json

# 1. Login
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login', 
    data=json.dumps({"email": "admin@daai.com", "password": "Admin@12345"}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    res = urllib.request.urlopen(req)
    token = json.loads(res.read().decode('utf-8'))['access_token']
except urllib.error.HTTPError as e:
    print("Login Failed:", e.read().decode('utf-8'))
    exit(1)

# 2. Get cohorts
req_cohorts = urllib.request.Request('http://127.0.0.1:8000/api/v1/admin/cohorts', 
    headers={'Authorization': f'Bearer {token}'},
    method='GET'
)
res_cohorts = urllib.request.urlopen(req_cohorts)
cohorts = json.loads(res_cohorts.read().decode('utf-8'))
cohort_id = cohorts[0]['id'] if cohorts else "65b4f3b1e3b2a2b4b4e3b1c1"

# 3. Create Session (let's try to mimic the UI's timezone handling or exactly what the user might be doing)
payload = {
    'title': 'Test Session By Script',
    'description': '',
    'cohortId': cohort_id,
    'sessionDate': '2026-06-11T00:00:00.000Z',
    'startTime': '10:00',
    'endTime': '11:00',
    'meetingLink': '',
    'recordingLink': '',
    'status': 'scheduled'
}
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/admin/sessions', 
    data=json.dumps(payload).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'},
    method='POST'
)
try:
    res = urllib.request.urlopen(req)
    print("Success:", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('Code:', e.code)
    print('Body:', e.read().decode('utf-8'))
