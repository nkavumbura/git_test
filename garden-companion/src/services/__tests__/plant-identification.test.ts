import { describe, expect, it } from '@jest/globals';

import { parsePlantNetResponse } from '../plant-identification';

describe('parsePlantNetResponse', () => {
  it('extracts candidates and ignores incomplete results', () => {
    expect(
      parsePlantNetResponse({
        results: [
          {
            score: 0.82,
            species: {
              scientificNameWithoutAuthor: 'Lavandula angustifolia',
              commonNames: ['English lavender'],
            },
          },
          { score: 0.1, species: {} },
        ],
      }),
    ).toEqual([
      { scientificName: 'Lavandula angustifolia', commonNames: ['English lavender'], score: 0.82 },
    ]);
  });

  it('handles an empty body', () => {
    expect(parsePlantNetResponse({})).toEqual([]);
  });
});
