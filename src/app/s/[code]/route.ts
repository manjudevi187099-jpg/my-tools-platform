import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = params.code;

  try {
    // 1. Supabase database se original link dhoondho
    const { data, error } = await supabase
      .from('short_urls')
      .select('*')
      .eq('short_code', code)
      .single();

    // Agar link database mein nahi mila, toh Home page par bhej do
    if (error || !data) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 2. Click count ko +1 badhao (Direct update method)
    await supabase
      .from('short_urls')
      .update({ clicks: data.clicks + 1 })
      .eq('id', data.id);

    // 3. User ko Original (Lambe) URL par redirect kar do
    return NextResponse.redirect(data.long_url);
    
  } catch (err) {
    // Agar koi achanak error aaye, tab bhi website crash na ho
    return NextResponse.redirect(new URL('/', req.url));
  }
}