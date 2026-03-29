import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabaseSecretKey = import.meta.env.VITE_SUPABASE_SECRET_KEY;

// Public client — for regular app usage (respects RLS)
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Admin client — for admin page only (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);
