from fastapi import FastAPI

app = FastAPI()

@app.get("/api/convert")
def check_connection():
    return {"status": "success", "message": "Bhai, Python Backend ekdum mast chal raha hai! 🔥"}