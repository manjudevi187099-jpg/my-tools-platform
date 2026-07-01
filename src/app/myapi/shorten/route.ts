import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const { longUrl, mobile } = await req.json();
  const shortCode = Math.random().toString(36).substring(2, 8); // Generate 6 digit random code

  const { data, error } = await supabase
    .from('short_urls')
    .insert([{ long_url: longUrl, short_code: shortCode, mobile: mobile }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ shortCode });
}