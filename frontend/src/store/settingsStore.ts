'use client';

/**
 * Do'kon matnlari (sozlamalari) — bir marta yuklanadi va butun ilova bo'ylab ishlatiladi.
 */
import { create } from 'zustand';
import { api } from '@/lib/api';

interface SettingsState {
  settings: Record<string, string>;
  loaded: boolean;
  loading: boolean;
  load: (force?: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: {},
  loaded: false,
  loading: false,

  load: async (force = false) => {
    const { loaded, loading } = get();
    if ((loaded && !force) || loading) return;

    set({ loading: true });
    try {
      const settings = await api.getSettings();
      set({ settings, loaded: true, loading: false });
    } catch {
      // Backend javob bermasa — zaxira matnlar ishlatiladi
      set({ loaded: true, loading: false });
    }
  },
}));
