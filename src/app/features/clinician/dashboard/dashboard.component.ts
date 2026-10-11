import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-clinician-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav
        class="shell__sidenav"
        [mode]="sidenavMode()"
        [opened]="sidenavOpened()"
        (openedChange)="sidenavOpened.set($event)"
      >
        <div class="shell__brand">MedAudit</div>
        <mat-nav-list aria-label="Clinician navigation">
          @for (item of navItems; track item.path) {
            <a
              mat-list-item
              [routerLink]="item.path"
              routerLinkActive
              #rla="routerLinkActive"
              [activated]="rla.isActive"
              (click)="onNavigate()"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="shell__main">
        <mat-toolbar class="shell__toolbar">
          <button
            mat-icon-button
            type="button"
            (click)="toggleSidenav()"
            [attr.aria-label]="sidenavOpened() ? 'Close navigation' : 'Open navigation'"
            [attr.aria-expanded]="sidenavOpened()"
          >
            <mat-icon>menu</mat-icon>
          </button>
          <span class="shell__title">Clinician Portal</span>
          <span class="shell__spacer"></span>
          <span class="shell__role-badge" aria-label="Current role">{{ role() }}</span>
          <button mat-icon-button type="button" matTooltip="Log out" aria-label="Log out" (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <main class="shell__content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .shell {
      height: 100%;
    }

    // Dark teal sidebar. Applies in both docked (side) and mobile overlay (over) modes.
    .shell__sidenav {
      --ma-sidenav-fg: rgb(253 249 242 / 0.85);
      --ma-sidenav-fg-strong: var(--mat-sys-surface);
      --ma-sidenav-state-layer: rgb(253 249 242);

      --mat-sidenav-container-width: var(--ma-sidenav-width, 240px);
      --mat-sidenav-container-background-color: var(--mat-sys-primary);
      --mat-sidenav-container-text-color: var(--ma-sidenav-fg);
      // The solid fill separates it from the content; a light hairline would read as a seam.
      --mat-sidenav-container-divider-color: transparent;

      // Inactive links: warm white text/icons, warm-white state layers for hover and focus.
      --mdc-list-list-item-label-text-color: var(--ma-sidenav-fg);
      --mdc-list-list-item-leading-icon-color: var(--ma-sidenav-fg);
      --mdc-list-list-item-hover-label-text-color: var(--ma-sidenav-fg);
      --mdc-list-list-item-hover-leading-icon-color: var(--ma-sidenav-fg);
      --mdc-list-list-item-focus-label-text-color: var(--ma-sidenav-fg);
      --mdc-list-list-item-hover-state-layer-color: var(--ma-sidenav-state-layer);
      --mdc-list-list-item-hover-state-layer-opacity: 0.08;
      --mdc-list-list-item-focus-state-layer-color: var(--ma-sidenav-state-layer);

      // Active link: primary-container pill (shape stays the M3 default, corner-full).
      --mat-list-active-indicator-color: var(--mat-sys-primary-container);
    }

    // M3 has no token for the activated item's text, so scope the label/icon tokens to it.
    .shell__sidenav .mdc-list-item--activated {
      --mdc-list-list-item-label-text-color: var(--mat-sys-on-primary-container);
      --mdc-list-list-item-leading-icon-color: var(--mat-sys-on-primary-container);
      --mdc-list-list-item-hover-label-text-color: var(--mat-sys-on-primary-container);
      --mdc-list-list-item-hover-leading-icon-color: var(--mat-sys-on-primary-container);
      --mdc-list-list-item-focus-label-text-color: var(--mat-sys-on-primary-container);
      --mdc-list-list-item-hover-state-layer-color: var(--mat-sys-on-primary-container);
      --mdc-list-list-item-focus-state-layer-color: var(--mat-sys-on-primary-container);
    }

    // Ease Material's hover state layer in/out, and nudge the icon on hover/focus.
    @media (prefers-reduced-motion: no-preference) {
      .shell__sidenav a[mat-list-item]::before {
        transition: opacity 150ms ease;
      }

      .shell__sidenav a[mat-list-item] mat-icon {
        transition: transform 150ms ease;
      }

      .shell__sidenav a[mat-list-item]:hover mat-icon,
      .shell__sidenav a[mat-list-item]:focus-visible mat-icon {
        transform: scale(1.05);
      }
    }

    // M3 rounds the drawer's trailing corners; square them when docked full-height.
    .shell__sidenav.mat-drawer-side {
      --mat-sidenav-container-shape: 0;
    }

    .shell__brand {
      padding: 20px 16px 12px;
      font: var(--ma-type-logo);
      letter-spacing: -0.01em;
      color: var(--ma-sidenav-fg-strong);
    }

    .shell__main {
      display: flex;
      flex-direction: column;
    }

    .shell__toolbar {
      // Own view-transition layer, so the fading content can't paint over it.
      view-transition-name: shell-toolbar;
      --mat-toolbar-container-background-color: var(--mat-sys-surface);
      --mat-toolbar-container-text-color: var(--mat-sys-on-surface);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      position: sticky;
      top: 0;
      z-index: 2;
      gap: 8px;
    }

    .shell__title {
      font: var(--mat-sys-title-medium);
      letter-spacing: var(--mat-sys-title-medium-tracking);
    }

    .shell__spacer {
      flex: 1 1 auto;
    }

    .shell__role-badge {
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      line-height: 1.5;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .shell__content {
      // Route fade target (see withClinicianRouteTransitions + styles.scss).
      view-transition-name: shell-content;
      flex: 1 1 auto;
      padding: var(--ma-content-padding, 24px);
    }
  `,
})
export class DashboardComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: 'dashboard' },
    { label: 'Patients', icon: 'groups', path: 'patients' },
    { label: 'Audit Log', icon: 'history', path: 'audit-log' },
    { label: 'Settings', icon: 'settings', path: 'settings' },
  ];

  // Hardcoded until an auth/session service exists in core/.
  readonly role = signal<'CLINICIAN'>('CLINICIAN');

  private readonly isHandset = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  readonly sidenavMode = computed(() => (this.isHandset() ? 'over' : 'side'));
  readonly sidenavOpened = signal(true);

  constructor() {
    // Collapse the drawer on small screens, re-open it when returning to desktop.
    effect(
      () => {
        this.sidenavOpened.set(!this.isHandset());
      },
      { allowSignalWrites: true },
    );
  }

  toggleSidenav(): void {
    this.sidenavOpened.update((opened) => !opened);
  }

  onNavigate(): void {
    if (this.isHandset()) {
      this.sidenavOpened.set(false);
    }
  }

  logout(): void {
    // TODO: delegate to AuthService (clear session, redirect to login) once it exists.
  }
}
