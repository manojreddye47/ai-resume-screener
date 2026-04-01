# 🤖 AI Resume Screener

An AI-powered resume screening tool that scores and ranks candidates based on how well they match a job description — built with React, FastAPI, and Google Gemini API.

## 🎯 Problem It Solves
HR teams spend a full day manually reading 60+ resumes. By resume #50, judgment drifts and great candidates get missed. This tool automates the screening process with consistent AI scoring.

## ✨ Features
- Upload any Job Description (PDF, DOCX, TXT)
- Upload multiple resumes at once
- AI scores each resume out of 100
- Ranked results with clear reasoning per candidate
- Flags unreadable or empty resumes separately

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| PDF Parsing | PyMuPDF + pdfplumber |
| AI Scoring | Google Gemini 2.0 Flash |

## 🚀 How to Run Locally

### 1. Clone the repo
```bash
git clone https://github.com/manojreddye47/ai-resume-screener.git
cd ai-resume-screener
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\Activate
pip install fastapi uvicorn python-multipart pymupdf pdfplumber python-dotenv google-genai
```

Create a `.env` file in the backend folder:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the backend:
```bash
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Go to `http://localhost:5173` in your browser.

## 📋 How to Use
1. Upload the Job Description file
2. Upload one or more resume files
3. Click **Screen Resumes**
4. View ranked candidates with AI-generated scores and reasons

## 🔑 Environment Variables
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API key from aistudio.google.com |
```

Then push it:
```
git add .
git commit -m "Add README with setup instructions"
git push origin main

