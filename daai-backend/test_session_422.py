import requests

payload = {
  "title": "Test Session",
  "description": "Test",
  "cohortId": "65b4f3b1e3b2a2b4b4e3b1c1",
  "sessionDate": "2026-06-15T00:00:00.000Z",
  "startTime": "10:00",
  "endTime": "11:00",
  "meetingLink": "",
  "recordingLink": "",
  "status": "scheduled"
}

try:
    # Need to send an auth token, wait, I can just use a fake one? No, it will return 401.
    # What if I bypass auth or send bad data?
    pass
