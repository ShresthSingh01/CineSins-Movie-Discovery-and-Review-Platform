import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Initialize Supabase. 
// Using placeholder strings allows the build to pass even if environment variables are missing.
// Real requests will only work once the USER provides the actual credentials in .env.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
