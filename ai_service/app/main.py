import os
from fastapi import FastAPI, Request
from pydantic import BaseModel
from langchain_community.embeddings import GPT4AllEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.docstore.document import Document
import requests
# Đường dẫn tài liệu mẫu
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/sample.txt')

# Khởi tạo FastAPI
app = FastAPI()
#$ .venv\Scripts\activate
# Tải và xử lý tài liệu
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    raw_text = f.read()

# Cắt nhỏ tài liệu
text_splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=50)
docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(raw_text)]

# Tạo embedding và FAISS index
embeddings = GPT4AllEmbeddings()
vectorstore = FAISS.from_documents(docs, embeddings)

# Model request/response
class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str

# Hàm gọi Ollama (phi-2)
def ask_ollama(context: str, question: str) -> str:
    prompt = f"""
Based on the following information, answer the user's question in English, clearly and concisely:

Document information:
{context}

Question: {question}
Answer:
"""
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "phi", "prompt": prompt, "stream": False}
    )
    data = response.json()
    return data.get("response", "No answer.")
# Endpoint hỏi đáp
@app.post("/ask", response_model=AskResponse)
def ask(request: AskRequest):
    # Tìm kiếm đoạn liên quan
    docs = vectorstore.similarity_search(request.question, k=2)
    context = "\n".join([doc.page_content for doc in docs])
    # Gọi model phi-2 qua Ollama
    answer = ask_ollama(context, request.question)
    return AskResponse(answer=answer) 