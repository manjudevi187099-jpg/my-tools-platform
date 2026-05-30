from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import cv2
import numpy as np
import os
import uuid

app = FastAPI()

# Frontend (Next.js) ko backend se connect hone dene ke liye CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/remove-watermark")
async def remove_watermark(file: UploadFile = File(...)):
    input_path = f"temp_{uuid.uuid4()}.pdf"
    output_path = f"clean_{uuid.uuid4()}.pdf"

    # 1. File save karo
    with open(input_path, "wb") as f:
        f.write(await file.read())

    # 2. PDF load karo
    doc = fitz.open(input_path)
    clean_doc = fitz.open()

    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # 3. PDF page ko HD Image mein badlo
        pix = page.get_pixmap(dpi=200)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)

        # RGB se BGR (OpenCV format)
        if pix.n == 3:
            img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
        elif pix.n == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGR)

        # --- 💥 OPENCV MAGIC STARTS HERE 💥 ---
        # Image ko black & white (grayscale) mein badlo
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Thresholding: Jo bhi color '200' se light hai (jaise watermark), usko 255 (Pura Safed) kar do.
        # Jo dark hai (jaise original text), use waisa hi chhod do.
        _, clean_img = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
        # --- OPENCV MAGIC ENDS HERE ---

        # 4. Clean image ko wapas naye PDF page mein dalo
        success, encoded_img = cv2.imencode('.png', clean_img)
        img_doc = fitz.open("pdf", fitz.open("image", encoded_img.tobytes()).convert_to_pdf())
        clean_doc.insert_pdf(img_doc)

    clean_doc.save(output_path)
    doc.close()
    clean_doc.close()
    os.remove(input_path) # Temp file delete karo

    return FileResponse(output_path, media_type="application/pdf", filename="watermark_removed.pdf")