import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Yahan context: any use kiya hai taaki TypeScript ka koi error na aaye
export async function GET(req: Request, context: any) {
  try {
    // 1. Naye Next.js mein params ko AWAIT karna zaroori hai!
    const params = await context.params;
    const code = params.code;

    // 2. Database se dhoondho (maybeSingle use kiya taaki crash na ho)
    const { data, error } = await supabase
      .from('short_urls')
      .select('*')
      .eq('short_code', code)
      .maybeSingle();

    // Agar link nahi mila, toh chup-chaap Home page par bhej do
    if (error || !data) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // 3. Click Count +1 badhao
    await supabase
      .from('short_urls')
      .update({ clicks: data.clicks + 1 })
      .eq('id', data.id);

    // 4. Safely Original (Lambe) URL par Redirect karo
    return NextResponse.redirect(new URL(data.long_url));
    
  } catch (err) {
    // Failsafe: Agar koi anjaan error aaye toh website home par chali jaye
    return NextResponse.redirect(new URL('/', req.url));
  }
}