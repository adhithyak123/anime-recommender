import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mhkdmgxxerkwomzngujg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oa2RtZ3h4ZXJrd29tem5ndWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODI3MDMsImV4cCI6MjA4NTA1ODcwM30.U2fbo4sMvNPsq12EpzmpSQD3oWC2tLYomTtWItlqlfk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)