import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * - bars: daily counts as columns (e.g. new submissions)
 * - dots: daily counts as dot sizes (e.g. new alerts)
 * - sparkline: a level over time as a soft area (e.g. active patients)
 * - progress: values[0] out of 100 (a bar only; the card shows the figure)
 */
export type MicroVizType = 'bars' | 'dots' | 'sparkline' | 'progress';

const WIDTH = 60;
const HEIGHT = 24;

/** Bars: 6px wide, 2px apart; the bottom 3px hold today's accent tick. */
const BAR_WIDTH = 6;
const BAR_GAP = 2;
const BAR_BASELINE = 21;

/** Dots: 1 → r 2, 5 or more → r 5; zero days get a faint r 1 placeholder. */
const DOT_MIN_R = 2;
const DOT_MAX_R = 5;

/** Path for a bar with only its top corners rounded. */
function topRoundedBar(x: number, y: number, width: number, height: number, radius: number): string {
  const r = Math.min(radius, width / 2, height);
  return `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
}

/**
 * Tiny (60×24) inline-SVG trend for a stats card. Colors come from the card's
 * `--stats-card-color`; past values are tinted, the last value (today) is full strength.
 * Decorative: the card's own text and aria-label carry the figures.
 */
@Component({
  selector: 'app-micro-viz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', '[class.micro-viz--animate]': 'animate()' },
  templateUrl: './micro-viz.component.html',
  styleUrl: './micro-viz.component.scss',
})
export class MicroVizComponent {
  readonly type = input.required<MicroVizType>();
  /** Oldest first; the last entry is today. */
  readonly values = input.required<readonly number[]>();
  /** Grow in on first render; off draws the final state immediately. */
  readonly animate = input(true);

  readonly width = WIDTH;
  readonly height = HEIGHT;
  readonly barWidth = BAR_WIDTH;
  readonly barBaseline = BAR_BASELINE;

  readonly bars = computed(() => {
    const values = this.values();
    const max = Math.max(...values, 1);
    const offset = (WIDTH - (values.length * (BAR_WIDTH + BAR_GAP) - BAR_GAP)) / 2;
    return values.map((value, i) => {
      const height = Math.max((value / max) * BAR_BASELINE, 1);
      const x = offset + i * (BAR_WIDTH + BAR_GAP);
      return { x, path: topRoundedBar(x, BAR_BASELINE - height, BAR_WIDTH, height, 2) };
    });
  });

  readonly dots = computed(() => {
    const values = this.values();
    const step = values.length > 1 ? (WIDTH - 2 * DOT_MAX_R) / (values.length - 1) : 0;
    return values.map((value, i) => ({
      cx: DOT_MAX_R + i * step,
      r: value <= 0 ? 1 : DOT_MIN_R + ((Math.min(value, 5) - 1) / 4) * (DOT_MAX_R - DOT_MIN_R),
    }));
  });

  readonly sparkline = computed(() => {
    const values = this.values();
    const min = Math.min(...values);
    const range = Math.max(...values) - min;
    const step = values.length > 1 ? (WIDTH - 6) / (values.length - 1) : 0;
    // Flat series sit mid-height; otherwise span y 4..20, leaving room for today's dot.
    const points = values.map((value, i) => ({
      x: 3 + i * step,
      y: range ? 20 - ((value - min) / range) * 16 : 12,
    }));
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
    const last = points.at(-1)!;
    return { line, area: `${line} L${last.x},${HEIGHT} L${points[0].x},${HEIGHT} Z`, last };
  });

  readonly percent = computed(() => Math.min(Math.max(this.values()[0] ?? 0, 0), 100));
}
