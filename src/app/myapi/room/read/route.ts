import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 🔥 CACHING KO KHATAM KARNE WALI LINE
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      .order('created_at', { ascending: true }); // Naye messages niche aayenge

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { messages: data || [] }, 
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        }
      }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}