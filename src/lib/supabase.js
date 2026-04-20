import { createClient } from '@supabase/supabase-js';

const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;

const supabaseUrl =
	viteEnv?.VITE_SUPABASE_URL ??
	process.env.NEXT_PUBLIC_SUPABASE_URL ??
	process.env.VITE_SUPABASE_URL;

const supabaseKey =
	viteEnv?.VITE_SUPABASE_ANON_KEY ??
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
	process.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
	supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
