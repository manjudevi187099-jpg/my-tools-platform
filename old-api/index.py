from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import Response
import io
import os
import tempfile
import pandas as pd
import pdfplumber
from pdf2docx import Converter
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

# ==========================================
# 1. PDF TO EXCEL ENGINE
# ==========================================
@app.post("/api/pdf-to-excel")
async def pdf_to_excel(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        excel_buffer = io.BytesIO()
        
        all_data = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                table = page.extract_table()
                if table:
                    all_data.extend(table)
                    
        if not all_data:
            return {"error": "Is PDF mein koi table nahi mili bhai!"}
            
        df = pd.DataFrame(all_data[1:], columns=all_data[0])
        df.to_excel(excel_buffer, index=False)
        excel_buffer.seek(0)
        
        return Response(
            content=excel_buffer.getvalue(), 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        return {"error": f"Conversion failed: {str(e)}"}


# ==========================================
# 2. PDF TO WORD ENGINE
# ==========================================
@app.post("/api/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            tmp_pdf.write(pdf_bytes)
            pdf_path = tmp_pdf.name
            
        docx_path = pdf_path.replace(".pdf", ".docx")
        
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
        
        with open(docx_path, "rb") as f:
            docx_bytes = f.read()
            
        os.remove(pdf_path)
        os.remove(docx_path)
        
        return Response(
            content=docx_bytes, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except Exception as e:
        return {"error": f"Conversion failed: {str(e)}"}


# ==========================================
# 3. PHOTO STUDIO ENGINE (Only Sheet Builder!)
# ==========================================
# Frontend isi API ko call kar raha hai: /api/photo-studio
@app.post("/api/photo-studio")
async def photo_studio(
    processed_image: UploadFile = File(...),
    photo_size: str = Form(...),
    quantity: int = Form(...),
    add_border: str = Form("false")
):
    try:
        # Hugging Face se aayi hui AI saaf photo ko yahan receive kiya
        img_bytes = await processed_image.read()
        single_photo = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # A4 Sheet (2480 x 3508 pixels)
        a4_sheet = Image.new("RGB", (2480, 3508), "white")
        
        # Abhi ke liye demo paste (iske baad hum isme grid setup karenge)
        a4_sheet.paste(single_photo, (100, 100)) 
        
        psd_buffer = io.BytesIO()
        a4_sheet.save(psd_buffer, format='PNG') 
        psd_buffer.seek(0)
        
        return Response(content=psd_buffer.getvalue(), media_type="image/png")
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# RUN SERVER
# ==========================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000)) 
    uvicorn.run("api.index:app", host="0.0.0.0", port=port, reload=False)