import urllib.request, json

req = urllib.request.Request('http://127.0.0.1:8000/test-422', 
    data=json.dumps({
        'title': 'Test Session',
        'description': 'Test',
        'cohortId': '65b4f3b1e3b2a2b4b4e3b1c1',
        'sessionDate': '',
        'startTime': '10:00',
        'endTime': '11:00',
        'meetingLink': '',
        'recordingLink': '',
        'status': 'scheduled'
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    res = urllib.request.urlopen(req)
    print("Success:", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('Code:', e.code)
    print('Body:', e.read().decode('utf-8'))
