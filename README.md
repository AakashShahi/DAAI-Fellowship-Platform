# DAAI Fellowship Platform

A centralized Fellowship Management System designed to recruit students, manage training programs, evaluate performance, and connect fellows with internship and employment opportunities.

---

# Project Structure

```txt
DAAI-Fellowship-Platform/
├── daai-backend/
├── daai-frontend/
├── .gitignore
└── README.md
```

---

# Prerequisites

Install the following before starting the project.

## Required Software

### 1. Python 3.11+

Download:
https://www.python.org/downloads/

Verify installation:

```bash
python --version
```

---

### 2. Node.js 20+

Download:
https://nodejs.org/

Verify installation:

```bash
node -v
npm -v
```

---

### 3. Git

Download:
https://git-scm.com/downloads

Verify installation:

```bash
git --version
```

---

# Backend Setup (FastAPI)

## Navigate to Backend

```bash
cd daai-backend
```

---

## Create Virtual Environment

### Windows

```bash
python -m venv venv
```

Activate virtual environment:

```bash
venv\Scripts\activate
```

---

### Mac/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Backend Folder Structure

```txt
daai-backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── middleware/
│   ├── dependencies/
│   ├── utils/
│   └── config/
├── requirements.txt
├── .env
├── .example.env
└── venv/
```

---

## Create .env File

Copy `.example.env`:

### Windows

```bash
copy .example.env .env
```

### Mac/Linux

```bash
cp .example.env .env
```

---

## Run Backend Server

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```txt
http://127.0.0.1:8000
```

Swagger Docs:

```txt
http://127.0.0.1:8000/docs
```

---

# Frontend Setup (Vite + React)

## Navigate to Frontend

```bash
cd ../daai-frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Frontend

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# requirements.txt

Create file:

```txt
daai-backend/requirements.txt
```

Add:

```txt
fastapi
uvicorn[standard]
python-dotenv
beanie
motor
pymongo
python-jose
passlib[bcrypt]
bcrypt
python-multipart
pydantic
email-validator
redis
celery
```

---

# Sample main.py

Create:

```txt
daai-backend/app/main.py
```

Add:

```python
from fastapi import FastAPI

app = FastAPI(
    title="DAAI Fellowship Platform API",
    version="1.0.0"
)

@app.get("/")
async def root():
    return {
        "message": "DAAI Fellowship Platform Backend Running"
    }
```

---

# Sample App.jsx

Replace:

```txt
daai-frontend/src/App.jsx
```

with:

```jsx
function App() {
  return (
    <div className="text-3xl font-bold p-10">
      DAAI Fellowship Platform Frontend Running
    </div>
  );
}

export default App;
```

---

# Recommended .gitignore

Create:

```txt
DAAI-Fellowship-Platform/.gitignore
```

Add:

```gitignore
# Backend
daai-backend/venv/
daai-backend/__pycache__/
daai-backend/.env

# Frontend
daai-frontend/node_modules/
daai-frontend/dist/

# Common
.vscode/
.DS_Store
```

---

# Verify Setup

## Backend

Run:

```bash
uvicorn app.main:app --reload
```

Visit:

```txt
http://127.0.0.1:8000/docs
```

---

## Frontend

Run:

```bash
npm run dev
```

Visit:

```txt
http://localhost:5173
```
