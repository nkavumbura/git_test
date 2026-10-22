import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export function Screen({
  title,
  subtitle,
  children,
  withTabInset = true,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  withTabInset?: boolean;
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: (withTabInset ? BottomTabInset : 0) + Spacing.five },
          ]}
          keyboardShouldPersistTaps="handled">
          {title && (
            <View style={styles.header}>
              <ThemedText type="subtitle">{title}</ThemedText>
              {subtitle && <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>}
            </View>
          )}
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
});
