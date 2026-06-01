'use client';
import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';

type QuestionCount = 50 | 100 | 150 | 200;

export default function OMRSheetMaker() {
  const [instituteName, setInstituteName] = useState('YOUR INSTITUTE NAME');
  const [examName, setExamName] = useState('MOCK TEST OMR SHEET');
  const [qCount, setQCount] = useState<QuestionCount>(100);
  const [omrColor, setOmrColor] = useState('#000000'); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const A4_W = 2480;
  const A4_H = 3508;

  const totalPages = Math.ceil(qCount / 100);

  const drawOMRPage = (canvas: HTMLCanvasElement, pageIndex: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_W, A4_H);

    ctx.strokeStyle = omrColor;
    ctx.fillStyle = omrColor;

    // 1. Draw Scanner Timing Marks
    const drawTimingMarks = () => {
      ctx.fillStyle = '#000000'; 
      for (let i = 100; i < A4_H - 100; i += 120) {
        ctx.fillRect(50, i, 40, 20); 
        ctx.fillRect(A4_W - 90, i, 40, 20); 
      }
      ctx.fillStyle = omrColor; 
    };
    drawTimingMarks();

    // 2. Main Border
    ctx.lineWidth = 6;
    // Border ends exactly at Y = A4_H - 100 (3408px)
    ctx.strokeRect(150, 100, A4_W - 300, A4_H - 200);

    // Page Indicator
    if (totalPages > 1) {
      ctx.textAlign = 'right';
      ctx.font = 'bold 30px Arial';
      ctx.fillText(`PAGE ${pageIndex + 1} OF ${totalPages}`, A4_W - 170, 150);
    }

    // 3. Header Section
    ctx.textAlign = 'center';
    ctx.font = 'bold 70px Arial';
    ctx.fillText(instituteName.toUpperCase(), A4_W / 2, 220);
    
    ctx.font = 'bold 45px Arial';
    ctx.fillText(examName.toUpperCase(), A4_W / 2, 290);

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(150, 330);
    ctx.lineTo(A4_W - 150, 330);
    ctx.stroke();

    // 4. Student Info Section
    ctx.textAlign = 'left';
    ctx.font = 'bold 35px Arial';
    
    ctx.fillText("STUDENT NAME:", 200, 400);
    ctx.strokeRect(200, 420, 1100, 70);

    ctx.fillText("BATCH / CLASS:", 200, 540);
    ctx.strokeRect(200, 560, 500, 70);

    ctx.fillText("DATE OF EXAM:", 800, 540);
    ctx.strokeRect(800, 560, 500, 70);

    ctx.fillText("ROLL NUMBER:", 1400, 400);
    ctx.strokeRect(1400, 420, 700, 80);
    for(let i=1; i<10; i++) {
        ctx.beginPath();
        ctx.moveTo(1400 + (i*70), 420);
        ctx.lineTo(1400 + (i*70), 500);
        ctx.stroke();
    }

    ctx.font = '30px Arial';
    ctx.fillText("INSTRUCTIONS:", 1400, 550);
    ctx.font = '25px Arial';
    ctx.fillText("1. Use Black/Blue Ball Point Pen only.", 1400, 590);
    ctx.fillText("2. Darken the circle completely.", 1400, 630);
    ctx.fillText("3. Do not use whitener or eraser.", 1400, 670);

    ctx.beginPath();
    ctx.moveTo(150, 720);
    ctx.lineTo(A4_W - 150, 720);
    ctx.stroke();

    // 🌟 5. EXACT CENTERING LOGIC 🌟
    const startQ = pageIndex * 100;
    const pageQCount = Math.min(100, qCount - startQ); 

    const qPerColumn = 25;
    const numCols = pageQCount > 50 ? 4 : 2; 
    const rowHeight = 80; 
    const bubbleRadius = 22;
    const fontSize = 22;
    
    // FIX: Mathematically locking the grid perfectly in the center (A4 Center is 1240px)
    const gridStartX = numCols === 2 ? 800 : 315; 
    const gridEndX = numCols === 2 ? 1430 : 1915; 
    const gridStartY = 770;
    
    const colSpacing = numCols > 1 ? (gridEndX - gridStartX) / (numCols - 1) : 0;
    const options = ['A', 'B', 'C', 'D'];

    for (let i = 0; i < pageQCount; i++) {
      const col = Math.floor(i / qPerColumn);
      const row = i % qPerColumn;
      
      const startX = gridStartX + (col * colSpacing);
      const startY = gridStartY + (row * rowHeight);

      ctx.font = `bold ${fontSize + 4}px Arial`;
      ctx.textAlign = 'right';
      ctx.fillText(`${startQ + i + 1}.`, startX - 20, startY + (fontSize / 2));

      ctx.textAlign = 'center';
      options.forEach((opt, idx) => {
        const bubblePitch = bubbleRadius * 2 + 15; 
        const bubbleX = startX + 40 + (idx * bubblePitch);
        const bubbleY = startY;
        
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(opt, bubbleX, bubbleY + (fontSize / 2.5));
      });
    }

    // 🌟 6. FIXED BOTTOM SPACING (ANALYSIS & SIGNATURE) 🌟
    
    // Move Analysis Box up safely away from the bottom
    const analysisY = A4_H - 650; 
    ctx.lineWidth = 4;
    ctx.strokeRect(150, analysisY, A4_W - 300, 250); 

    ctx.textAlign = 'center';
    ctx.font = 'bold 35px Arial';
    ctx.fillText("TEST ANALYSIS & SCORE", A4_W / 2, analysisY + 50);

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, analysisY + 70);
    ctx.lineTo(A4_W - 150, analysisY + 70);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 30px Arial';

    // Analysis Rows adjusted for new height
    ctx.fillText("SUBJECT: _________________________________", 200, analysisY + 130);
    ctx.fillText("TOPIC: _________________________________", 1250, analysisY + 130);
    
    ctx.fillText("TOTAL ATTEMPT: ___________", 200, analysisY + 190);
    ctx.fillText("CORRECT: ___________", 850, analysisY + 190);
    ctx.fillText("INCORRECT: ___________", 1500, analysisY + 190);

    ctx.fillText("ANALYZED (WEAK POINTS / AREAS): ____________________________________________________________________", 200, analysisY + 250);

    // FIX: Move Signatures up!
    ctx.textAlign = 'center';
    ctx.font = 'bold 35px Arial';
    
    // Boxes moved up safely above the bottom border
    ctx.strokeRect(300, A4_H - 350, 600, 120);
    // Label moved up so it stays inside the safe zone (Y=3330, Border is 3408)
    ctx.fillText("CANDIDATE SIGNATURE", 600, A4_H - 180);

    ctx.strokeRect(1580, A4_H - 350, 600, 120);
    ctx.fillText("INVIGILATOR SIGNATURE", 1880, A4_H - 180);
  };

  useEffect(() => {
    for (let i = 0; i < totalPages; i++) {
      if (canvasRefs.current[i]) {
        drawOMRPage(canvasRefs.current[i]!, i);
      }
    }
  }, [qCount, omrColor, instituteName, examName, totalPages]);

  const generateAndDownloadPDF = () => {
    setIsProcessing(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfW = doc.internal.pageSize.getWidth();
      const pdfH = doc.internal.pageSize.getHeight();
      
      for (let i = 0; i < totalPages; i++) {
        const canvas = canvasRefs.current[i];
        if (!canvas) continue;

        if (i > 0) doc.addPage(); 

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      }
      
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
        <p className="text-slate-500 mt-2 text-lg">Clean, uncluttered A4 OMR Sheets perfectly aligned for printing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SETTINGS COLUMN */}
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
                  <option value={50}>50 Questions (1 Page)</option>
                  <option value={100}>100 Questions (1 Page)</option>
                  <option value={150}>150 Questions (2 Pages)</option>
                  <option value={200}>200 Questions (2 Pages)</option>
                </select>
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
              {isProcessing ? 'Generating PDF...' : `Download ${totalPages}-Page PDF 📥`}
            </button>
          </div>
        </div>

        {/* PREVIEW COLUMN */}
        <div className="lg:col-span-7 bg-slate-100 rounded-3xl border border-slate-200 p-6 flex flex-col items-center max-h-[800px] overflow-y-auto">
          <div className="flex justify-between items-center w-full mb-4 sticky top-0 bg-slate-100 py-2 z-10">
            <h3 className="font-bold text-xl text-slate-800">Live A4 Preview</h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
              {totalPages} Pages
            </span>
          </div>

          <div className="w-full flex flex-col items-center gap-6 pb-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div key={i} className="w-full flex flex-col items-center">
                <span className="text-xs font-bold text-slate-400 mb-2">PAGE {i + 1}</span>
                <canvas 
                  width={A4_W} 
                  height={A4_H} 
                  className="w-full h-auto max-w-lg object-contain bg-white border shadow-md"
                  ref={(el) => {
                    canvasRefs.current[i] = el;
                    if (el && !isProcessing) setTimeout(() => drawOMRPage(el, i), 50);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}