import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const { message } = await req.json();
  const code = Math.random().toString(36).substring(2, 10); // Generate 8 char code

  const { error } = await supabase.from('secret_notes').insert([{ code, message }]);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code });
}