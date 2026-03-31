import Dexie, { type EntityTable } from 'dexie';
import type { Scores } from '@/globals/types/simon';

export class SimonDatabase extends Dexie {
  scores!: EntityTable<Scores, 'id'>;

  constructor() {
    super("SimonGameDB");
    
    this.version(1).stores({
      scores: '++id, score, level, mode, achievedAt'
    });
  }
}

export const db = new SimonDatabase();