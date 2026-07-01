import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    const { room_pin } = await req.json();

    if (!room_pin) {
      return NextResponse.json({ error: 'Room PIN is required' }, { status: 400 });
    }

    // Delete all messages from that specific room
    const { error } = await supabase.from('secret_chat_room').delete().eq('room_pin', room_pin);
    
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Room Nuked! 💥' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}