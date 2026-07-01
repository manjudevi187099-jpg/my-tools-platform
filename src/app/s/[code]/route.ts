import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = params.code;

  try {
    // 1. Database se link dhoondho
    const { data, error } = await supabase
      .from('short_urls')
      .select('*')
      .eq('short_code', code)
      .single();

    // Agar database query mein koi error hai, toh screen par dikhao
    if (error) {
      return NextResponse.json({ message: "Database Error aa gaya", error_details: error });
    }

    // Agar link database mein mila hi nahi, toh screen par batao
    if (!data) {
      return NextResponse.json({ message: "Yeh short code database mein nahi mila", code_searched: code });
    }

    // 2. Click count badhao (Error aaye toh ignore karo taaki redirect na ruke)
    await supabase.from('short_urls').update({ clicks: data.clicks + 1 }).eq('id', data.id);

    // 3. Original Link par Redirect karo (Safely formatted)
    return NextResponse.redirect(new URL(data.long_url));
    
  } catch (err: any) {
    // Agar koi achanak code phate, toh error screen par dikhao
    return NextResponse.json({ message: "Code Crash Error", details: err.message });
  }
}