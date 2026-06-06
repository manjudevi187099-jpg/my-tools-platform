from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import Response
import io
import os
import tempfile
import pandas as pd
import pdfplumber
from pdf2docx import Converter
from PIL import Image
import base64
from rembg import remove
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Iska matlab har website se request aane do
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST sab allow karo
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
        
        # PDF se table nikalna
        all_data = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                table = page.extract_table()
                if table:
                    all_data.extend(table)
                    
        if not all_data:
            return {"error": "Is PDF mein koi table nahi mili bhai!"}
            
        # Data ko Excel mein convert karna
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
        
        # Temporary files banana zaroori hai pdf2docx ke liye
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
            tmp_pdf.write(pdf_bytes)
            pdf_path = tmp_pdf.name
            
        docx_path = pdf_path.replace(".pdf", ".docx")
        
        # Convert karna
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
        
        with open(docx_path, "rb") as f:
            docx_bytes = f.read()
            
        # Kachra saaf karna (Delete temp files)
        os.remove(pdf_path)
        os.remove(docx_path)
        
        return Response(
            content=docx_bytes, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except Exception as e:
        return {"error": f"Conversion failed: {str(e)}"}


# ==========================================
# 3. MEGA PHOTO STUDIO ENGINE
# ==========================================
@app.post("/api/mega-preview")
async def mega_preview(
    cropped_image: str = Form(...),
    bg_color: str = Form("transparent"),
    hd_upgrade: str = Form("false"),
    enhance: str = Form("false")
):
    try:
        # Frontend se image aayi
        image_data = base64.b64decode(cropped_image.split(",")[1])
        original_image = Image.open(io.BytesIO(image_data)).convert("RGBA")
        
        # 🪄 ASLI AI MAGIC: Background Remove karna
        no_bg_image = remove(original_image)

        # Naya background color lagana
        if bg_color != "transparent":
            # Naya color ka background banaya
            bg = Image.new("RGBA", no_bg_image.size, bg_color)
            # Bina background wali photo ko naye color par paste kiya
            bg.paste(no_bg_image, (0, 0), no_bg_image)
            final_image = bg
        else:
            final_image = no_bg_image

        img_byte_arr = io.BytesIO()
        final_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/mega-sheet")
async def mega_sheet(
    processed_image: UploadFile = File(...),
    photo_size: str = Form(...),
    quantity: int = Form(...),
    add_border: str = Form("false")
):
    # A4 Sheet (2480 x 3508 pixels)
    img_bytes = await processed_image.read()
    single_photo = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    
    a4_sheet = Image.new("RGB", (2480, 3508), "white")
    
    # Abhi ke liye demo paste
    a4_sheet.paste(single_photo, (100, 100)) 
    
    psd_buffer = io.BytesIO()
    a4_sheet.save(psd_buffer, format='PNG') 
    psd_buffer.seek(0)
    
    return Response(content=psd_buffer.getvalue(), media_type="image/png")