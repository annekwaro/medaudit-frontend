import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Params, RouterLink } from '@angular/router';

export type StatsSeverity = 'info' | 'success' | 'warning' | 'critical';

type DeltaDirection = 'up' | 'down' | 'flat';

const DIRECTION_ICONS: Record<DeltaDirection, string> = {
  up: 'trending_up',
  down: 'trending_down',
  flat: 'trending_flat',
};

/** Fallback icon per severity when no `icon` is given. */
const DEFAULT_ICONS: Record<StatsSeverity, string> = {
  info: 'insights',
  success: 'task_alt',
  warning: 'pending_actions',
  critical: 'notifications_active',
};

/** Screen-reader text for severities that the card's color alone would otherwise convey. */
const SEVERITY_TEXT: Record<StatsSeverity, string | null> = {
  info: null,
  success: null,
  warning: 'needs attention',
  critical: 'critical',
};

@Component({
  selector: 'app-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, MatCardModule, MatIconModule],
  // Entrance animation class is present from creation, so it plays on first render.
  host: {
    class: 'stats-card-host--enter',
    '[class.stats-card-host--pulse]': 'pulse()',
  },
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.scss',
})
export class StatsCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  /** Signed change, e.g. "+3 from yesterday", "-2%", "0". Direction is read from the leading sign. */
  readonly delta = input<string>();
  readonly severity = input<StatsSeverity>('info');
  /** Material icon name for the card's identity; defaults by severity. */
  readonly icon = input<string>();
  /** Whether an increase is good news. Set false for counts like alerts or unreviewed items. */
  readonly higherIsBetter = input(true);
  /** Pulse the value once after the entrance, to draw the eye to a critical metric. */
  readonly pulse = input(false);
  /** Router link; when set, the whole card becomes a link. */
  readonly link = input<string>();
  readonly queryParams = input<Params>();
  /** Link destination, e.g. "View unreviewed submissions". The value and delta are appended for the aria-label. */
  readonly linkLabel = input<string>();
  /** Unit read after the value in the aria-label, e.g. "items" → "12 items". */
  readonly valueUnit = input<string>();

  readonly iconName = computed(() => this.icon() ?? DEFAULT_ICONS[this.severity()]);
  readonly severityText = computed(() => SEVERITY_TEXT[this.severity()]);

  /** e.g. "View unreviewed submissions — 12 items, +3 from yesterday". */
  readonly ariaLabel = computed(() => {
    const destination = this.linkLabel() ?? this.label();
    const unit = this.valueUnit();
    const value = unit ? `${this.value()} ${unit}` : `${this.value()}`;
    const delta = this.delta();
    return `${destination} — ${value}${delta ? `, ${delta}` : ''}`;
  });

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
