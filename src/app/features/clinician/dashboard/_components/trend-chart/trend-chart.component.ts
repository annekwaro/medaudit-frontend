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
}

const HEIGHT = 180;
const PAD = { top: 12, right: 16, bottom: 28, left: 32 };

/** Smallest 1/2/5 × 10^n step that splits `max` into at most ~4 gridlines. */
function niceStep(max: number): number {
  const raw = Math.max(max, 1) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * magnitude).find((step) => step >= raw)!;
}

/**
 * Single-series line + area chart card as inline SVG. The viewBox tracks the measured width, so the
 * chart is responsive without stretching text or strokes. The SVG is decorative; a visually hidden
 * table carries the data. Header controls are projected via `[trendChartControls]`.
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

  readonly height = HEIGHT;
  readonly pad = PAD;

  readonly hovered = signal<number | null>(null);
  private readonly width = signal(0);
  private readonly plot = viewChild.required<ElementRef<HTMLElement>>('plot');

  readonly total = computed(() => this.points().reduce((sum, point) => sum + point.value, 0));

  readonly layout = computed(() => {
    const width = this.width();
    const data = this.points();
    if (!width || !data.length) return null;

    const plotWidth = width - PAD.left - PAD.right;
    const plotHeight = HEIGHT - PAD.top - PAD.bottom;
    const baseline = PAD.top + plotHeight;
    const max = Math.max(...data.map((point) => point.value), 1);
    const step = niceStep(max);
    const yMax = Math.ceil(max / step) * step;
    const y = (value: number) => baseline - (value / yMax) * plotHeight;
    const columnWidth = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

    const points = data.map((point, i) => ({
      ...point,
      x: PAD.left + (data.length > 1 ? i * columnWidth : plotWidth / 2),
      y: y(point.value),
      // 0..1 position along the line, used to reveal each dot as the draw passes it.
      progress: data.length > 1 ? i / (data.length - 1) : 0,
    }));
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
    const area = `${line} L${points.at(-1)!.x},${baseline} L${points[0].x},${baseline} Z`;
    const ticks = Array.from({ length: yMax / step + 1 }, (_, i) => ({ value: i * step, y: y(i * step) }));

    return { width, points, line, area, ticks, columnWidth };
  });

  readonly hoveredPoint = computed(() => {
    const index = this.hovered();
    return index === null ? null : (this.layout()?.points[index] ?? null);
  });

  constructor() {
    const observer = new ResizeObserver(([entry]) => this.width.set(entry.contentRect.width));
    afterNextRender(() => observer.observe(this.plot().nativeElement));
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
