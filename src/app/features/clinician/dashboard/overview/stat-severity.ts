import { StatsSeverity } from '../../../../shared/components/stats-card/stats-card.component';

/** Protocol compliance target: at or above it the card is green; the progress bar marks it. */
export const COMPLIANCE_TARGET = 90;

/** Same bands as the patient detail page: >= 90% on track, 70-89% late, < 70% missing. */
export function complianceSeverity(percent: number): StatsSeverity {
  return percent >= COMPLIANCE_TARGET ? 'success' : percent >= 70 ? 'warning' : 'critical';
}

/**
 * Review timeliness, not volume: there are nearly always submissions waiting, so the color tracks
 * how long the oldest has waited. None waiting → success; under 2 days → neutral;
 * 2-7 days → warning; more than 7 days → critical.
 */
export function unreviewedSeverity(count: number, oldestWaitingDays: number | null): StatsSeverity {
  if (count === 0 || oldestWaitingDays === null) return 'success';
  if (oldestWaitingDays > 7) return 'critical';
  if (oldestWaitingDays >= 2) return 'warning';
  return 'neutral';
}
