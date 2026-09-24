import type { Category } from './mudagiri-diagnosis-v2';

export type EncounterState = 'defeat' | 'spared' | 'needs_review';

export interface Encounter {
  category: Category;
  state: EncounterState;
  actual: number;
  comparable: number | null;
  monthlyImprovement?: number;
  priority: number;
}

type ResultEnemy = {
  category: Category;
  monthlyImprovement?: number;
  priority?: number;
};

type ResultSpared = {
  category: Category;
  actual?: number;
  comparable?: number | null;
};

type ResultNeedsReview = {
  category: Category;
  actual?: number;
};

type BattleResultLike = {
  enemies?: ResultEnemy[];
  spared?: ResultSpared[];
  needsReview?: ResultNeedsReview[];
};

export function selectBattleEncounters(
  result: BattleResultLike,
  expenses: Record<Category, number>,
  comparable: Partial<Record<Category, number | null>>,
  max = 3
): Encounter[] {
  const candidates: Encounter[] = [];

  for (const e of result.enemies ?? []) {
    candidates.push({
      category: e.category,
      state: 'defeat',
      actual: expenses[e.category] ?? 0,
      comparable: comparable[e.category] ?? null,
      monthlyImprovement: e.monthlyImprovement ?? 0,
      priority: 300 + (e.priority ?? 0),
    });
  }

  for (const e of result.spared ?? []) {
    candidates.push({
      category: e.category,
      state: 'spared',
      actual: e.actual ?? 0,
      comparable: e.comparable ?? null,
      priority:
        200 +
        Math.max(
          0,
          (e.actual ?? 0) - (e.comparable ?? 0)
        ) /
          1000,
    });
  }

  for (const e of result.needsReview ?? []) {
    candidates.push({
      category: e.category,
      state: 'needs_review',
      actual: e.actual ?? 0,
      comparable: comparable[e.category] ?? null,
      priority: 100 + (e.actual ?? 0) / 1000,
    });
  }

  return candidates
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        a.category.localeCompare(b.category)
    )
    .slice(0, Math.max(0, max));
}
