'use client';

import { useState } from 'react';

export default function MCQGenerator() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const generateMCQs = async () => {
    if (!text.trim()) { alert('Kuch text toh likho bhai!'); return; }
    setLoading(true);
    
    try {
      const res = await fetch('/api/generate-mcq', {
        method: 'POST',
        body: JSON.stringify({ text, count }),
      });
      const data = await res.json();
      setQuizzes(data);
    } catch (e) {
      alert('Error aaya, shayad server busy hai!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">AI MCQ Generator</h1>
      <textarea 
        className="w-full p-4 border rounded mb-4" 
        rows={8} 
        placeholder="Apna chapter ya notes yahan paste karein..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button 
        onClick={generateMCQs}
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700"
      >
        {loading ? 'AI Questions bana raha hai... ⏳' : 'Generate MCQs ✨'}
      </button>

      <div className="mt-8">
        {quizzes.map((q, i) => (
          <div key={i} className="bg-white p-4 mb-4 rounded shadow">
            <p className="font-bold">{i + 1}. {q.question}</p>
            {q.options.map((opt: string, j: number) => (
              <div key={j} className="mt-2 text-gray-700">✔️ {opt}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}