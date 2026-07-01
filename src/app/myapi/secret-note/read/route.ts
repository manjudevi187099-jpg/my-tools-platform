import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const { code } = await req.json();

  // 1. Fetch message
  const { data, error } = await supabase.from('secret_notes').select('*').eq('code', code).maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Message has been destroyed or does not exist.' }, { status: 404 });
  }

  // 2. BOOM! Destroy the message immediately after fetching
  await supabase.from('secret_notes').delete().eq('id', data.id);

  // 3. Send message back to user
  return NextResponse.json({ message: data.message });
}