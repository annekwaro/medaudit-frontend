import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Params, RouterLink } from '@angular/router';
import { MicroVizComponent, MicroVizType } from '../micro-viz/micro-viz.component';

/** `neutral` is for figures that are never a problem in themselves (e.g. a patient count). */
export type StatsSeverity = 'neutral' | 'info' | 'success' | 'warning' | 'critical';

type DeltaDirection = 'up' | 'down' | 'flat';

const DIRECTION_ICONS: Record<DeltaDirection, string> = {
  up: 'trending_up',
  down: 'trending_down',
  flat: 'trending_flat',
};

/** Fallback icon per severity when no `icon` is given. */
const DEFAULT_ICONS: Record<StatsSeverity, string> = {
  neutral: 'insights',
  info: 'insights',
  success: 'task_alt',
  warning: 'pending_actions',
  critical: 'notifications_active',
};

/** Screen-reader text for severities that the card's color alone would otherwise convey. */
const SEVERITY_TEXT: Record<StatsSeverity, string | null> = {
  neutral: null,
  info: null,
  success: null,
  warning: 'needs attention',
  critical: 'critical',
};

@Component({
  selector: 'app-stats-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, RouterLink, MatCardModule, MatIconModule, MicroVizComponent],
  // The entrance class is bound from creation, so it plays on first render (when enabled).
  host: {
    '[class.stats-card-host--enter]': 'animateEntrance()',
    '[class.stats-card-host--pulse]': 'pulse() && animateEntrance()',
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
  /** Play the entrance (rise, value pulse, micro-viz). Off renders the card in place; hover motion stays. */
  readonly animateEntrance = input(true);
  /** Optional micro-visualization, right-aligned on the delta row. */
  readonly vizType = input<MicroVizType>();
  /** Oldest first, last entry today; for `progress`, a single 0-100 value. */
  readonly vizValues = input<readonly number[]>([]);
  /** Router link; when set, the whole card becomes a link. */
  readonly link = input<string>();
  readonly queryParams = input<Params>();
  /** Link destination, e.g. "View unreviewed submissions". The value and delta are appended for the aria-label. */
  readonly linkLabel = input<string>();
  /** Unit read after the value in the aria-label, e.g. "items" → "12 items". */
  readonly valueUnit = input<string>();
  /** Short context beside the value, e.g. "oldest 7 days" or "target 90%". */
  readonly note = input<string>();

  readonly iconName = computed(() => this.icon() ?? DEFAULT_ICONS[this.severity()]);
  readonly severityText = computed(() => SEVERITY_TEXT[this.severity()]);

  /** e.g. "View unreviewed submissions — 12 items (oldest 7 days), +3 from yesterday, worsening". */
  readonly ariaLabel = computed(() => {
    const destination = this.linkLabel() ?? this.label();
    const unit = this.valueUnit();
    const note = this.note();
    const value = `${this.value()}${unit ? ` ${unit}` : ''}${note ? ` (${note})` : ''}`;
    const delta = this.delta();
    const sentiment = this.sentimentText();
    return `${destination} — ${value}${delta ? `, ${delta}` : ''}${sentiment ? `, ${sentiment}` : ''}`;
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

  /** Colors the delta: green when improving, rose when worsening, muted when flat. */
  readonly sentiment = computed<'positive' | 'negative' | 'neutral'>(() => {
    const direction = this.direction();
    if (!direction || direction === 'flat') return 'neutral';
    return (direction === 'up') === this.higherIsBetter() ? 'positive' : 'negative';
  });

  /** The delta's color in words, for screen readers. */
  readonly sentimentText = computed(() =>
    this.sentiment() === 'positive' ? 'improving' : this.sentiment() === 'negative' ? 'worsening' : null,
  );
}
