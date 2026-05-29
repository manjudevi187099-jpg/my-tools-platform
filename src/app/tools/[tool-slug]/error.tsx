'use client';

import { useEffect } from 'react';

export default function ToolError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("🚨 Tool Error caught:", error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: '#dc2626' }}>Something went wrong with this tool!</h2>
      <button onClick={() => reset()} style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginTop: '1rem' }}>
        Try Again
      </button>
    </div>
  );
}