import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ydwvetclffnhwiuwdgzu.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkd3ZldGNsZmZuaHdpdXdkZ3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTkwNTIsImV4cCI6MjA4OTMzNTA1Mn0.BjCOT6ZjG1OaK-K_ko1WWWMcz_tY-nn8WN_Xrnor4q8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)