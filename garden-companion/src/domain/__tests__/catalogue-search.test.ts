import { describe, expect, it } from '@jest/globals';

import { PLANT_CATALOGUE } from '@/data/plant-catalogue';

import { matchScientificName, searchCatalogue } from '../catalogue-search';

describe('searchCatalogue', () => {
  it('finds plants by common name, alias and scientific name', () => {
    expect(searchCatalogue('tom')[0].id).toBe('tomato');
    expect(searchCatalogue('zucchini')[0].id).toBe('courgette');
    expect(searchCatalogue('lavandula')[0].id).toBe('lavender');
  });

  it('ranks exact matches first', () => {
    expect(searchCatalogue('marigold')[0].id).toBe('french-marigold');
  });

  it('returns nothing for an empty query', () => {
    expect(searchCatalogue('  ')).toEqual([]);
  });
});

describe('matchScientificName', () => {
  it('matches on species', () => {
    expect(matchScientificName('Solanum lycopersicum')?.id).toBe('tomato');
    expect(matchScientificName('Solanum tuberosum')?.id).toBe('potato');
  });

  it('handles hybrid markers', () => {
    expect(matchScientificName('Fragaria x ananassa')?.id).toBe('strawberry');
    expect(matchScientificName('Fragaria × ananassa')?.id).toBe('strawberry');
  });

  it('falls back to genus-level profiles', () => {
    expect(matchScientificName('Rosa canina')?.id).toBe('rose');
    expect(matchScientificName('Dahlia pinnata')?.id).toBe('dahlia');
  });

  it('does not match an unrelated species in the same genus', () => {
    expect(matchScientificName('Solanum melongena')).toBeUndefined();
  });
});

describe('catalogue', () => {
  it('has unique ids and valid months', () => {
    const ids = PLANT_CATALOGUE.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const profile of PLANT_CATALOGUE) {
      for (const window of profile.care) {
        expect(window.months.length).toBeGreaterThan(0);
        window.months.forEach((m) => expect(m >= 1 && m <= 12).toBe(true));
      }
    }
  });
});
