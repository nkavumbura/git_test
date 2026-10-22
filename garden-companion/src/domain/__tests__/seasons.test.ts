import { describe, expect, it } from '@jest/globals';

import { addMonths, toCatalogueMonth } from '../seasons';

describe('seasons', () => {
  it('wraps months around the year', () => {
    expect(addMonths(12, 1)).toBe(1);
    expect(addMonths(1, -1)).toBe(12);
    expect(addMonths(3, 6)).toBe(9);
  });

  it('shifts Southern Hemisphere months by six', () => {
    expect(toCatalogueMonth(10, 'northern')).toBe(10);
    expect(toCatalogueMonth(10, 'southern')).toBe(4);
    expect(toCatalogueMonth(3, 'southern')).toBe(9);
  });
});
