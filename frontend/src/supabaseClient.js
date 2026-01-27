import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mhkdmgxxerkwomzngujg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa2RtZ3h4ZXJrd29tem5ndWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDM0MzQsImV4cCI6MjA1MzQxOTQzNH0.YOUR_FULL_KEY_HERE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)