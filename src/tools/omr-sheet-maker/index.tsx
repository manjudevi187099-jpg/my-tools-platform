'use client';
import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';

type QuestionCount = 50 | 100 | 150 | 200;

export default function OMRSheetMaker() {
  const [instituteName, setInstituteName] = useState('YOUR INSTITUTE NAME');
  const [examName, setExamName] = useState('MOCK TEST OMR SHEET');
  const [qCount, setQCount] = useState<QuestionCount>(100);
  const [omrColor, setOmrColor] = useState('#000000'); // Black or Red/Pink is standard
  
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // A4 Size in Pixels (300 DPI)
  const A4_W = 2480;
  const A4_H = 3508;

  const drawOMR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_W, A4_H);

    // Set Color Theme
    ctx.strokeStyle = omrColor;
    ctx.fillStyle = omrColor;

    // 1. Draw Scanner Timing Marks (Real OMR Look)
    const drawTimingMarks = () => {
      ctx.fillStyle = '#000000'; // Timing marks are always black
      for (let i = 100; i < A4_H - 100; i += 120) {
        ctx.fillRect(50, i, 40, 20); // Left edge marks
        ctx.fillRect(A4_W - 90, i, 40, 20); // Right edge marks
      }
      ctx.fillStyle = omrColor; // Reset to theme color
    };
    drawTimingMarks();

    // 2. Main Border Box
    ctx.lineWidth = 6;
    ctx.strokeRect(150, 100, A4_W - 300, A4_H - 200);

    // 3. Header Section (Institute & Exam Name)
    ctx.textAlign = 'center';
    ctx.font = 'bold 70px Arial';
    ctx.fillText(instituteName.toUpperCase(), A4_W / 2, 220);
    
    ctx.font = 'bold 50px Arial';
    ctx.fillText(examName.toUpperCase(), A4_W / 2, 300);

    // Divider Line
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(150, 350);
    ctx.lineTo(A4_W - 150, 350);
    ctx.stroke();

    // 4. Student Info Section (Name, Date, Roll No boxes)
    ctx.textAlign = 'left';
    ctx.font = 'bold 35px Arial';
    
    // Name Box
    ctx.fillText("STUDENT NAME:", 200, 420);
    ctx.strokeRect(200, 440, 1100, 70);

    // Batch/Class
    ctx.fillText("BATCH / CLASS:", 200, 570);
    ctx.strokeRect(200, 590, 500, 70);

    // Date
    ctx.fillText("DATE OF EXAM:", 800, 570);
    ctx.strokeRect(800, 590, 500, 70);

    // Roll No Box (A bit larger for clarity)
    ctx.fillText("ROLL NUMBER:", 1400, 420);
    ctx.strokeRect(1400, 440, 700, 80);
    // Draw cells for Roll Number
    for(let i=1; i<10; i++) {
        ctx.beginPath();
        ctx.moveTo(1400 + (i*70), 440);
        ctx.lineTo(1400 + (i*70), 520);
        ctx.stroke();
    }

    // Instructions
    ctx.font = '30px Arial';
    ctx.fillText("INSTRUCTIONS:", 1400, 570);
    ctx.font = '25px Arial';
    ctx.fillText("1. Use Black/Blue Ball Point Pen only.", 1400, 610);
    ctx.fillText("2. Darken the circle completely.", 1400, 650);
    ctx.fillText("3. Do not use whitener or eraser.", 1400, 690);

    // Divider Line Before Questions
    ctx.beginPath();
    ctx.moveTo(150, 750);
    ctx.lineTo(A4_W - 150, 750);
    ctx.stroke();

    // 5. Questions Grid Logic
    const qPerColumn = 25; 
    const numCols = Math.ceil(qCount / qPerColumn);
    
    // Calculate layout based on columns
    const gridStartX = 200;
    const gridStartY = 830;
    const colWidth = (A4_W - 400) / numCols;
    const rowHeight = 85;

    ctx.font = 'bold 35px Arial';
    ctx.textAlign = 'right';

    for (let i = 0; i < qCount; i++) {
      const col = Math.floor(i / qPerColumn);
      const row = i % qPerColumn;
      
      const startX = gridStartX + (col * colWidth);
      const startY = gridStartY + (row * rowHeight);

      // Question Number
      ctx.fillText(`${i + 1}.`, startX + 60, startY + 12);

      // Draw 4 Bubbles (A, B, C, D)
      const options = ['A', 'B', 'C', 'D'];
      ctx.textAlign = 'center';
      
      options.forEach((opt, idx) => {
        const bubbleX = startX + 130 + (idx * 70);
        const bubbleY = startY;
        
        // Draw Circle
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, 22, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Letter inside
        ctx.font = 'bold 22px Arial';
        ctx.fillText(opt, bubbleX, bubbleY + 8);
      });
      ctx.textAlign = 'right'; // reset for next Q number
    }

    // 6. Signature Boxes at Bottom
    ctx.textAlign = 'center';
    ctx.font = 'bold 35px Arial';
    
    ctx.strokeRect(300, A4_H - 300, 600, 120);
    ctx.fillText("CANDIDATE SIGNATURE", 600, A4_H - 130);

    ctx.strokeRect(1580, A4_H - 300, 600, 120);
    ctx.fillText("INVIGILATOR SIGNATURE", 1880, A4_H - 130);
  };

  // Re-draw canvas whenever settings change
  useEffect(() => {
    drawOMR();
  }, [qCount, omrColor, instituteName, examName]);

  const generateAndDownloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);

    try {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const doc = new jsPDF('p', 'mm', 'a4');
      
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      
      doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      doc.save(`OMR_Sheet_${qCount}_Questions.pdf`);

    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Pro OMR Sheet Maker</h2>
        <p className="text-slate-500 mt-2 text-lg">Generate Print-Ready A4 OMR Sheets for Exams & Mock Tests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SETTINGS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-xl text-slate-800 mb-6">OMR Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Institute / Coaching Name</label>
                <input 
                  type="text" 
                  value={instituteName} 
                  onChange={e => setInstituteName(e.target.value)}
                  placeholder="e.g. TARGET CLASSES"
                  className="w-full p-3 border rounded-xl font-bold text-slate-700 bg-slate-50 focus:border-blue-500 outline-none uppercase" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exam Name</label>
                <input 
                  type="text" 
                  value={examName} 
                  onChange={e => setExamName(e.target.value)}
                  placeholder="e.g. WEEKLY MOCK TEST 1"
                  className="w-full p-3 border rounded-xl font-bold text-slate-700 bg-slate-50 focus:border-blue-500 outline-none uppercase" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Questions</label>
                <select 
                  value={qCount} 
                  onChange={(e) => setQCount(Number(e.target.value) as QuestionCount)} 
                  className="w-full p-3 border rounded-xl font-black text-blue-800 bg-slate-50 focus:border-blue-500 outline-none"
                >
                  <option value={50}>50 Questions</option>
                  <option value={100}>100 Questions</option>
                  <option value={150}>150 Questions</option>
                  <option value={200}>200 Questions</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">Columns will auto-adjust to perfectly fit A4.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OMR Color Theme</label>
                <div className="flex gap-3">
                  <button onClick={() => setOmrColor('#000000')} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${omrColor === '#000000' ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 bg-white text-slate-600'}`}>
                    Black (Standard)
                  </button>
                  <button onClick={() => setOmrColor('#d32f2f')} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${omrColor === '#d32f2f' ? 'border-red-600 bg-red-600 text-white' : 'border-red-200 bg-red-50 text-red-600'}`}>
                    Red (Machine Scan)
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={generateAndDownloadPDF}
              disabled={isProcessing}
              className={`w-full mt-8 py-4 rounded-xl font-black text-xl shadow-xl transition-transform ${isProcessing ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.02]'}`}
            >
              {isProcessing ? 'Generating PDF...' : 'Download A4 OMR PDF 📥'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <div className="lg:col-span-7 bg-slate-100 rounded-3xl border border-slate-200 p-6 flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-4">
            <h3 className="font-bold text-xl text-slate-800">Live A4 Preview</h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
              Print Ready
            </span>
          </div>

          <div className="bg-white p-2 rounded shadow-lg border border-slate-300 overflow-hidden w-full flex justify-center">
            {/* Hidden High-Res Canvas for PDF */}
            <canvas ref={canvasRef} width={A4_W} height={A4_H} className="hidden" />
            
            {/* Display Canvas (Scaled down for UI) */}
            <canvas 
              width={A4_W} 
              height={A4_H} 
              className="w-full h-auto max-w-lg object-contain bg-white border border-slate-100"
              style={{
                // We draw to the hidden canvas, and use a separate ref or trick to show it.
                // For simplicity, we just use the same canvas ref but scale it with CSS.
              }}
              ref={(el) => {
                // Point the main ref to this visible canvas instead so we draw directly to it, but CSS handles scaling.
                canvasRef.current = el;
                // Trigger initial draw
                if (el && !isProcessing) setTimeout(drawOMR, 50);
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}