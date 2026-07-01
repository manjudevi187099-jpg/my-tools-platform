import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const code = params.code;

    const { data, error } = await supabase.from('short_urls').select('*').eq('short_code', code).maybeSingle();

    if (error || !data) return NextResponse.redirect(new URL('/', req.url));

    // Expiry Check Logic (Agar link expire ho gaya hai, toh home par bhej do)
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/?error=LinkExpired', req.url));
    }

    // Fire & Forget: Background mein click badhao (Iska wait nahi karna hai, isliye speed tez hogi)
    supabase.from('short_urls').update({ clicks: data.clicks + 1 }).eq('id', data.id).then();

    // User ko turant Redirect karo!
    return NextResponse.redirect(new URL(data.long_url));
    
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url));
  }
}