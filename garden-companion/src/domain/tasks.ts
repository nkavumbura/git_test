import { getProfile } from '@/data/plant-catalogue';

import { addMonths, toCatalogueMonth } from './seasons';
import type { CareActivity, GardenPlant, GardenTask, Hemisphere, Month } from './types';

const ACTIVITY_LABELS: Record<CareActivity, string> = {
  'sow-indoors': 'Sow under cover',
  'sow-outdoors': 'Sow outdoors',
  'plant-out': 'Plant out',
  support: 'Support',
  feed: 'Feed',
  water: 'Water',
  prune: 'Prune',
  deadhead: 'Deadhead',
  mulch: 'Mulch',
  divide: 'Divide',
  protect: 'Protect',
  lift: 'Lift',
  harvest: 'Harvest',
};

export function activityLabel(activity: CareActivity): string {
  return ACTIVITY_LABELS[activity];
}

/**
 * Builds the care tasks due in a given local month for every plant in the
 * garden that has a catalogue profile. Plants in the garden are treated as
 * established, so one-off establishment steps are skipped.
 */
export function tasksForMonth(
  plants: GardenPlant[],
  year: number,
  month: Month,
  hemisphere: Hemisphere,
): GardenTask[] {
  const catalogueMonth = toCatalogueMonth(month, hemisphere);
  const tasks: GardenTask[] = [];

  for (const plant of plants) {
    const profile = getProfile(plant.profileId);
    if (!profile) continue;

    for (const window of profile.care) {
      if (window.establishmentOnly || !window.months.includes(catalogueMonth)) continue;
      tasks.push({
        id: `${plant.id}:${window.activity}:${year}-${month}`,
        plantId: plant.id,
        plantName: plant.name,
        activity: window.activity,
        title: `${activityLabel(window.activity)} ${plant.name.toLowerCase()}`,
        detail: window.note,
        year,
        month,
      });
    }
  }

  return tasks;
}

/** Tasks for the month containing `date` and the month after it. */
export function upcomingTasks(
  plants: GardenPlant[],
  date: Date,
  hemisphere: Hemisphere,
): { current: GardenTask[]; next: GardenTask[] } {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1) as Month;
  const nextMonth = addMonths(month, 1);
  const nextYear = nextMonth === 1 ? year + 1 : year;

  return {
    current: tasksForMonth(plants, year, month, hemisphere),
    next: tasksForMonth(plants, nextYear, nextMonth, hemisphere),
  };
}
