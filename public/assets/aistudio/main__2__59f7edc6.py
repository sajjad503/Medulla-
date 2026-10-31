from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, academic_records

app = FastAPI(title="Mentora Secure API")

# 🔴 آدرس‌های فرانت‌اند ری‌اکت را دقیقاً اینجا مشخص می‌کنیم
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # در صورتی که ویت روی پورت 5173 ران شود
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(academic_records.router)

@app.get("/")
def read_root():
    return {"message": "سرور منتورا بدون باگ در حال اجراست 🚀"}