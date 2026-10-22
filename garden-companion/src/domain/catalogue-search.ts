import { PLANT_CATALOGUE } from '@/data/plant-catalogue';

import type { PlantProfile } from './types';

function normalise(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z\s]/g, ' ')
      // Drop the hybrid marker in names such as "Fragaria x ananassa".
      .replace(/\sx\s/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/** Free-text search across common names, aliases and scientific names. */
export function searchCatalogue(query: string): PlantProfile[] {
  const q = normalise(query);
  if (!q) return [];

  return PLANT_CATALOGUE.map((profile) => {
    const names = [profile.commonName, ...(profile.aliases ?? [])].map(normalise);
    const scientific = normalise(profile.scientificName);
    let score = 0;
    if (names.some((n) => n === q)) score = 3;
    else if (names.some((n) => n.startsWith(q))) score = 2;
    else if (names.some((n) => n.includes(q)) || scientific.includes(q)) score = 1;
    return { profile, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.profile.commonName.localeCompare(b.profile.commonName))
    .map((r) => r.profile);
}

/**
 * Finds the catalogue profile for a scientific name returned by plant
 * identification. Matches on species first, then on genus for profiles that
 * are defined at genus level (e.g. "Rosa", "Dahlia").
 */
export function matchScientificName(scientificName: string): PlantProfile | undefined {
  const [genus, species] = normalise(scientificName).split(' ');
  if (!genus) return undefined;

  const bySpecies = PLANT_CATALOGUE.find((p) => {
    const [g, s] = normalise(p.scientificName).split(' ');
    return g === genus && s !== undefined && s === species;
  });
  if (bySpecies) return bySpecies;

  return PLANT_CATALOGUE.find((p) => normalise(p.scientificName) === genus);
}
