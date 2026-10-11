import { DatePipe } from '@angular/common';
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

export interface TrendPoint {
  /** ISO 8601 date (yyyy-MM-dd). */
  date: string;
  value: number;
}

const HEIGHT = 200;
const PAD = { top: 12, right: 16, bottom: 28, left: 32 };

/** Smallest 1/2/5 × 10^n step that splits `max` into at most ~4 gridlines. */
function niceStep(max: number): number {
  const raw = Math.max(max, 1) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * magnitude).find((step) => step >= raw)!;
}

/**
 * Single-series line + area chart as inline SVG, laid out in pixels from the measured width
 * (so text and strokes never stretch). The SVG is decorative; a visually hidden table carries the data.
 */
@Component({
  selector: 'app-trend-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  template: `
    <header class="trend-chart__header">
      <h2 class="trend-chart__title">{{ heading() }}</h2>
      <span class="trend-chart__total">Total: {{ total() }}</span>
    </header>

    <div #plot class="trend-chart__plot" (mouseleave)="hovered.set(null)">
      @if (layout(); as l) {
        <svg class="trend-chart__svg" [attr.width]="l.width" [attr.height]="height" aria-hidden="true">
          @for (tick of l.ticks; track tick.value) {
            <line class="trend-chart__grid" [attr.x1]="pad.left" [attr.x2]="l.width - pad.right" [attr.y1]="tick.y" [attr.y2]="tick.y" />
            <text class="trend-chart__label" [attr.x]="pad.left - 8" [attr.y]="tick.y" text-anchor="end" dominant-baseline="middle">
              {{ tick.value }}
            </text>
          }

          <path class="trend-chart__area" [attr.d]="l.area" />
          <path class="trend-chart__line" [attr.d]="l.line" />

          @for (point of l.points; track point.date; let i = $index) {
            <text class="trend-chart__label" [attr.x]="point.x" [attr.y]="height - 8" text-anchor="middle">
              {{ point.date | date: 'EEE' }}
            </text>
            <circle class="trend-chart__dot" [class.trend-chart__dot--active]="hovered() === i" [attr.cx]="point.x" [attr.cy]="point.y" [attr.r]="hovered() === i ? 5 : 3" />
            <!-- Full-height hit column so hovering anywhere near a day selects it. -->
            <rect
              class="trend-chart__hit"
              [attr.x]="point.x - l.columnWidth / 2"
              [attr.y]="0"
              [attr.width]="l.columnWidth"
              [attr.height]="height"
              (mouseenter)="hovered.set(i)"
            />
          }

          @if (hoveredPoint(); as point) {
            <line class="trend-chart__guide" [attr.x1]="point.x" [attr.x2]="point.x" [attr.y1]="pad.top" [attr.y2]="height - pad.bottom" />
          }
        </svg>

        @if (hoveredPoint(); as point) {
          <div
            class="trend-chart__tooltip"
            [class.trend-chart__tooltip--start]="hovered() === 0"
            [class.trend-chart__tooltip--end]="hovered() === l.points.length - 1"
            [style.left.px]="point.x"
            [style.top.px]="point.y"
          >
            <span class="trend-chart__tooltip-date">{{ point.date | date: 'EEE, MMM d' }}</span>
            <strong>{{ point.value }}</strong> {{ unit() }}
          </div>
        }
      }
    </div>

    <table class="sr-only">
      <caption>{{ heading() }}</caption>
      <thead>
        <tr><th scope="col">Date</th><th scope="col">{{ unit() }}</th></tr>
      </thead>
      <tbody>
        @for (point of points(); track point.date) {
          <tr><td>{{ point.date | date: 'EEEE, MMM d' }}</td><td>{{ point.value }}</td></tr>
        }
      </tbody>
    </table>
  `,
  styles: `
    :host {
      display: block;
      padding: 16px 20px 12px;
      border-radius: 20px;
      background: var(--mat-sys-surface-container-lowest);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .trend-chart__header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 8px;
    }

    .trend-chart__title {
      margin: 0;
      font: var(--ma-type-section);
    }

    .trend-chart__total {
      font: var(--mat-sys-body-small);
      letter-spacing: var(--mat-sys-body-small-tracking);
      color: var(--mat-sys-on-surface-variant);
    }

    // Fixed height so the card doesn't jump while the width is first measured.
    .trend-chart__plot {
      position: relative;
      height: 200px;
    }

    .trend-chart__svg {
      display: block;
      overflow: visible;
    }

    .trend-chart__grid {
      stroke: rgba(0, 0, 0, 0.04);
      stroke-width: 1;
    }

    .trend-chart__label {
      font: 400 0.75rem var(--ma-font-body);
      fill: var(--mat-sys-on-surface-variant);
    }

    .trend-chart__area {
      fill: rgba(31, 78, 74, 0.08);
    }

    .trend-chart__line {
      fill: none;
      stroke: var(--mat-sys-primary);
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }

    .trend-chart__dot {
      fill: var(--mat-sys-surface-container-lowest);
      stroke: var(--mat-sys-primary);
      stroke-width: 2;
    }

    .trend-chart__dot--active {
      fill: var(--mat-sys-primary);
    }

    .trend-chart__guide {
      stroke: rgba(31, 78, 74, 0.2);
      stroke-width: 1;
      stroke-dasharray: 3 3;
      pointer-events: none;
    }

    .trend-chart__hit {
      fill: transparent;
    }

    // Sits above the hovered point; first/last points anchor to their edge to stay inside the card.
    .trend-chart__tooltip {
      position: absolute;
      transform: translate(-50%, calc(-100% - 12px));
      padding: 6px 10px;
      border-radius: 8px;
      background: var(--mat-sys-inverse-surface);
      color: var(--mat-sys-inverse-on-surface);
      font: var(--mat-sys-body-small);
      white-space: nowrap;
      pointer-events: none;

      &--start {
        transform: translate(-12px, calc(-100% - 12px));
      }

      &--end {
        transform: translate(calc(-100% + 12px), calc(-100% - 12px));
      }
    }

    .trend-chart__tooltip-date {
      display: block;
      opacity: 0.8;
    }
  `,
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
    const step = niceStep(Math.max(...data.map((point) => point.value)));
    const yMax = Math.ceil(Math.max(...data.map((point) => point.value), 1) / step) * step;
    const y = (value: number) => baseline - (value / yMax) * plotHeight;
    const columnWidth = data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

    const points = data.map((point, i) => ({
      ...point,
      x: PAD.left + (data.length > 1 ? i * columnWidth : plotWidth / 2),
      y: y(point.value),
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
