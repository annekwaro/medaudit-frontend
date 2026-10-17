import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientDataService } from '../../../core/services/patient-data.service';
import { BackLinkComponent } from '../../../shared/components/back-link/back-link.component';
import { COMPLIANCE_LABELS, COMPLIANCE_STATUSES, ComplianceStatus, PatientProfile } from '../../../shared/models/patient.model';
import { PatientListTableComponent } from '../_components/patient-list/patient-list.component';

/** Preset views linked from the dashboard stats cards via `?filter=`. */
export type PatientQuickView = 'unreviewed' | 'alerts' | 'compliance';

export const QUICK_VIEWS: readonly PatientQuickView[] = ['unreviewed', 'alerts', 'compliance'];

export const QUICK_VIEW_LABELS: Record<PatientQuickView, string> = {
  unreviewed: 'Pending review',
  alerts: 'Has alerts',
  compliance: 'Lowest compliance first',
};

type ShowFilter = 'all' | ComplianceStatus | PatientQuickView;

function isQuickView(value: string | null): value is PatientQuickView {
  return (QUICK_VIEWS as readonly string[]).includes(value ?? '');
}

/** Submitted share of expected diaries over the last 30 days. */
function submissionRate({ submissions30d: { submitted, missed } }: PatientProfile): number {
  const expected = submitted + missed;
  return expected ? submitted / expected : 1;
}

@Component({
  selector: 'app-patients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    PatientListTableComponent,
    BackLinkComponent,
  ],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
})
export class PatientsComponent {
  private readonly patientData = inject(PatientDataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly statuses = COMPLIANCE_STATUSES;
  readonly statusLabels = COMPLIANCE_LABELS;
  readonly quickViews = QUICK_VIEWS;
  readonly quickViewLabels = QUICK_VIEW_LABELS;

  readonly searchTerm = signal('');
  readonly showFilter = signal<ShowFilter>('all');

  /** Arrived from a dashboard stats card. Captured once, so clearing ?filter= later keeps the link. */
  readonly arrivedWithFilter = this.route.snapshot.queryParamMap.has('filter');

  constructor() {
    // Apply ?filter= from the dashboard cards. An absent param leaves the current choice alone,
    // so clearing it after a manual change doesn't reset the dropdown.
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const filter = params.get('filter');
      if (isQuickView(filter)) this.showFilter.set(filter);
    });
  }

  readonly patients = this.patientData.patients;
  readonly totalCount = computed(() => this.patients().length);

  readonly filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const show = this.showFilter();
    const matches = this.patients().filter((patient) => {
      if (term && !patient.name.toLowerCase().includes(term) && !patient.id.toLowerCase().includes(term)) return false;
      switch (show) {
        case 'all':
        case 'compliance':
          return true;
        case 'unreviewed':
          return patient.pendingSubmissions > 0;
        case 'alerts':
          return patient.alerts > 0;
        default:
          return patient.compliance === show;
      }
    });
    return show === 'compliance' ? matches.sort((a, b) => submissionRate(a) - submissionRate(b)) : matches;
  });

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
    this.clearFilterParam();
  }

  setShowFilter(filter: ShowFilter): void {
    this.showFilter.set(filter);
    this.clearFilterParam();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.showFilter.set('all');
    this.clearFilterParam();
  }

  /** Drop ?filter= once the user takes over, so the URL no longer claims a preset view. */
  private clearFilterParam(): void {
    if (!this.route.snapshot.queryParamMap.has('filter')) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  addPatient(): void {
    this.snackBar.open('Patient enrollment coming soon', undefined, { duration: 3000 });
  }
}
