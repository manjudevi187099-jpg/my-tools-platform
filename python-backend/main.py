import requests
import time
import base64
from fastapi import FastAPI, File, UploadFile, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse, Response
import io
import os
import sys
import uuid
import base64
import subprocess

# ==========================================
# 🚀 INDESTRUCTIBLE BRAMHASTRA FIX 🚀
# ==========================================
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

for mod_name, mod in sys.modules.items():
    if mod_name.startswith('pytoshop'):
        setattr(mod, 'packbits', packbits)

from PIL import Image, ImageEnhance, ImageOps

app = FastAPI(title="PdfNexa Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "success", "message": "Engine is running perfectly! 🚀 (Low RAM Mode)"}

# ==========================================
# 🔥 TOOL 1: PDF TO EXCEL (Lazy Loading for RAM)
# ==========================================
@app.post("/api/pdf-to-excel")
async def convert_pdf_to_excel(file: UploadFile = File(...)):
    import pdfplumber
    import pandas as pd
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
# 🔥 TOOL 2: PDF TO WORD (Lazy Loading for RAM)
# ==========================================
def remove_temp_files(path1: str, path2: str):
    if os.path.exists(path1): os.remove(path1)
    if os.path.exists(path2): os.remove(path2)

@app.post("/api/pdf-to-word")
async def convert_pdf_to_word(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    from pdf2docx import Converter
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
# 🔥 TOOL 3: AI LIVE PREVIEW (SUPER LOW RAM HACK)
# ==========================================
@app.post("/api/mega-preview")
async def process_mega_preview(
    cropped_image: str = Form(...), 
    bg_color: str = Form("transparent"),
    hd_upgrade: str = Form("false"),
    enhance: str = Form("false")
):
    # 🔥 RAM Fix: Import rembg ONLY when the button is clicked!
    from rembg import remove, new_session
    import gc
    try:
        print("Loading AI Engine into RAM...")
        ai_session = new_session()

        image_data = base64.b64decode(cropped_image.split(',')[1])
        input_image = Image.open(io.BytesIO(image_data)).convert("RGBA")
        
        # Free up memory before heavy processing
        gc.collect()

        output_image = remove(input_image, session=ai_session)
        
        if bg_color != "transparent":
            background = Image.new("RGBA", output_image.size, bg_color)
            background.paste(output_image, (0, 0), output_image)
            final_image = background.convert("RGB")
        else:
            final_image = output_image.convert("RGBA")

        if enhance == "true" or hd_upgrade == "true":
            enhancer = ImageEnhance.Color(final_image)
            final_image = enhancer.enhance(1.2)
            sharpness = ImageEnhance.Sharpness(final_image)
            final_image = sharpness.enhance(1.5)

        img_byte_arr = io.BytesIO()
        final_image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # 🔥 Clear RAM immediately after processing
        del ai_session
        del output_image
        gc.collect()
        
        return Response(content=img_byte_arr, media_type="image/png")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ==========================================
# 🔥 TOOL 4: A4 ASLI PSD BUILDER (FIXED FOR PHOTOSHOP)
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
        
        target_w, target_h = (380, 480) 
        final_image = final_image.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        if add_border == "true":
            final_image = ImageOps.expand(final_image, border=4, fill='black')
            final_image = final_image.resize((target_w, target_h), Image.Resampling.LANCZOS)

        a4_w, a4_h = 2480, 3508
        canvas = Image.new("RGB", (a4_w, a4_h), "white")
        
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

        # 🔥 Fix: Data ko forcefully uint8 banaya
        img_arr = np.array(canvas, dtype=np.uint8) 
        
        # 🔥 Fix: Photoshop ko khush karne ke liye ek Solid Alpha Channel banaya
        alpha_channel = np.full((a4_h, a4_w), 255, dtype=np.uint8)

        layer = nested_layers.Image(
            name=f"{quantity} Photos Print Sheet",
            visible=True,
            top=0, left=0, bottom=a4_h, right=a4_w,
            channels={
                 -1: alpha_channel, # Alpha (Transparency mask)
                  0: np.ascontiguousarray(img_arr[:, :, 0]), # Red
                  1: np.ascontiguousarray(img_arr[:, :, 1]), # Green
                  2: np.ascontiguousarray(img_arr[:, :, 2])  # Blue
            }
        )
        
        psd = nested_layers.nested_layers_to_psd([layer], color_mode=enums.ColorMode.rgb)
        
        img_byte_arr = io.BytesIO()
        psd.write(img_byte_arr)
        img_byte_arr.seek(0)
        
        return StreamingResponse(
            img_byte_arr, 
            media_type="application/x-photoshop",
            headers={"Content-Disposition": f"attachment; filename=A4_Photo_Sheet_{quantity}pcs.psd"}
        )
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

        # ==========================================
# ==========================================
# # ==========================================
# 🔥 TOOL 5: AI PHOTO ENHANCER (REAL-ESRGAN VIA REPLICATE)
# ==========================================
@app.post("/api/enhance-photo")
async def enhance_photo(file: UploadFile = File(...)):
    try:
        REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN")
        
        if not REPLICATE_API_TOKEN:
            return JSONResponse(status_code=500, content={"error": "API Token missing! Kripya Render Environment Variables mein check karein."})
        
        # 1. Photo ko Base64 mein convert karein
        image_bytes = await file.read()
        encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        image_uri = f"data:{file.content_type};base64,{encoded_image}"

        # 2. Replicate API (Real-ESRGAN Model) ko call karein
        headers = {
            "Authorization": f"Bearer {REPLICATE_API_TOKEN}",
            "Content-Type": "application/json"
        }
        
        # 🔥 Model change: Real-ESRGAN (Best for HD + Face Enhance)
        data = {
            "version": "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b", 
            "input": {
                "image": image_uri,
                "scale": 2, 
                "face_enhance": True
            }
        }

        start_response = requests.post("https://api.replicate.com/v1/predictions", headers=headers, json=data)
        
        if start_response.status_code != 201:
            asli_error = start_response.json().get('detail', start_response.text)
            return JSONResponse(status_code=500, content={"error": f"Replicate Error: {asli_error}"})

        prediction_url = start_response.json()["urls"]["get"]

        # 3. Supercomputer ka wait karein
        for _ in range(15):
            time.sleep(2) 
            check_response = requests.get(prediction_url, headers=headers).json()
            
            if check_response["status"] == "succeeded":
                return {"status": "success", "enhanced_image_url": check_response["output"]}
            elif check_response["status"] == "failed":
                return JSONResponse(status_code=500, content={"error": "AI model photo ko enhance nahi kar paya."})

        return JSONResponse(status_code=504, content={"error": "Timeout! Photo badi thi, time zyada lag gaya."})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})