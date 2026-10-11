import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

/**
 * URL of the in-app page the user navigated from, or null on a direct load / refresh.
 * Only valid while the navigation is in flight, so call it from a routed component's constructor.
 */
export function previousAppUrl(router: Router): string | null {
  return router.getCurrentNavigation()?.previousNavigation?.finalUrl?.toString() ?? null;
}

/** Small "← Label" link that goes back in history, or to `fallback` when the tab has no history (direct load). */
@Component({
  selector: 'app-back-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <button type="button" class="back-link" (click)="goBack()">
      <mat-icon class="back-link__icon" aria-hidden="true">arrow_back</mat-icon>
      {{ label() }}
    </button>
  `,
  styleUrl: './back-link.component.scss',
})
export class BackLinkComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  readonly label = input.required<string>();
  readonly fallback = input('/clinician/dashboard');

  goBack(): void {
    // A tab opened straight onto this page has a single entry; back() would do nothing.
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl(this.fallback());
    }
  }
}
