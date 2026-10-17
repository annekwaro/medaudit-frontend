import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, fromEvent, map, merge } from 'rxjs';
import { PatientDataService } from '../../../core/services/patient-data.service';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

/** One step of the toolbar breadcrumb; the last has no link (it's the current page). */
interface Crumb {
  label: string;
  link: string | null;
}

@Component({
  selector: 'app-clinician-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TitleCasePipe,
    AvatarComponent,
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
  private readonly patientData = inject(PatientDataService);
  private readonly patients = this.patientData.patients;
  private readonly router = inject(Router);

  readonly navItems: readonly NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: 'dashboard' },
    { label: 'Patients', icon: 'groups', path: 'patients' },
    { label: 'Audit Log', icon: 'history', path: 'audit-log' },
    { label: 'Settings', icon: 'settings', path: 'settings' },
  ];

  // Hardcoded until an auth/session service exists in core/.
  readonly role = signal<'CLINICIAN'>('CLINICIAN');
  readonly userName = signal('Dr. Sarah Martin');

  // Site context card. Counts come from the same patient records as the dashboard and Patients page.
  readonly site = 'Site 042 · Grenoble';
  readonly enrolledCount = computed(() => this.patients().length);
  // Every mock patient is active (none withdrawn or completed yet).
  readonly activeCount = computed(() => this.patients().length);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /**
   * Toolbar breadcrumb: the section, then the patient on a patient page
   * ("Patients / Sofia Lindqvist"). Patient pages sit under Patients, wherever they were opened from.
   */
  readonly crumbs = computed<Crumb[]>(() => {
    const [section, id] = this.url().split(/[?#]/)[0].split('/').slice(2);
    if (section === 'patient' && id) {
      const patient = this.patientData.getPatient(id);
      return [
        { label: 'Patients', link: '/clinician/patients' },
        { label: patient?.name ?? id, link: null },
      ];
    }
    const item = this.navItems.find((nav) => nav.path === section);
    return item ? [{ label: item.label, link: null }] : [];
  });

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
