import { PLANT_CATALOGUE } from '@/data/plant-catalogue';

import { addMonths, toCatalogueMonth } from './seasons';
import type {
  CareActivity,
  GardenArea,
  GardenPlant,
  Hemisphere,
  Month,
  PlantProfile,
} from './types';

const STARTING_ACTIVITIES: CareActivity[] = ['sow-indoors', 'sow-outdoors', 'plant-out'];

export interface PlantSuggestion {
  profile: PlantProfile;
  /** How the plant can be started now, e.g. sown under cover or planted out. */
  activities: CareActivity[];
  /** True when the plant can be started this month rather than next month. */
  startNow: boolean;
  alreadyGrowing: boolean;
}

function startingActivities(profile: PlantProfile, catalogueMonth: Month): CareActivity[] {
  return profile.care
    .filter((w) => STARTING_ACTIVITIES.includes(w.activity) && w.months.includes(catalogueMonth))
    .map((w) => w.activity);
}

/**
 * Suggests plants for an area of the garden that can be sown or planted this
 * month or next. Plants that can be started now, and that are not already in
 * the garden, are listed first.
 */
export function suggestPlants(
  area: GardenArea,
  date: Date,
  hemisphere: Hemisphere,
  garden: GardenPlant[],
): PlantSuggestion[] {
  const month = (date.getMonth() + 1) as Month;
  const thisMonth = toCatalogueMonth(month, hemisphere);
  const nextMonth = toCatalogueMonth(addMonths(month, 1), hemisphere);
  const growing = new Set(garden.map((p) => p.profileId));

  const suggestions: PlantSuggestion[] = [];
  for (const profile of PLANT_CATALOGUE) {
    if (profile.area !== area) continue;
    const now = startingActivities(profile, thisMonth);
    const soon = now.length ? now : startingActivities(profile, nextMonth);
    if (!soon.length) continue;
    suggestions.push({
      profile,
      activities: soon,
      startNow: now.length > 0,
      alreadyGrowing: growing.has(profile.id),
    });
  }

  return suggestions.sort(
    (a, b) =>
      Number(b.startNow) - Number(a.startNow) ||
      Number(a.alreadyGrowing) - Number(b.alreadyGrowing) ||
      a.profile.commonName.localeCompare(b.profile.commonName),
  );
}
