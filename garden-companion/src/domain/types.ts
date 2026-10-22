/** Calendar month, 1 = January … 12 = December. */
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Hemisphere = 'northern' | 'southern';

export type GardenArea = 'vegetable' | 'flower';

export type PlantKind = 'annual' | 'biennial' | 'perennial' | 'bulb' | 'shrub';

export type CareActivity =
  | 'sow-indoors'
  | 'sow-outdoors'
  | 'plant-out'
  | 'support'
  | 'feed'
  | 'water'
  | 'prune'
  | 'deadhead'
  | 'mulch'
  | 'divide'
  | 'protect'
  | 'lift'
  | 'harvest';

/**
 * A recurring piece of care a plant needs during particular months.
 * Months are expressed for a temperate Northern Hemisphere climate and are
 * shifted by six months for the Southern Hemisphere.
 */
export interface CareWindow {
  activity: CareActivity;
  months: Month[];
  /** Short, practical instruction shown to the gardener. */
  note: string;
  /**
   * Only relevant when first establishing the plant (e.g. planting a shrub).
   * Used for suggestions but not turned into recurring tasks.
   */
  establishmentOnly?: boolean;
}

/** Reference information about a species or cultivar group. */
export interface PlantProfile {
  id: string;
  commonName: string;
  scientificName: string;
  /** Alternative common names used when searching. */
  aliases?: string[];
  area: GardenArea;
  kind: PlantKind;
  sun: 'full-sun' | 'partial-shade' | 'shade';
  frostHardy: boolean;
  description: string;
  care: CareWindow[];
}

/** A plant the gardener has added to their own garden. */
export interface GardenPlant {
  id: string;
  /** Catalogue profile, when the plant has been matched to one. */
  profileId?: string;
  /** Name shown in the garden; defaults to the profile's common name. */
  name: string;
  scientificName?: string;
  /** Where in the garden the plant is, e.g. "Raised bed 2". */
  location?: string;
  photoUri?: string;
  addedAt: string;
}

export interface GardenTask {
  /** Stable identifier: plant, activity and the year-month it applies to. */
  id: string;
  plantId: string;
  plantName: string;
  activity: CareActivity;
  title: string;
  detail: string;
  year: number;
  month: Month;
}

export interface GardenSettings {
  /** Null until the gardener has chosen; season timings depend on it. */
  hemisphere: Hemisphere | null;
}
