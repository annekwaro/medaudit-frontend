import { groupByDay } from './day-groups';

describe('groupByDay', () => {
  const at = (timestamp: string) => ({ timestamp });

  it('groups consecutive items by day with relative labels', () => {
    const groups = groupByDay(
      [at('2026-10-13T08:40:00'), at('2026-10-13T06:00:00'), at('2026-10-12T21:52:00'), at('2026-10-11T08:30:00')],
      (item) => item.timestamp,
      '2026-10-13',
    );
    expect(groups.map((group) => [group.label, group.items.length])).toEqual([
      ['Today', 2],
      ['Yesterday', 1],
      ['Sunday, Oct 11', 1],
    ]);
  });

  it('adds the year for other years', () => {
    expect(groupByDay([at('2025-12-30T10:00:00')], (item) => item.timestamp, '2026-01-02')[0].label).toBe(
      'Tuesday, Dec 30, 2025',
    );
  });

  it('is empty for no items', () => {
    expect(groupByDay([], (item: { timestamp: string }) => item.timestamp, '2026-10-13')).toEqual([]);
  });
});
