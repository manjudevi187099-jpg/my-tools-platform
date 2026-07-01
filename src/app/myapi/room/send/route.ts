import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    // 🔥 ADDED 'sender' to the DB insertion
    const { room_pin, message, sender } = await req.json();
    
    const { error } = await supabase.from('secret_chat_room').insert([{ room_pin, message, sender }]);
    
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}