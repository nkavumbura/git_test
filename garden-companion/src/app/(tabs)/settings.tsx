import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { SegmentedControl } from '@/components/segmented-control';
import { ThemedText } from '@/components/themed-text';
import type { Hemisphere } from '@/domain/types';
import { isIdentificationConfigured } from '@/services/plant-identification';
import { useGarden } from '@/state/garden-store';

export default function SettingsScreen() {
  const { state, dispatch } = useGarden();

  return (
    <Screen title="Settings">
      <Card>
        <ThemedText type="smallBold">Hemisphere</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Used to line up sowing, pruning and harvest times with your seasons.
        </ThemedText>
        <SegmentedControl<Hemisphere>
          options={[
            { value: 'northern', label: 'Northern' },
            { value: 'southern', label: 'Southern' },
          ]}
          value={state.settings.hemisphere}
          onChange={(hemisphere) => dispatch({ type: 'update-settings', settings: { hemisphere } })}
        />
      </Card>

      <Card>
        <ThemedText type="smallBold">Photo identification</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {isIdentificationConfigured()
            ? 'Enabled, powered by Pl@ntNet.'
            : 'Not configured. Set EXPO_PUBLIC_PLANTNET_API_KEY to enable identifying plants from photos.'}
        </ThemedText>
      </Card>

      <Card>
        <ThemedText type="smallBold">About the care calendar</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Timings are general guidance for a temperate climate. Local weather, frost dates and
          microclimates vary, so adjust to what you see in your own garden.
        </ThemedText>
      </Card>
    </Screen>
  );
}
