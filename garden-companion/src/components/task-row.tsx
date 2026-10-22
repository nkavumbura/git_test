import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { GardenTask } from '@/domain/types';
import { useTheme } from '@/hooks/use-theme';

export function TaskRow({
  task,
  done,
  onToggle,
}: {
  task: GardenTask;
  done?: boolean;
  /** Omit for read-only rows, such as upcoming tasks. */
  onToggle?: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole={onToggle ? 'checkbox' : undefined}
      accessibilityState={onToggle ? { checked: done } : undefined}
      disabled={!onToggle}
      onPress={onToggle}
      style={styles.row}>
      {onToggle && (
        <View
          style={[
            styles.checkbox,
            { borderColor: theme.accent, backgroundColor: done ? theme.accent : 'transparent' },
          ]}>
          {done && <ThemedText style={[styles.tick, { color: theme.onAccent }]}>✓</ThemedText>}
        </View>
      )}
      <View style={styles.text}>
        <ThemedText type="smallBold" style={done && styles.doneText}>
          {task.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {task.detail}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tick: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: 700,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  doneText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});
