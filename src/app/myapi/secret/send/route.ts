import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; 

export async function POST(request: Request) {
  try {
    const { username, message } = await request.json();
    const cleanUser = username.toLowerCase().trim();

    if (!cleanUser || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message cannot be empty!' }, { status: 400 });
    }

    // 🔥 SAFE CHECK: Hum array length check kar rahe hain taaki Supabase internally crash na ho
    const { data: users, error: fetchError } = await supabase
      .from('message_users')
      .select('username')
      .eq('username', cleanUser);
    
    if (fetchError || !users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found! Link is invalid.' }, { status: 404 });
    }

    // Insert the anonymous message
    const { error: insertError } = await supabase
      .from('secret_messages')
      .insert([{ username: cleanUser, message }]);
      
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, message: 'Message sent anonymously! 🤫' });

  } catch (error: any) {
    // Agar DB ka koi deep error aata hai, toh usko handle karenge
    return NextResponse.json({ success: false, error: "Database Sync Error. Please try again!" }, { status: 500 });
  }
}