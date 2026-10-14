import { complianceSeverity, unreviewedSeverity } from './stat-severity';

describe('unreviewedSeverity', () => {
  it('is success when nothing is waiting', () => {
    expect(unreviewedSeverity(0, null)).toBe('success');
  });

  it('stays neutral while the oldest is under 2 days old, whatever the count', () => {
    expect(unreviewedSeverity(40, 0)).toBe('neutral');
    expect(unreviewedSeverity(40, 1)).toBe('neutral');
  });

  it('is a warning from 2 to 7 days', () => {
    expect(unreviewedSeverity(1, 2)).toBe('warning');
    expect(unreviewedSeverity(1, 7)).toBe('warning');
  });

  it('is critical after 7 days', () => {
    expect(unreviewedSeverity(1, 8)).toBe('critical');
  });
});

describe('complianceSeverity', () => {
  it('bands at the 90% target and 70%', () => {
    expect(complianceSeverity(90)).toBe('success');
    expect(complianceSeverity(89)).toBe('warning');
    expect(complianceSeverity(70)).toBe('warning');
    expect(complianceSeverity(69)).toBe('critical');
  });
});
