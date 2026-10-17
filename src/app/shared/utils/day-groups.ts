import { daysBetween } from './dates';

/** Items that share a calendar day, with a heading such as "Today" or "Sunday, Oct 11". */
export interface DayGroup<T> {
  /** ISO date (yyyy-MM-dd). */
  date: string;
  label: string;
  items: T[];
}

function dayLabel(date: string, today: string): string {
  const ago = daysBetween(date, today);
  if (ago === 0) return 'Today';
  if (ago === 1) return 'Yesterday';
  const [year, month, day] = date.split('-').map(Number);
  const local = new Date(year, month - 1, day);
  const sameYear = date.slice(0, 4) === today.slice(0, 4);
  return local.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/**
 * Splits items into consecutive runs by calendar day, keeping their order (so a newest-first list
 * gives newest-first groups). `timestampOf` returns an ISO date or timestamp; `today` is an ISO date.
 */
export function groupByDay<T>(items: readonly T[], timestampOf: (item: T) => string, today: string): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const item of items) {
    const date = timestampOf(item).slice(0, 10);
    const last = groups.at(-1);
    if (last?.date === date) {
      last.items.push(item);
    } else {
      groups.push({ date, label: dayLabel(date, today), items: [item] });
    }
  }
  return groups;
}
