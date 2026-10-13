import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export interface TrendPoint {
  /** X-axis label, e.g. "Mon" or "08:00". */
  label: string;
  /** Full description for the tooltip and the screen-reader table, e.g. "Mon, Oct 5". */
  detail: string;
  value: number;
  /** Optional target for the period (e.g. scheduled questionnaires), drawn as a dashed line. */
  expected?: number;
}

/** Minimum plot height; the plot grows to fill a taller card (e.g. next to a longer sibling). */
const MIN_HEIGHT = 180;
const PAD = { top: 12, right: 16, bottom: 28, left: 32 };

/** Smallest 1/2/5 × 10^n step that splits `max` into at most ~4 gridlines. */
function niceStep(max: number): number {
  const raw = Math.max(max, 1) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * magnitude).find((step) => step >= raw)!;
}

/**
 * Single-series line + area chart card as inline SVG. The viewBox tracks the measured plot size (the plot
 * fills the card, at least 180px tall), so the chart is responsive without stretching text or strokes.
 * The SVG is decorative; a visually hidden table carries the data. Header controls are projected via
 * `[trendChartControls]`.
 */
@Component({
  selector: 'app-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule],
  templateUrl: './trend-chart.component.html',
  styleUrl: './trend-chart.component.scss',
})
export class TrendChartComponent {
  readonly heading = input.required<string>();
  readonly points = input.required<TrendPoint[]>();
  /** Plural noun for values, e.g. "submissions". */
  readonly unit = input('submissions');
  /** Draw the lines in on first render; off shows the finished chart immediately. */
  readonly animateEntrance = input(true);
  /** Legend label for the solid line: the unit, capitalized ("Submissions"). */
  readonly unitLabel = computed(() => this.unit().charAt(0).toUpperCase() + this.unit().slice(1));

  readonly pad = PAD;

  readonly hovered = signal<number | null>(null);
  private readonly size = signal({ width: 0, height: MIN_HEIGHT });
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');

  readonly total = computed(() => this.points().reduce((sum, point) => sum + point.value, 0));
  /** Sum of `expected`, or null unless every point has one. */
  readonly totalExpected = computed(() => {
    const points = this.points();
    return points.length && points.every((point) => point.expected !== undefined)
      ? points.reduce((sum, point) => sum + point.expected!, 0)
      : null;
  });
  readonly percentOfExpected = computed(() => {
    const expected = this.totalExpected();
    return expected ? Math.round((this.total() / expected) * 100) : null;
  });

  readonly layout = computed(() => {
    const { width, height } = this.size();
    const data = this.points();
    if (!width || !data.length) return null;

    const plotWidth = width - PAD.left - PAD.right;
    const plotHeight = height - PAD.top - PAD.bottom;
    const baseline = PAD.top + plotHeight;
    const hasExpected = this.totalExpected() !== null;
    const max = Math.max(...data.map((point) => Math.max(point.value, point.expected ?? 0)), 1);
    const step = niceStep(max);
    const yMax = Math.ceil(max / step) * step;
    const y = (value: number) => baseline - (value / yMax) * plotHeight;
    const columnWidth = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

    const points = data.map((point, i) => ({
      ...point,
      x: PAD.left + (data.length > 1 ? i * columnWidth : plotWidth / 2),
      y: y(point.value),
      expectedY: point.expected === undefined ? null : y(point.expected),
      // 0..1 position along the line, used to reveal each dot as the draw passes it.
      progress: data.length > 1 ? i / (data.length - 1) : 0,
    }));
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
    const area = `${line} L${points.at(-1)!.x},${baseline} L${points[0].x},${baseline} Z`;
    const expectedLine = hasExpected ? points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.expectedY}`).join(' ') : null;
    const ticks = Array.from({ length: yMax / step + 1 }, (_, i) => ({ value: i * step, y: y(i * step) }));

    return { width, height, points, line, area, expectedLine, ticks, columnWidth };
  });

  readonly hoveredPoint = computed(() => {
    const index = this.hovered();
    return index === null ? null : (this.layout()?.points[index] ?? null);
  });

  constructor() {
    const observer = new ResizeObserver(([entry]) =>
      this.size.set({ width: entry.contentRect.width, height: Math.max(entry.contentRect.height, MIN_HEIGHT) }),
    );
    afterNextRender(() => observer.observe(this.plot().nativeElement));
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
