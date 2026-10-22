import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';

import type { GardenPlant, GardenSettings } from '@/domain/types';

const STORAGE_KEY = 'garden-companion/state/v1';

export interface GardenState {
  loaded: boolean;
  settings: GardenSettings;
  plants: GardenPlant[];
  completedTaskIds: string[];
}

export type GardenAction =
  | { type: 'hydrate'; state: Partial<GardenState> }
  | { type: 'update-settings'; settings: Partial<GardenSettings> }
  | { type: 'add-plant'; plant: GardenPlant }
  | { type: 'remove-plant'; plantId: string }
  | { type: 'toggle-task'; taskId: string };

export const initialGardenState: GardenState = {
  loaded: false,
  settings: { hemisphere: null },
  plants: [],
  completedTaskIds: [],
};

export function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.state, loaded: true };
    case 'update-settings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'add-plant':
      return { ...state, plants: [...state.plants, action.plant] };
    case 'remove-plant':
      return {
        ...state,
        plants: state.plants.filter((p) => p.id !== action.plantId),
        completedTaskIds: state.completedTaskIds.filter(
          (id) => !id.startsWith(`${action.plantId}:`),
        ),
      };
    case 'toggle-task':
      return {
        ...state,
        completedTaskIds: state.completedTaskIds.includes(action.taskId)
          ? state.completedTaskIds.filter((id) => id !== action.taskId)
          : [...state.completedTaskIds, action.taskId],
      };
  }
}

const GardenContext = createContext<{
  state: GardenState;
  dispatch: (action: GardenAction) => void;
} | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gardenReducer, initialGardenState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => dispatch({ type: 'hydrate', state: json ? JSON.parse(json) : {} }))
      .catch(() => dispatch({ type: 'hydrate', state: {} }));
  }, []);

  useEffect(() => {
    if (!state.loaded) return;
    const { loaded: _loaded, ...persisted } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [state]);

  return <GardenContext.Provider value={{ state, dispatch }}>{children}</GardenContext.Provider>;
}

export function useGarden() {
  const context = useContext(GardenContext);
  if (!context) throw new Error('useGarden must be used inside GardenProvider');
  return context;
}

export function createPlantId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
