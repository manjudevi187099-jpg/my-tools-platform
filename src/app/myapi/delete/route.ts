import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function DELETE(req: Request) {
  const { id, mobile } = await req.json();
  // Security check: Delete only if ID and Mobile match
  const { error } = await supabase.from('short_urls').delete().match({ id, mobile });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}