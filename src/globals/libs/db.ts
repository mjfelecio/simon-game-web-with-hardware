import { createClient } from '@supabase/supabase-js'
import type { Database } from "@/globals/types/database"

const API_URL = import.meta.env.VITE_SUPABASE_URL
const PUB_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient<Database>(API_URL, PUB_KEY);