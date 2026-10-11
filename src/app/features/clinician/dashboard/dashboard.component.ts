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
  // Required on Angular 17; remove once the project is on Angular 19+.
  standalone: true,
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
        <mat-toolbar color="primary" class="shell__toolbar">
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

    .shell__sidenav {
      width: var(--ma-sidenav-width, 240px);
    }

    .shell__brand {
      padding: 20px 16px 12px;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--ma-color-brand, #3f51b5);
    }

    .shell__main {
      display: flex;
      flex-direction: column;
    }

    .shell__toolbar {
      position: sticky;
      top: 0;
      z-index: 2;
      gap: 8px;
    }

    .shell__title {
      font-size: 1.1rem;
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
      background: var(--ma-role-badge-bg, rgba(255, 255, 255, 0.2));
      color: inherit;
    }

    .shell__content {
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
