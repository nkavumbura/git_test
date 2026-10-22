import { describe, expect, it } from '@jest/globals';

import { tasksForMonth, upcomingTasks } from '../tasks';
import type { GardenPlant } from '../types';

const tomato: GardenPlant = {
  id: 'p1',
  profileId: 'tomato',
  name: 'Tomato',
  addedAt: '2026-01-01',
};
const mystery: GardenPlant = { id: 'p2', name: 'Mystery shrub', addedAt: '2026-01-01' };

describe('tasksForMonth', () => {
  it('creates tasks from the care calendar for the month', () => {
    const tasks = tasksForMonth([tomato], 2026, 3, 'northern');
    expect(tasks.map((t) => t.activity)).toEqual(['sow-indoors']);
    expect(tasks[0].id).toBe('p1:sow-indoors:2026-3');
    expect(tasks[0].title).toBe('Sow under cover tomato');
  });

  it('uses the opposite season in the Southern Hemisphere', () => {
    // September in the south corresponds to March in the catalogue.
    const tasks = tasksForMonth([tomato], 2026, 9, 'southern');
    expect(tasks.map((t) => t.activity)).toEqual(['sow-indoors']);
  });

  it('skips one-off establishment steps for plants already in the garden', () => {
    const peony: GardenPlant = {
      id: 'p3',
      profileId: 'peony',
      name: 'Peony',
      addedAt: '2026-01-01',
    };
    expect(tasksForMonth([peony], 2026, 10, 'northern').map((t) => t.activity)).toEqual(['prune']);
  });

  it('skips plants without a care profile', () => {
    expect(tasksForMonth([mystery], 2026, 6, 'northern')).toEqual([]);
  });
});

describe('upcomingTasks', () => {
  it('rolls next month over into the new year', () => {
    const { next } = upcomingTasks(
      [{ ...tomato, profileId: 'kale' }],
      new Date(2026, 11, 15),
      'northern',
    );
    expect(next.every((t) => t.year === 2027 && t.month === 1)).toBe(true);
    expect(next.map((t) => t.activity)).toEqual(['harvest']);
  });
});
