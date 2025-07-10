# AI Service Chatbot RAG

## Giới thiệu
Dự án này xây dựng một chatbot RAG (Retrieval-Augmented Generation) chạy local, cho phép người dùng hỏi đáp dựa trên tài liệu của bạn. Chatbot sử dụng các công nghệ hiện đại: Ollama (chạy model AI local), LangChain, FAISS, FastAPI (Python) và giao diện ReactJS.

---

## Thành phần sử dụng
- **Python >= 3.10**: Ngôn ngữ backend, chạy FastAPI, LangChain, FAISS.
- **Ollama**: Chạy model AI local (phi-2, mistral, llama2, ...).
- **LangChain**: Xây dựng pipeline RAG, quản lý embedding, truy xuất tài liệu.
- **FAISS**: Lưu trữ và tìm kiếm embedding tài liệu.
- **FastAPI**: Xây dựng REST API backend.
- **gpt4all**: Tạo embedding cho tài liệu.
- **ReactJS**: Xây dựng giao diện chat hiện đại.
- **Các thư viện khác**: requests, pydantic, langchain-community, langchain-text-splitters, v.v.

---

## Hướng dẫn cài đặt & chạy dự án

### 1. Clone project về máy


### 2. Cài đặt Python & môi trường ảo
```sh
python -m venv .venv
.venv\Scripts\activate  # (Windows)
```

### 3. Cài đặt các thư viện Python cần thiết
```sh
pip install fastapi uvicorn langchain langchain-community langchain-text-splitters faiss-cpu gpt4all requests pydantic
```

### 4. Cài đặt Ollama và tải model AI
- Tải Ollama tại: https://ollama.com/download
- Sau khi cài xong, mở terminal và chạy:
```sh
ollama pull phi
```

### 5. Chạy Ollama model
```sh
ollama run phi
```
(Để cửa sổ này luôn mở khi sử dụng chatbot)

### 6. Chạy FastAPI backend
```sh
cd ai_service
.venv\Scripts\activate
python -m uvicorn app.main:app --reload
```
- API sẽ chạy ở: http://127.0.0.1:8000
- Truy cập http://127.0.0.1:8000/docs để test API

### 7. (Khuyến nghị) Cấu hình CORS cho FastAPI nếu dùng frontend khác port
Thêm vào `app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # hoặc chỉ định domain FE
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 8. Chạy giao diện React (frontend)
```sh
npx create-react-app frontend
cd frontend
# Copy code giao diện vào src/ như hướng dẫn ở trên
npm install
npm start
```
- Giao diện sẽ chạy ở: http://localhost:3000
- FE sẽ gọi API tới http://localhost:8000/ask

---

## Hướng dẫn tích hợp với backend khác (ví dụ ASP.NET WebAPI)
- Để FastAPI RAG chạy như một microservice riêng.
- Backend chính (ASP.NET WebAPI) gọi sang FastAPI qua HTTP:
```csharp
var payload = new { question = "your question" };
var content = new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json");
var response = await httpClient.PostAsync("http://localhost:8000/ask", content);
var responseString = await response.Content.ReadAsStringAsync();
```
- FE chỉ gọi tới backend chính, không gọi trực tiếp FastAPI.

---

## File mẫu tài liệu
- Đặt file tài liệu vào thư mục `data/sample.txt` (có thể là tiếng Anh hoặc tiếng Việt).

---

## Lưu ý
- Không push thư mục `.venv` lên GitHub (thêm vào `.gitignore`).
- Nếu dùng tài liệu PDF, markdown, cài thêm: `pip install pypdf unstructured`
- Nếu muốn đổi model AI, dùng lệnh `ollama pull <model>` và sửa tên model trong code.

---

## Tác giả
- Hỗ trợ bởi AI, phát triển bởi bạn. 