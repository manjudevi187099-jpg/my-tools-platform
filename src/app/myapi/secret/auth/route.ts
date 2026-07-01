import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; 

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json();
    const cleanUser = username.toLowerCase().trim().replace(/[^a-z0-9]/g, ''); 

    if (!cleanUser || !pin) {
      return NextResponse.json({ success: false, error: 'Username aur PIN zaroori hai!' }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from('message_users')
      .select('*')
      .eq('username', cleanUser)
      .single();

    if (existingUser) {
      if (existingUser.pin === pin) {
        return NextResponse.json({ success: true, message: 'Login successful', username: cleanUser });
      } else {
        return NextResponse.json({ success: false, error: 'Username already taken or Incorrect PIN! 🚫' }, { status: 401 });
      }
    } else {
      const { error } = await supabase.from('message_users').insert([{ username: cleanUser, pin }]);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Account created & Link Generated! 🎉', username: cleanUser });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}