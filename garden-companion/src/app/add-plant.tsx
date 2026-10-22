import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { matchScientificName, searchCatalogue } from '@/domain/catalogue-search';
import type { PlantProfile } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';
import {
  identifyPlant,
  isIdentificationConfigured,
  type IdentificationCandidate,
} from '@/services/plant-identification';
import { createPlantId, useGarden } from '@/state/garden-store';

interface Selection {
  name: string;
  scientificName?: string;
  profile?: PlantProfile;
}

export default function AddPlantScreen() {
  const { dispatch } = useGarden();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selection, setSelection] = useState<Selection | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [candidates, setCandidates] = useState<IdentificationCandidate[] | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = selection ? [] : searchCatalogue(query);
  const inputStyle = [styles.input, { color: theme.text, backgroundColor: theme.background }];

  async function pickPhoto(source: 'camera' | 'library') {
    setError(null);
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permission is needed to use photos for identification.');
      return;
    }

    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPhotoUri(uri);
    setSelection(null);
    setCandidates(null);
    if (!isIdentificationConfigured()) {
      setError('Photo saved. Identification is not set up yet, so please type the plant name.');
      return;
    }

    setIdentifying(true);
    try {
      const found = await identifyPlant(uri);
      setCandidates(found);
      if (!found.length) setError('No match found. Try a closer photo of a leaf or flower.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Identification failed.');
    } finally {
      setIdentifying(false);
    }
  }

  function chooseCandidate(candidate: IdentificationCandidate) {
    const profile = matchScientificName(candidate.scientificName);
    setSelection({
      name: profile?.commonName ?? candidate.commonNames[0] ?? candidate.scientificName,
      scientificName: candidate.scientificName,
      profile,
    });
    setCandidates(null);
  }

  function save() {
    if (!selection) return;
    dispatch({
      type: 'add-plant',
      plant: {
        id: createPlantId(),
        profileId: selection.profile?.id,
        name: selection.name,
        scientificName: selection.scientificName ?? selection.profile?.scientificName,
        location: location.trim() || undefined,
        photoUri,
        addedAt: new Date().toISOString(),
      },
    });
    if (router.canGoBack()) router.back();
    else router.replace('/garden');
  }

  return (
    <Screen withTabInset={false}>
      <Card>
        <ThemedText type="smallBold">Identify from a photo</ThemedText>
        <View style={styles.buttonRow}>
          <Button
            label="Take photo"
            variant="secondary"
            style={styles.flex}
            onPress={() => pickPhoto('camera')}
          />
          <Button
            label="Choose photo"
            variant="secondary"
            style={styles.flex}
            onPress={() => pickPhoto('library')}
          />
        </View>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />}
        {identifying && <ThemedText type="small">Identifying…</ThemedText>}
        {candidates?.map((candidate) => (
          <Pressable
            key={candidate.scientificName}
            style={styles.option}
            onPress={() => chooseCandidate(candidate)}>
            <ThemedText type="smallBold">
              {candidate.commonNames[0] ?? candidate.scientificName}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {candidate.scientificName} · {Math.round(candidate.score * 100)}% match
            </ThemedText>
          </Pressable>
        ))}
        {error && (
          <ThemedText type="small" themeColor="textSecondary">
            {error}
          </ThemedText>
        )}
      </Card>

      <Card>
        <ThemedText type="smallBold">Or type its name</ThemedText>
        {selection ? (
          <View style={styles.selected}>
            <View style={styles.flex}>
              <ThemedText type="smallBold">{selection.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {selection.profile
                  ? 'Care calendar available'
                  : 'Not in our catalogue yet — no tasks will be generated'}
              </ThemedText>
            </View>
            <Button label="Change" variant="secondary" onPress={() => setSelection(null)} />
          </View>
        ) : (
          <>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="e.g. tomato, rose, lavender"
              placeholderTextColor={theme.textSecondary}
              autoCorrect={false}
              style={inputStyle}
            />
            {results.map((profile) => (
              <Pressable
                key={profile.id}
                style={styles.option}
                onPress={() =>
                  setSelection({
                    name: profile.commonName,
                    scientificName: profile.scientificName,
                    profile,
                  })
                }>
                <ThemedText type="smallBold">{profile.commonName}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {profile.scientificName}
                </ThemedText>
              </Pressable>
            ))}
            {query.trim() && !results.length && (
              <Button
                label={`Add "${query.trim()}" without a care calendar`}
                variant="secondary"
                onPress={() => setSelection({ name: query.trim() })}
              />
            )}
          </>
        )}
      </Card>

      <Card>
        <ThemedText type="smallBold">Where is it? (optional)</ThemedText>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Raised bed 2, front border"
          placeholderTextColor={theme.textSecondary}
          style={inputStyle}
        />
      </Card>

      <Button label="Add to my garden" disabled={!selection} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.two,
  },
  option: {
    paddingVertical: Spacing.two,
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    minHeight: 44,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
