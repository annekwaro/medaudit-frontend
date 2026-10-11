import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'primary' | 'secondary' | 'tertiary' | 'error';

/** Pill badge on an M3 container color. Content is projected. */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-tone]': 'tone()' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-block;
      padding: 2px 10px;
      border-radius: var(--mat-sys-corner-full);
      font: var(--mat-sys-label-medium);
      letter-spacing: var(--mat-sys-label-medium-tracking);
      white-space: nowrap;
    }

    :host([data-tone='primary']) {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    :host([data-tone='secondary']) {
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }

    :host([data-tone='tertiary']) {
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
    }

    :host([data-tone='error']) {
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-error);
    }
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('primary');
}
