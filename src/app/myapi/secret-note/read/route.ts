import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabase client initialize
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Yeh route ab cache nahi hoga aur latest messages laayega
export async function POST(req: Request) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('secret_chat_room')
      .select('*')
      .eq('room_pin', pin)
      .order('created_at', { ascending: true }); // Purane messages pehle, naye baad mein

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { messages: data || [] }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', // Yeh line caching rok degi!
        }
      }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}