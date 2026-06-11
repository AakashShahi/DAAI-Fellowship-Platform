from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.schema.session_schema import SessionCreate

app = FastAPI()

@app.post("/test")
def test_create(payload: SessionCreate):
    return {"status": "ok"}

client = TestClient(app)

res = client.post("/test", json={
    "title": "Test",
    "description": "Test desc",
    "cohortId": "65b4f3b1e3b2a2b4b4e3b1c1",
    "sessionDate": "2026-06-15T00:00:00.000Z",
    "startTime": "10:00",
    "endTime": "11:00",
    "meetingLink": "",
    "recordingLink": "",
    "status": "scheduled"
})
print("STATUS:", res.status_code)
print("BODY:", res.text)
