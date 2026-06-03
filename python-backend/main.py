from fastapi import FastAPI, File, UploadFile, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse, Response
import pdfplumber
import pandas as pd
import io
import os
import sys
import uuid
import base64
import subprocess
from pdf2docx import Converter

# ==========================================
# 🚀 INDESTRUCTIBLE BRAMHASTRA FIX 🚀
# ==========================================
# 1. Khud check karega aur sahi jagah auto-install karega
try:
    import packbits
except ImportError:
    print("Missing packbits! Auto-installing in the exact server environment...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "packbits"])
    import packbits

import pytoshop
from pytoshop.user import nested_layers
from pytoshop import enums
import numpy as np

# 2. Pytoshop library ke dimaag mein packbits zabardasti daalna:
for mod_name, mod in sys.modules.items():
    if mod_name.startswith('pytoshop'):
        setattr(mod, 'packbits', packbits)

# 🔥 AI PHOTO STUDIO IMPORTS 🔥
from rembg import remove, new_session
from PIL import Image, ImageEnhance, ImageOps

app = FastAPI(title="PdfNexa Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 🚀 SPEED FIX: AI MODEL KO MEMORY MEIN LOCK KAR DIYA 🚀
# ==========================================
print("Engine is loading AI Model into RAM for Instant Speed...")
ai_session = new_session()
print("AI Model Ready!")

@app.get("/")
def home():
    return {"status": "success", "message": "Engine is running perfectly! 🚀"}

# ==========================================
# 🔥 TOOL 1: PDF TO EXCEL 
# ==========================================
@app.post("/api/pdf-to-excel")
async def convert_pdf_to_excel(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        pdf_file = io.BytesIO(pdf_bytes)
        all_tables = []
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                table = page.extract_table()
                if table:
                    all_tables.extend(table)
        
        if not all_tables:
            return JSONResponse(status_code=400, content={"error": "Is PDF mein table ke borders nahi mile!"})

        df = pd.DataFrame(all_tables)
        excel_io = io.BytesIO()
        with pd.ExcelWriter(excel_io, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, header=False)
        
        excel_io.seek(0)
        original_name = file.filename.replace('.pdf', '')
        return StreamingResponse(
            excel_io, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{original_name}_converted.xlsx"'}
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ==========================================
# 🔥 TOOL 2: PDF TO WORD 
# ==========================================
def remove_temp_files(path1: str, path2: str):
    if os.path.exists(path1): os.remove(path1)
    if os.path.exists(path2): os.remove(path2)

@app.post("/api/pdf-to-word")
async def convert_pdf_to_word(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    try:
        file_id = str(uuid.uuid4())
        temp_pdf_path = f"temp_{file_id}.pdf"
        temp_docx_path = f"temp_{file_id}.docx"
        
        with open(temp_pdf_path, "wb") as f:
            f.write(await file.read())
            
        cv = Converter(temp_pdf_path)
        cv.convert(temp_docx_path)
        cv.close()
        
        background_tasks.add_task(remove_temp_files, temp_pdf_path, temp_docx_path)
        
        original_name = file.filename.replace('.pdf', '')
        return FileResponse(
            temp_docx_path, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{original_name}_converted.docx"
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ==========================================
# 🔥 TOOL 3: AI LIVE PREVIEW (SUPER FAST AUTO-SYNC)
# ==========================================
@app.post("/api/mega-preview")
async def process_mega_preview(
    cropped_image: str = Form(...), 
    bg_color: str = Form("transparent"),
    hd_upgrade: str = Form("false"),
    enhance: str = Form("false")
):
    try:
        image_data = base64.b64decode(cropped_image.split(',')[1])
        input_image = Image.open(io.BytesIO(image_data)).convert("RGBA")
        
        # 1. AI Background Remove
        output_image = remove(input_image, session=ai_session)
        
        # 2. Color Change
        if bg_color != "transparent":
            background = Image.new("RGBA", output_image.size, bg_color)
            background.paste(output_image, (0, 0), output_image)
            final_image = background.convert("RGB")
        else:
            final_image = output_image.convert("RGBA")

        # 3. Enhance Quality
        if enhance == "true" or hd_upgrade == "true":
            enhancer = ImageEnhance.Color(final_image)
            final_image = enhancer.enhance(1.2)
            sharpness = ImageEnhance.Sharpness(final_image)
            final_image = sharpness.enhance(1.5)

        img_byte_arr = io.BytesIO()
        final_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return Response(content=img_byte_arr, media_type="image/png")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ==========================================
# 🔥 TOOL 4: A4 ASLI PSD BUILDER (6x7 Grid = 42 Photos)
# ==========================================
@app.post("/api/mega-sheet")
async def process_mega_sheet(
    processed_image: UploadFile = File(...),
    photo_size: str = Form("passport"),
    quantity: int = Form(8),
    add_border: str = Form("false")
):
    try:
        image_bytes = await processed_image.read()
        final_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # PERFECT 6x7 GRID MATH FOR A4 (300 DPI)
        target_w, target_h = (380, 480) 
        
        final_image = final_image.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        if add_border == "true":
            final_image = ImageOps.expand(final_image, border=4, fill='black')
            final_image = final_image.resize((target_w, target_h), Image.Resampling.LANCZOS)

        a4_w, a4_h = 2480, 3508
        canvas = Image.new("RGBA", (a4_w, a4_h), "white")
        
        start_x = 70  
        start_y = 40  
        spacing_x = 12 
        spacing_y = 12
        
        current_x = start_x
        current_y = start_y
        
        for i in range(quantity):
            if current_x + target_w > a4_w - 50: 
                current_x = start_x
                current_y += target_h + spacing_y
                
            if current_y + target_h > a4_h - 40: 
                break 
                
            canvas.paste(final_image, (current_x, current_y))
            current_x += target_w + spacing_x

        # ASLI .PSD BUILDER
        img_arr = np.array(canvas) 
        
        layer = nested_layers.Image(
            name=f"{quantity} Photos Print Sheet",
            visible=True,
            top=0, left=0, bottom=a4_h, right=a4_w,
            channels={
                -1: np.ascontiguousarray(img_arr[:, :, 3]), # Alpha Channel
                 0: np.ascontiguousarray(img_arr[:, :, 0]), # Red
                 1: np.ascontiguousarray(img_arr[:, :, 1]), # Green
                 2: np.ascontiguousarray(img_arr[:, :, 2])  # Blue
            }
        )
        
        psd = nested_layers.nested_layers_to_psd([layer], color_mode=enums.ColorMode.rgb)
        
        img_byte_arr = io.BytesIO()
        psd.write(img_byte_arr)
        img_byte_arr = img_byte_arr.getvalue()
        
        return Response(content=img_byte_arr, media_type="image/vnd.adobe.photoshop")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})