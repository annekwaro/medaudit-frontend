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
import { fromEvent, map, merge } from 'rxjs';
import { PatientDataService } from '../../../core/services/patient-data.service';

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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly patients = inject(PatientDataService).patients;

  readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: 'dashboard' },
    { label: 'Patients', icon: 'groups', path: 'patients' },
    { label: 'Audit Log', icon: 'history', path: 'audit-log' },
    { label: 'Settings', icon: 'settings', path: 'settings' },
  ];

  // Hardcoded until an auth/session service exists in core/.
  readonly role = signal<'CLINICIAN'>('CLINICIAN');

  // Site context card. Counts come from the same patient records as the dashboard and Patients page.
  readonly site = 'Site 042 · Grenoble';
  readonly enrolledCount = computed(() => this.patients().length);
  // Every mock patient is active (none withdrawn or completed yet).
  readonly activeCount = computed(() => this.patients().length);

  /** Browser connectivity: the sync line must not claim "Synced" while offline. */
  readonly online = toSignal(
    merge(fromEvent(window, 'online').pipe(map(() => true)), fromEvent(window, 'offline').pipe(map(() => false))),
    { initialValue: navigator.onLine },
  );

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
