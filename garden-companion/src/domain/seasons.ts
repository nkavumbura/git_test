import type { Hemisphere, Month } from './types';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function monthOf(date: Date): Month {
  return (date.getMonth() + 1) as Month;
}

export function addMonths(month: Month, offset: number): Month {
  return (((((month - 1 + offset) % 12) + 12) % 12) + 1) as Month;
}

/**
 * Converts a local calendar month into the equivalent Northern Hemisphere
 * month used by the plant catalogue.
 */
export function toCatalogueMonth(month: Month, hemisphere: Hemisphere): Month {
  return hemisphere === 'southern' ? addMonths(month, 6) : month;
}

export function monthName(month: Month): string {
  return MONTH_NAMES[month - 1];
}
