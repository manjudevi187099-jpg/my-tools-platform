import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; 

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json();
    const cleanUser = username.toLowerCase().trim();

    const { data: user } = await supabase.from('message_users').select('pin').eq('username', cleanUser).single();
    
    if (!user || user.pin !== pin) {
      return NextResponse.json({ success: false, error: 'Unauthorized Access! 🛑' }, { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from('secret_messages')
      .select('*')
      .eq('username', cleanUser)
      .order('created_at', { ascending: false }); 

    if (error) throw error;
    return NextResponse.json({ success: true, messages });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}