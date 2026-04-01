from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import fitz
import pdfplumber
from google import genai
from dotenv import load_dotenv
import os
import json

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text(file_bytes: bytes, filename: str) -> str:
    text = ""
    try:
        if filename.endswith(".pdf"):
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text()
            if not text.strip():
                import io
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for page in pdf.pages:
                        text += page.extract_text() or ""
        elif filename.endswith(".docx"):
            import io
            from docx import Document
            doc = Document(io.BytesIO(file_bytes))
            text = "\n".join([p.text for p in doc.paragraphs])
        elif filename.endswith(".txt"):
            text = file_bytes.decode("utf-8")
    except Exception as e:
        return ""
    return text.strip()

def score_resume(jd_text: str, resume_text: str, filename: str) -> dict:
    if not resume_text:
        return {
            "filename": filename,
            "score": 0,
            "reason": "Could not extract text. Please re-upload a readable file.",
            "error": True
        }

    prompt = f"""
You are an expert HR assistant. Score the following resume against the job description.

JOB DESCRIPTION:
{jd_text}

RESUME:
{resume_text}

Evaluate based on:
1. Skills match with the JD (primary factor)
2. Relevant projects and portfolio work (primary factor)
3. Years and type of experience (secondary)
4. Education (secondary)

Respond ONLY with a valid JSON object in this exact format:
{{
  "score": <integer from 0 to 100>,
  "reason": "<2-3 sentences explaining the score>"
}}
"""
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        raw = response.text.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
        return {
            "filename": filename,
            "score": result.get("score", 0),
            "reason": result.get("reason", "No reason provided."),
            "error": False
        }
    except Exception as e:
        return {
            "filename": filename,
            "score": 0,
            "reason": f"Scoring failed: {str(e)}",
            "error": True
        }

@app.post("/screen")
async def screen_resumes(
    jd: UploadFile = File(...),
    resumes: List[UploadFile] = File(...)
):
    jd_bytes = await jd.read()
    jd_text = extract_text(jd_bytes, jd.filename)

    if not jd_text:
        return {"error": "Could not read the Job Description."}

    results = []
    errors = []

    import time
    for resume in resumes:
        resume_bytes = await resume.read()
        resume_text = extract_text(resume_bytes, resume.filename)
        result = score_resume(jd_text, resume_text, resume.filename)
        time.sleep(3)

        if result["error"]:
            errors.append(result)
        else:
            results.append(result)

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "ranked": results,
        "flagged": errors,
        "total": len(results) + len(errors)
    }

@app.get("/")
def root():
    return {"status": "AI Resume Screener backend is running!"}