import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const { room_pin } = await req.json();
  // Self-Destruct Protocol: Delete all messages for this PIN
  await supabase.from('secret_chat_room').delete().eq('room_pin', room_pin);
  return NextResponse.json({ destroyed: true });
}