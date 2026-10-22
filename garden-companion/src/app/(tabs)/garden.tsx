import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getProfile } from '@/data/plant-catalogue';
import type { GardenArea, GardenPlant } from '@/domain/types';
import { useGarden } from '@/state/garden-store';

const AREA_TITLES: Record<GardenArea | 'other', string> = {
  vegetable: 'Vegetable patch',
  flower: 'Flower garden',
  other: 'Other plants',
};

export default function GardenScreen() {
  const { state } = useGarden();

  const groups = new Map<GardenArea | 'other', GardenPlant[]>();
  for (const plant of state.plants) {
    const area = getProfile(plant.profileId)?.area ?? 'other';
    groups.set(area, [...(groups.get(area) ?? []), plant]);
  }

  return (
    <Screen
      title="My garden"
      subtitle={`${state.plants.length} ${state.plants.length === 1 ? 'plant' : 'plants'}`}>
      <Button label="Add a plant" onPress={() => router.push('/add-plant')} />

      {(['vegetable', 'flower', 'other'] as const).map((area) => {
        const plants = groups.get(area);
        if (!plants?.length) return null;
        return (
          <Card key={area}>
            <ThemedText type="smallBold">{AREA_TITLES[area]}</ThemedText>
            {plants.map((plant) => (
              <PlantRow key={plant.id} plant={plant} />
            ))}
          </Card>
        );
      })}
    </Screen>
  );
}

function PlantRow({ plant }: { plant: GardenPlant }) {
  return (
    <Link href={{ pathname: '/plant/[id]', params: { id: plant.id } }} asChild>
      <Pressable style={styles.row}>
        {plant.photoUri ? (
          <Image source={{ uri: plant.photoUri }} style={styles.thumb} />
        ) : (
          <ThemedView type="backgroundSelected" style={styles.thumb} />
        )}
        <View style={styles.rowText}>
          <ThemedText type="smallBold">{plant.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {[plant.scientificName, plant.location].filter(Boolean).join(' · ') ||
              'No care profile yet'}
          </ThemedText>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: Spacing.two,
  },
  rowText: {
    flex: 1,
  },
});
