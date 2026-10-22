import { describe, expect, it } from '@jest/globals';

import { suggestPlants } from '../suggestions';

describe('suggestPlants', () => {
  it('only suggests plants for the requested area', () => {
    const suggestions = suggestPlants('flower', new Date(2026, 9, 1), 'northern', []);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((s) => s.profile.area === 'flower')).toBe(true);
  });

  it('suggests autumn planting in October in the north', () => {
    const ids = suggestPlants('flower', new Date(2026, 9, 1), 'northern', []).map(
      (s) => s.profile.id,
    );
    expect(ids).toEqual(expect.arrayContaining(['tulip', 'sweet-pea', 'peony']));
    expect(ids).not.toContain('cosmos');
  });

  it('lists start-now plants first and flags plants already grown', () => {
    const suggestions = suggestPlants('vegetable', new Date(2026, 9, 1), 'northern', [
      { id: 'g', profileId: 'garlic', name: 'Garlic', addedAt: '' },
    ]);
    const firstLater = suggestions.findIndex((s) => !s.startNow);
    expect(
      suggestions.slice(0, firstLater === -1 ? undefined : firstLater).every((s) => s.startNow),
    ).toBe(true);
    expect(suggestions.find((s) => s.profile.id === 'garlic')?.alreadyGrowing).toBe(true);
  });

  it('uses spring sowing in October in the south', () => {
    const ids = suggestPlants('vegetable', new Date(2026, 9, 1), 'southern', []).map(
      (s) => s.profile.id,
    );
    expect(ids).toEqual(expect.arrayContaining(['tomato', 'courgette']));
  });
});
