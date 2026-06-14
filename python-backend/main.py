import io
import os
import sys
import base64
import subprocess
import requests
import time
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response
from pydantic import BaseModel
from PIL import Image, ImageEnhance, ImageOps
import numpy as np

# ==========================================
# 🚀 PYTOSHOP AUTO-INSTALLER & SETUP
# ==========================================
try:
    import packbits
except ImportError:
    print("Missing packbits! Auto-installing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "packbits"])
    import packbits

import pytoshop
from pytoshop.user import nested_layers
from pytoshop import enums

for mod_name, mod in sys.modules.items():
    if mod_name.startswith('pytoshop'):
        setattr(mod, 'packbits', packbits)

# ==========================================
# 🚀 FASTAPI ENGINE & CORS SETUP
# ==========================================
app = FastAPI(title="DhamakaTools Ultimate Engine")

# 🔥 Strict CORS Fix (Zero Browser Restriction)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "success", "message": "DhamakaTools 6-in-1 Engine is Online! 🚀"}

# ==========================================
# 🔥 TOOL 1: PDF TO EXCEL
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
# 🔥 TOOL 2: PDF TO WORD
# ==========================================
@app.post("/api/pdf-to-word")
async def convert_pdf_to_word(file: UploadFile = File(...)):
    from pdf2docx import Converter
    import tempfile
    import docx
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_pdf_path = os.path.join(temp_dir, "input.pdf")
            temp_docx_path = os.path.join(temp_dir, "output.docx")
            
            with open(temp_pdf_path, "wb") as f:
                f.write(await file.read())
                
            cv = Converter(temp_pdf_path)
            cv.convert(temp_docx_path)
            cv.close()
            
            try:
                doc = docx.Document(temp_docx_path)
                doc.save(temp_docx_path)
            except Exception:
                pass
            
            with open(temp_docx_path, "rb") as f:
                file_data = f.read()
                
        original_name = file.filename.replace('.pdf', '')
        return Response(
            content=file_data, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f'attachment; filename="{original_name}_converted.docx"',
                "Content-Length": str(len(file_data))
            }
        )
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ==========================================
# 🔥 TOOL 3: AI LIVE PREVIEW (Background Remover)
# ==========================================
@app.post("/api/mega-preview")
async def process_mega_preview(
    cropped_image: str = Form(...), 
    bg_color: str = Form("transparent"),
    hd_upgrade: str = Form("false"),
    enhance: str = Form("false")
):
    from rembg import remove, new_session
    import gc
    try:
        ai_session = new_session()
        image_data = base64.b64decode(cropped_image.split(',')[1])
        input_image = Image.open(io.BytesIO(image_data)).convert("RGBA")
        
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
        
        del ai_session
        del output_image
        gc.collect()
        
        return Response(content=img_byte_arr, media_type="image/png")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ==========================================
# 🔥 TOOL 4: A4 PSD BUILDER
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
        
        start_x, start_y = 70, 40  
        spacing_x, spacing_y = 12, 12
        current_x, current_y = start_x, start_y
        
        for i in range(quantity):
            if current_x + target_w > a4_w - 50: 
                current_x = start_x
                current_y += target_h + spacing_y
                
            if current_y + target_h > a4_h - 40: 
                break 
                
            canvas.paste(final_image, (current_x, current_y))
            current_x += target_w + spacing_x

        img_arr = np.array(canvas, dtype=np.uint8) 
        alpha_channel = np.full((a4_h, a4_w), 255, dtype=np.uint8)

        layer = nested_layers.Image(
            name=f"{quantity} Photos Print Sheet",
            visible=True,
            top=0, left=0, bottom=a4_h, right=a4_w,
            channels={
                 -1: alpha_channel, 
                  0: np.ascontiguousarray(img_arr[:, :, 0]), 
                  1: np.ascontiguousarray(img_arr[:, :, 1]), 
                  2: np.ascontiguousarray(img_arr[:, :, 2])  
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
# 🔥 TOOL 5: AI PHOTO ENHANCER 
# ==========================================
@app.post("/api/enhance-photo")
async def enhance_photo(file: UploadFile = File(...)):
    try:
        REPLICATE_API_TOKEN = os.environ.get("REPLICATE_API_TOKEN")
        if not REPLICATE_API_TOKEN:
            return JSONResponse(status_code=500, content={"error": "API Token missing!"})
        
        image_bytes = await file.read()
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG", quality=95)
        encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
        image_uri = f"data:image/jpeg;base64,{encoded_image}"

        headers = {
            "Authorization": f"Bearer {REPLICATE_API_TOKEN}",
            "Content-Type": "application/json"
        }
        
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
            return JSONResponse(status_code=500, content={"error": start_response.text})

        prediction_url = start_response.json()["urls"]["get"]

        for _ in range(15):
            time.sleep(2) 
            check_response = requests.get(prediction_url, headers=headers).json()
            if check_response["status"] == "succeeded":
                return {"status": "success", "enhanced_image_url": check_response["output"]}
            elif check_response["status"] == "failed":
                return JSONResponse(status_code=500, content={"error": "AI Engine failure"})

        return JSONResponse(status_code=504, content={"error": "Timeout! Try again."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ==========================================
# 🔥 TOOL 6: SOCIAL MEDIA VIDEO DOWNLOADER
# ==========================================
class VideoRequest(BaseModel):
    url: str

@app.post("/api/video-downloader")
async def get_video_info(request: VideoRequest):
    import yt_dlp
    try:
        ydl_opts = {
            'format': 'best',
            'quiet': True,
            'no_warnings': True,
            'noplaylist': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            video_url = info.get('url') or (info.get('formats')[0].get('url') if info.get('formats') else None)
            
            if not video_url:
                return JSONResponse(status_code=400, content={"error": "Is link se video nahi nikal payi."})

            return {
                "status": "success",
                "title": info.get('title', 'Dhamaka_Video'),
                "thumbnail": info.get('thumbnail', ''),
                "video_url": video_url,
                "platform": info.get('extractor', 'Unknown')
            }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Link galat hai ya platform support nahi kar raha: {str(e)}"})