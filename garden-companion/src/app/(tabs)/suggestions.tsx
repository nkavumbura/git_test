import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { addMonths, monthName, monthOf } from '@/domain/seasons';
import { suggestPlants, type PlantSuggestion } from '@/domain/suggestions';
import { activityLabel } from '@/domain/tasks';
import type { GardenArea } from '@/domain/types';
import { createPlantId, useGarden } from '@/state/garden-store';

export default function SuggestionsScreen() {
  const { state, dispatch } = useGarden();
  const [area, setArea] = useState<GardenArea>('vegetable');
  const { hemisphere } = state.settings;
  const month = monthOf(new Date());

  const suggestions = useMemo(
    () => (hemisphere ? suggestPlants(area, new Date(), hemisphere, state.plants) : []),
    [area, hemisphere, state.plants],
  );

  const addToGarden = (suggestion: PlantSuggestion) =>
    dispatch({
      type: 'add-plant',
      plant: {
        id: createPlantId(),
        profileId: suggestion.profile.id,
        name: suggestion.profile.commonName,
        scientificName: suggestion.profile.scientificName,
        addedAt: new Date().toISOString(),
      },
    });

  return (
    <Screen
      title="What to grow"
      subtitle={`Plants you can start in ${monthName(month)} or ${monthName(addMonths(month, 1))}`}>
      <SegmentedControl
        options={[
          { value: 'vegetable', label: 'Vegetable patch' },
          { value: 'flower', label: 'Flower garden' },
        ]}
        value={area}
        onChange={setArea}
      />

      {!hemisphere && (
        <ThemedText themeColor="textSecondary">
          Choose your hemisphere in Settings to see suggestions for your season.
        </ThemedText>
      )}

      {hemisphere && !suggestions.length && (
        <ThemedText themeColor="textSecondary">
          Nothing in the catalogue can be started right now. Check back next month.
        </ThemedText>
      )}

      {suggestions.map((suggestion) => (
        <Card key={suggestion.profile.id}>
          <View style={styles.titleRow}>
            <View style={styles.title}>
              <ThemedText type="smallBold">{suggestion.profile.commonName}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.italic}>
                {suggestion.profile.scientificName}
              </ThemedText>
            </View>
            <ThemedText type="small" themeColor="accent">
              {suggestion.startNow ? 'Start now' : 'Next month'}
            </ThemedText>
          </View>
          <ThemedText type="small">{suggestion.profile.description}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {suggestion.activities.map(activityLabel).join(' or ')}
          </ThemedText>
          {suggestion.alreadyGrowing ? (
            <ThemedText type="small" themeColor="textSecondary">
              Already in your garden
            </ThemedText>
          ) : (
            <Button
              label="Add to my garden"
              variant="secondary"
              onPress={() => addToGarden(suggestion)}
            />
          )}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
  italic: {
    fontStyle: 'italic',
  },
});
