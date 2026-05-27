import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_AUTH_BASE_URL
const supabaseKey = import.meta.env.VITE_AUTH_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_AUTH_BASE_URL or VITE_AUTH_PUBLISHABLE_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
