from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz
import openai
import os
from dotenv import load_dotenv
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

client = openai.OpenAI(api_key=openai.api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

@app.post("/analyze")
async def analyze_files(
    resume: UploadFile = File(...),
    job_desc_text: str = Form(...)
):
    resume_content = await resume.read()
    resume_text = extract_text_from_pdf(resume_content) if resume.filename.endswith(".pdf") else resume_content.decode("utf-8")

    prompt = f"""
You are an intelligent interview generator AI. Based on the following resume and job description, generate 5 behavioral and 5 technical questions:

Resume:
{resume_text}

Job Description:
{job_desc_text}
"""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
    )

    questions = response.choices[0].message.content.strip()
    return {"generated_questions": questions}
