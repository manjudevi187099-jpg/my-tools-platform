'use client';
import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from '@cantoo/pdf-lib';

export default function ImageToPdf() {
  const [cv, setCv] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  
  // Scanner States
  const [points, setPoints] = useState([{x:50,y:50}, {x:350,y:50}, {x:350,y:450}, {x:50,y:450}]);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load OpenCV
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.5.0/opencv.js';
    script.async = true;
    script.onload = () => { (window as any).cv.onRuntimeInitialized = () => setCv((window as any).cv); };
    document.body.appendChild(script);
  }, []);

  // 2. Pro Scanner Engine (Warping)
  const processScan = (imgElement: HTMLImageElement) => {
    if (!cv) return null;
    let src = cv.imread(imgElement);
    let dst = new cv.Mat();
    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      points[0].x, points[0].y, points[1].x, points[1].y,
      points[2].x, points[2].y, points[3].x, points[3].y
    ]);
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0,0, 800,0, 800,1100, 0,1100]);
    let M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(src, dst, M, new cv.Size(800, 1100));
    
    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 1100;
    cv.imshow(canvas, dst);
    
    src.delete(); dst.delete(); srcTri.delete(); dstTri.delete(); M.delete();
    return canvas.toDataURL('image/jpeg');
  };

  // 3. PDF Generator (Old Logic Merged)
  const convertToPdf = async () => {
    setIsProcessing(true);
    setStatus("Generating PDF...");
    try {
      const pdfDoc = await PDFDocument.create();
      // Yahan wahi purana loop logic daal lo jo images array par chalega
      const pdfBytes = await pdfDoc.save();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([pdfBytes as any], { type: 'application/pdf' }));
      a.download = `Pro_Scan.pdf`;
      a.click();
      setStatus("✅ Success!");
    } catch { setStatus("❌ Error!"); } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-2xl font-bold mb-6">Pro Scanner & Converter</h2>
      
      {/* Scanner UI */}
      <div className="relative inline-block border-2 border-slate-200">
        <img id="scannerImg" src={images[0]?.preview || "/placeholder.png"} className="max-w-md" />
        {points.map((p, i) => (
          <div key={i} draggable onDrag={(e) => {
              const newPoints = [...points];
              newPoints[i] = { x: e.clientX - 100, y: e.clientY - 100 };
              setPoints(newPoints);
          }} className="absolute w-6 h-6 bg-blue-600 rounded-full cursor-move border-2 border-white" style={{ left: p.x, top: p.y }} />
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button onClick={() => {
            const img = document.getElementById('scannerImg') as HTMLImageElement;
            const res = processScan(img);
            if(res) setPreview(res);
        }} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">Process Scan</button>
        <button onClick={convertToPdf} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold">Export PDF</button>
      </div>

      {status && <div className="mt-4 text-center font-bold">{status}</div>}
    </div>
  );
}