from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/users/{id}")
def get_user(id: int):
    return {"id": id, "name": "test"}

@app.put("/users/{id}")
def update_user(id: int):
    return {"status": "updated"}

@app.get("/health")
def health():
    return {"status": "ok"}