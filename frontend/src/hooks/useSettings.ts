'use client';

/**
 * Admin tahrirlaydigan matnlarni olish uchun hook.
 *
 *   const { t, rows } = useSettings();
 *   t('hero_title')        -> matn
 *   rows('benefits')       -> [['🌿', 'Sarlavha', 'Matn'], ...]
 */
import { useCallback, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { pick, parseRows } from '@/lib/content';

export function useSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const loaded = useSettingsStore((s) => s.loaded);
  const load = useSettingsStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  const t = useCallback((key: string) => pick(settings, key), [settings]);
  const rows = useCallback((key: string) => parseRows(pick(settings, key)), [settings]);

  return { settings, loaded, t, rows, reload: () => load(true) };
}
