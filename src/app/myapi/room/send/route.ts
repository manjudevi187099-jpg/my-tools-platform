import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const { room_pin, message } = await req.json();
  await supabase.from('secret_chat_room').insert([{ room_pin, message }]);
  return NextResponse.json({ success: true });
}