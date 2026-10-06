import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configured = Boolean(SUPABASE_URL && SUPABASE_KEY)

export const supabase = createClient(SUPABASE_URL || 'http://localhost', SUPABASE_KEY || 'missing')

export const STATUSES = ['Pending', 'In Progress', 'Completed']
export const PRIORITIES = ['Low', 'Medium', 'High']
