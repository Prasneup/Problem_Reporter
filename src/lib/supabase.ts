import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xjttjhstkcfycwdhvucs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8Twudt0WxwWifOLtgwktww__VSM8f-N';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;
