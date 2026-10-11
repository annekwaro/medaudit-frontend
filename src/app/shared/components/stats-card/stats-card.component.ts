import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type StatsSeverity = 'info' | 'warning' | 'critical';

type DeltaDirection = 'up' | 'down' | 'flat';

const DIRECTION_ICONS: Record<DeltaDirection, string> = {
  up: 'trending_up',
  down: 'trending_down',
  flat: 'trending_flat',
};

const SEVERITY_ICONS: Record<StatsSeverity, string | null> = {
  info: null,
  warning: 'warning',
  critical: 'error',
};

@Component({
  selector: 'app-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss',
})
export class StatsCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  /** Signed change, e.g. "+3 from yesterday", "-2%", "0". Direction is read from the leading sign. */
  readonly delta = input<string>();
  readonly severity = input<StatsSeverity>('info');
  /** Whether an increase is good news. Set false for counts like alerts or unreviewed items. */
  readonly higherIsBetter = input(true);

  readonly severityIcon = computed(() => SEVERITY_ICONS[this.severity()]);

  readonly direction = computed<DeltaDirection | null>(() => {
    const delta = this.delta()?.trim();
    if (!delta) return null;
    if (delta.startsWith('+')) return 'up';
    if (delta.startsWith('-') || delta.startsWith('−')) return 'down';
    return 'flat';
  });

  readonly directionIcon = computed(() => {
    const direction = this.direction();
    return direction ? DIRECTION_ICONS[direction] : null;
  });

  readonly sentiment = computed<'positive' | 'negative' | 'neutral'>(() => {
    const direction = this.direction();
    if (!direction || direction === 'flat') return 'neutral';
    return (direction === 'up') === this.higherIsBetter() ? 'positive' : 'negative';
  });
}
