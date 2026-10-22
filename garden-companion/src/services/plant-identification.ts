import { Platform } from 'react-native';

/**
 * Photo-based plant identification using the Pl@ntNet API
 * (https://my.plantnet.org). Requires a free API key in
 * EXPO_PUBLIC_PLANTNET_API_KEY.
 *
 * Note: EXPO_PUBLIC_ variables are embedded in the app bundle. Before a public
 * release the request should go through a small backend that holds the key.
 */

const PLANTNET_ENDPOINT = 'https://my-api.plantnet.org/v2/identify/all';

export interface IdentificationCandidate {
  scientificName: string;
  commonNames: string[];
  /** Confidence between 0 and 1. */
  score: number;
}

export class PlantIdentificationError extends Error {}

export function isIdentificationConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_PLANTNET_API_KEY);
}

interface PlantNetResponse {
  results?: {
    score?: number;
    species?: {
      scientificNameWithoutAuthor?: string;
      commonNames?: string[];
    };
  }[];
}

export function parsePlantNetResponse(body: PlantNetResponse): IdentificationCandidate[] {
  return (body.results ?? [])
    .filter((r) => r.species?.scientificNameWithoutAuthor)
    .map((r) => ({
      scientificName: r.species!.scientificNameWithoutAuthor!,
      commonNames: r.species!.commonNames ?? [],
      score: r.score ?? 0,
    }));
}

export async function identifyPlant(imageUri: string): Promise<IdentificationCandidate[]> {
  const apiKey = process.env.EXPO_PUBLIC_PLANTNET_API_KEY;
  if (!apiKey) {
    throw new PlantIdentificationError(
      'Photo identification is not set up yet. Add a Pl@ntNet API key to enable it.',
    );
  }

  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(imageUri)).blob();
    form.append('images', blob, 'plant.jpg');
  } else {
    // React Native's FormData accepts a file descriptor object.
    form.append('images', {
      uri: imageUri,
      name: 'plant.jpg',
      type: 'image/jpeg',
    } as unknown as Blob);
  }
  form.append('organs', 'auto');

  const url = `${PLANTNET_ENDPOINT}?api-key=${encodeURIComponent(apiKey)}&nb-results=5&lang=en`;
  const response = await fetch(url, { method: 'POST', body: form });

  if (response.status === 404) {
    // Treated as "no species recognised"; confirm against a live key.
    return [];
  }
  if (!response.ok) {
    throw new PlantIdentificationError(`Identification failed (HTTP ${response.status}).`);
  }
  return parsePlantNetResponse(await response.json());
}
