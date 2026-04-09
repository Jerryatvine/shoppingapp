import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const missingConfig = !url || !key;

export const supabase = missingConfig
  ? null
  : createClient(url, key);
