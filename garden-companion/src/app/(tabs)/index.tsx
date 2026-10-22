import { router } from 'expo-router';
import { useMemo } from 'react';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { TaskRow } from '@/components/task-row';
import { ThemedText } from '@/components/themed-text';
import { addMonths, monthName, monthOf } from '@/domain/seasons';
import { upcomingTasks } from '@/domain/tasks';
import { useGarden } from '@/state/garden-store';

export default function TasksScreen() {
  const { state, dispatch } = useGarden();
  const { hemisphere } = state.settings;
  const today = new Date();
  const month = monthOf(today);

  const { current, next } = useMemo(
    () =>
      hemisphere ? upcomingTasks(state.plants, new Date(), hemisphere) : { current: [], next: [] },
    [state.plants, hemisphere],
  );

  if (!hemisphere) {
    return (
      <Screen title="Garden tasks">
        <Card>
          <ThemedText type="smallBold">Tell us where you garden</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Seasonal tasks depend on your hemisphere. Choose it in Settings to get started.
          </ThemedText>
          <Button label="Open settings" onPress={() => router.navigate('/settings')} />
        </Card>
      </Screen>
    );
  }

  if (!state.plants.length) {
    return (
      <Screen title="Garden tasks">
        <Card>
          <ThemedText type="smallBold">Your garden is empty</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Add the plants you grow and we will tell you what each one needs, month by month.
          </ThemedText>
          <Button label="Add your first plant" onPress={() => router.push('/add-plant')} />
        </Card>
      </Screen>
    );
  }

  const done = new Set(state.completedTaskIds);
  const remaining = current.filter((t) => !done.has(t.id)).length;

  return (
    <Screen
      title="Garden tasks"
      subtitle={
        current.length
          ? `${remaining} of ${current.length} tasks left for ${monthName(month)}`
          : `Nothing to do for ${monthName(month)}`
      }>
      {current.length > 0 && (
        <Card>
          <ThemedText type="smallBold">This month — {monthName(month)}</ThemedText>
          {current.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              done={done.has(task.id)}
              onToggle={() => dispatch({ type: 'toggle-task', taskId: task.id })}
            />
          ))}
        </Card>
      )}

      {next.length > 0 && (
        <Card>
          <ThemedText type="smallBold">Coming up in {monthName(addMonths(month, 1))}</ThemedText>
          {next.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </Card>
      )}
    </Screen>
  );
}
