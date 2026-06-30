import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = params.code;

  // Find the URL
  const { data } = await supabase.from('short_urls').select('*').eq('short_code', code).single();
  
  if (!data) {
    return NextResponse.redirect(new URL('/', req.url)); // If invalid, send to home
  }

  // Increment Click Count
  await supabase.rpc('increment_clicks', { row_id: data.id }); 
  // Backup if RPC not setup: await supabase.from('short_urls').update({ clicks: data.clicks + 1 }).eq('id', data.id);

  // Redirect to original URL
  return NextResponse.redirect(data.long_url);
}