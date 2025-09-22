// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('Supabase URL and/or Anon Key are missing. Make sure to set them in your .env file.')
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabase = null; // Set to null to avoid breaking imports
