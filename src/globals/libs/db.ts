import Dexie, { type EntityTable } from 'dexie';
import type { Score } from '@/globals/types/simon';
import { createClient } from '@supabase/supabase-js'
import type { Database } from "database.types"

export class SimonDatabase extends Dexie {
  scores!: EntityTable<Score, 'id'>;

  constructor() {
    super("SimonGameDB");
    
    this.version(1).stores({
      scores: '++id, score, level, mode, achievedAt'
    });
  }
}

export const db = new SimonDatabase();

const API_URL = import.meta.env.VITE_SUPABASE_URL
const PUB_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient<Database>(API_URL, PUB_KEY);