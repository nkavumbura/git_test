import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getProfile } from '@/data/plant-catalogue';
import { MONTH_NAMES, toCatalogueMonth } from '@/domain/seasons';
import { activityLabel } from '@/domain/tasks';
import type { Month } from '@/domain/types';
import { useGarden } from '@/state/garden-store';

export default function PlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useGarden();
  const plant = state.plants.find((p) => p.id === id);
  const profile = getProfile(plant?.profileId);
  const hemisphere = state.settings.hemisphere ?? 'northern';

  if (!plant) {
    return (
      <Screen withTabInset={false}>
        <ThemedText>This plant is no longer in your garden.</ThemedText>
      </Screen>
    );
  }

  function remove() {
    const doRemove = () => {
      dispatch({ type: 'remove-plant', plantId: plant!.id });
      router.back();
    };
    if (Platform.OS === 'web') {
      doRemove();
      return;
    }
    Alert.alert('Remove plant', `Remove ${plant!.name} from your garden?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: doRemove },
    ]);
  }

  /** Local months (1–12) in which the catalogue month falls for this hemisphere. */
  const localMonths = (months: Month[]) =>
    MONTH_NAMES.filter((_, i) => months.includes(toCatalogueMonth((i + 1) as Month, hemisphere)))
      .map((m) => m.slice(0, 3))
      .join(', ');

  return (
    <Screen withTabInset={false}>
      <Stack.Screen options={{ title: plant.name }} />
      {plant.photoUri && (
        <Image source={{ uri: plant.photoUri }} style={styles.photo} contentFit="cover" />
      )}

      <View>
        <ThemedText type="subtitle">{plant.name}</ThemedText>
        {plant.scientificName && (
          <ThemedText themeColor="textSecondary" style={styles.italic}>
            {plant.scientificName}
          </ThemedText>
        )}
        {plant.location && <ThemedText themeColor="textSecondary">{plant.location}</ThemedText>}
      </View>

      {profile ? (
        <>
          <ThemedText>{profile.description}</ThemedText>
          <Card>
            <ThemedText type="smallBold">Care calendar</ThemedText>
            {profile.care.map((window) => (
              <View key={window.activity} style={styles.careRow}>
                <ThemedText type="smallBold">
                  {activityLabel(window.activity)} · {localMonths(window.months)}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {window.note}
                </ThemedText>
              </View>
            ))}
          </Card>
        </>
      ) : (
        <Card>
          <ThemedText type="small" themeColor="textSecondary">
            We don&apos;t have a care calendar for this plant yet, so no tasks will be generated for
            it.
          </ThemedText>
        </Card>
      )}

      <Button label="Remove from garden" variant="secondary" onPress={remove} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.three,
  },
  italic: {
    fontStyle: 'italic',
  },
  careRow: {
    gap: Spacing.half,
    paddingVertical: Spacing.one,
  },
});
