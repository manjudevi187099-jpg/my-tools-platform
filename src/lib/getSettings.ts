import { supabase } from './supabase';

export async function getSiteSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) return null;
    return data;
  } catch (error) {
    return null;
  }
}