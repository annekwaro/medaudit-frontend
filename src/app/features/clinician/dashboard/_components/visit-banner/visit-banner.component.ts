import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Params, RouterLink } from '@angular/router';

type BannerState = 'shown' | 'leaving' | 'dismissed';

/**
 * Dismissible summary banner with an optional action link. Dismissal lasts for this session only (component state).
 * On dismiss it fades and collapses over 200ms, then is removed from layout.
 */
@Component({
  selector: 'app-visit-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  host: {
    '[class.visit-banner-host--leaving]': 'state() === "leaving"',
    '[class.visit-banner-host--dismissed]': 'state() === "dismissed"',
    '(animationend)': 'onAnimationEnd($event)',
  },
  template: `
    @if (state() !== 'dismissed') {
      <div class="visit-banner__clip">
        <aside class="visit-banner" aria-label="Changes since yesterday">
          <mat-icon class="visit-banner__icon" aria-hidden="true">notifications_active</mat-icon>
          <p class="visit-banner__text">{{ message() }}</p>
          @if (actionLink(); as link) {
            <a class="visit-banner__action" [routerLink]="link" [queryParams]="actionQueryParams()">{{ actionLabel() }}</a>
          }
          <button mat-icon-button type="button" class="visit-banner__dismiss" aria-label="Dismiss summary" (click)="dismiss()">
            <mat-icon>close</mat-icon>
          </button>
        </aside>
      </div>
    }
  `,
  styles: `
    // Grid row 1fr → 0fr collapses the height smoothly alongside the fade.
    :host {
      display: grid;
      grid-template-rows: 1fr;
    }

    :host(.visit-banner-host--dismissed) {
      display: none;
    }

    @media (prefers-reduced-motion: no-preference) {
      :host(.visit-banner-host--leaving) {
        animation: visit-banner-leave 200ms ease forwards;
      }
    }

    // margin-bottom: 0 releases the parent's spacing below the banner in the same motion.
    @keyframes visit-banner-leave {
      to {
        opacity: 0;
        grid-template-rows: 0fr;
        margin-bottom: 0;
      }
    }

    .visit-banner__clip {
      min-height: 0;
      overflow: hidden;
    }

    .visit-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 14px;
      background: linear-gradient(90deg, rgba(188, 236, 230, 0.45), rgba(188, 236, 230, 0.15));
    }

    .visit-banner__icon {
      flex: 0 0 auto;
      width: 20px;
      height: 20px;
      font-size: 20px;
      color: #0f766e; // teal-700, the stats cards' info accent
    }

    .visit-banner__text {
      flex: 1 1 auto;
      margin: 0;
      font: var(--mat-sys-body-medium);
      letter-spacing: var(--mat-sys-body-medium-tracking);
      color: var(--mat-sys-on-surface);
    }

    .visit-banner__action {
      flex: 0 0 auto;
      border-radius: 4px;
      font: 500 0.875rem / 1.25rem var(--ma-font-body);
      color: #0f766e;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }

      &:focus-visible {
        outline: 2px solid #0f766e;
        outline-offset: 2px;
      }
    }

    // Ghost and compact so the banner stays one slim line.
    .visit-banner__dismiss {
      --mdc-icon-button-state-layer-size: 32px;
      --mdc-icon-button-icon-size: 18px;

      flex: 0 0 auto;
      margin: -4px -8px -4px 0;
      padding: 7px;
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        width: 18px;
        height: 18px;
        font-size: 18px;
      }
    }
  `,
})
export class VisitBannerComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** e.g. "3 new submissions and 2 patients flagged since yesterday." */
  readonly message = input.required<string>();
  /** Optional text link shown before the dismiss button. */
  readonly actionLabel = input('Review');
  readonly actionLink = input<string>();
  readonly actionQueryParams = input<Params>();

  readonly state = signal<BannerState>('shown');

  dismiss(): void {
    // With reduced motion there's no animation (and so no animationend): remove immediately.
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.state.set(reducedMotion ? 'dismissed' : 'leaving');
  }

  onAnimationEnd(event: AnimationEvent): void {
    if (event.target === this.host.nativeElement && this.state() === 'leaving') {
      this.state.set('dismissed');
    }
  }
}
