'use client';

/**
 * Gorizontal skroll bo'ladigan kategoriya teglari:
 * "Barchasi" | "Eng ko'p sotilganlar" | kategoriyalar...
 */
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

export type FilterValue = 'all' | 'best' | number;

interface CategoryTabsProps {
  categories: Category[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

export function CategoryTabs({ categories, value, onChange }: CategoryTabsProps) {
  const tabs: { key: FilterValue; label: string }[] = [
    { key: 'all', label: 'Barchasi' },
    { key: 'best', label: '🔥 Eng ko‘p sotilganlar' },
    ...categories.map((c) => ({
      key: c.id as FilterValue,
      label: `${c.emoji ? c.emoji + ' ' : ''}${c.name}`,
    })),
  ];

  return (
    <div className="sticky top-0 z-20 bg-white py-2.5 lg:static lg:py-4">
      <div className="scroll-x px-page lg:flex-wrap">
        {tabs.map((tab) => (
          <button
            key={String(tab.key)}
            onClick={() => onChange(tab.key)}
            className={cn('chip shrink-0', value === tab.key ? 'chip-active' : 'chip-idle')}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
