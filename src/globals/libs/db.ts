import Dexie, { type EntityTable } from 'dexie';
import type { Score } from '@/globals/types/simon';

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