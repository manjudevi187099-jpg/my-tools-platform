import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; 

export async function POST(request: Request) {
  try {
    const { username, message } = await request.json();
    const cleanUser = username.toLowerCase().trim();

    if (!cleanUser || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty!' }, { status: 400 });
    }

    // Verify if the username actually exists before sending a message
    const { data: user } = await supabase.from('message_users').select('username').eq('username', cleanUser).single();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found! Link is invalid.' }, { status: 404 });
    }

    // Insert the anonymous message
    const { error } = await supabase.from('secret_messages').insert([{ username: cleanUser, message }]);
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Message sent anonymously! 🤫' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}