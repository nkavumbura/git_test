import { describe, expect, it } from '@jest/globals';

import { gardenReducer, initialGardenState } from '../garden-store';

describe('gardenReducer', () => {
  it('removes a plant together with its completed tasks', () => {
    let state = gardenReducer(initialGardenState, {
      type: 'add-plant',
      plant: { id: 'a', name: 'Rose', profileId: 'rose', addedAt: '' },
    });
    state = gardenReducer(state, { type: 'toggle-task', taskId: 'a:prune:2026-3' });
    state = gardenReducer(state, { type: 'toggle-task', taskId: 'b:feed:2026-3' });
    state = gardenReducer(state, { type: 'remove-plant', plantId: 'a' });
    expect(state.plants).toEqual([]);
    expect(state.completedTaskIds).toEqual(['b:feed:2026-3']);
  });

  it('toggles a task on and off', () => {
    const on = gardenReducer(initialGardenState, { type: 'toggle-task', taskId: 't' });
    expect(on.completedTaskIds).toEqual(['t']);
    expect(gardenReducer(on, { type: 'toggle-task', taskId: 't' }).completedTaskIds).toEqual([]);
  });
});
