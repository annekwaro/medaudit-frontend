import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardFigures, PatientDataService } from '../../../../core/services/patient-data.service';
import { PatientProfile } from '../../../../shared/models/patient.model';
import { MicroVizType } from '../../../../shared/components/micro-viz/micro-viz.component';
import { StatsCardComponent, StatsSeverity } from '../../../../shared/components/stats-card/stats-card.component';
import { PatientListTableComponent } from '../../_components/patient-list/patient-list.component';
import { PatientQuickView } from '../../patients/patients.component';
import { TrendChartComponent, TrendPoint } from '../_components/trend-chart/trend-chart.component';
import { UpcomingVisitsComponent } from '../_components/upcoming-visits/upcoming-visits.component';
import { sortByUrgency, urgencyReasons } from './needs-attention';

interface StatSummary {
  label: string;
  value: string | number;
  delta?: string;
  severity: StatsSeverity;
  icon: string;
  higherIsBetter: boolean;
  pulse?: boolean;
  /** Patients page quick view; omitted for an unfiltered list. */
  filter?: PatientQuickView;
  linkLabel: string;
  valueUnit: string;
  vizType: MicroVizType;
  vizValues: readonly number[];
}

/** "+3 from yesterday", "0 from yesterday", "-2% from yesterday". */
function formatDelta(change: number, unit = ''): string {
  return `${change > 0 ? '+' : ''}${change}${unit} from yesterday`;
}

/** Same bands as the patient detail page: >= 90% on track, 70-89% late, < 70% missing. */
function complianceSeverity(percent: number): StatsSeverity {
  return percent >= 90 ? 'success' : percent >= 70 ? 'warning' : 'critical';
}

type TrendPeriod = 'daily' | 'weekly' | 'monthly';

/** Mock submission counts, oldest first; the last entry ends today. */
const TREND_VALUES = {
  /** Today in 4-hour slots so far; totals 9. */
  daily: [0, 1, 5, 3],
  /** The last 7 days; today (9) matches the daily total, and the 7 days total 77. */
  weekly: [8, 12, 10, 14, 18, 6, 9],
  /** Four 7-day blocks; the last one is the weekly series (77). */
  monthly: [64, 71, 69, 77],
} as const satisfies Record<TrendPeriod, readonly number[]>;

/**
 * Mock scheduled questionnaires for the same periods: 14 a day across the 6 patients, 12 of them due
 * by 16:00. The two oldest weeks are lower because PT-1094 enrolled on Sep 30. This week comes to
 * 77 of 98 (79%), close to the 30-day compliance figure.
 */
const TREND_EXPECTED = {
  daily: [0, 2, 6, 4],
  weekly: [14, 14, 14, 14, 14, 14, 14],
  monthly: [84, 84, 98, 98],
} as const satisfies Record<TrendPeriod, readonly number[]>;

/** Parses an ISO date (yyyy-MM-dd) as a local date, `offsetDays` from it. */
function localDate(iso: string, offsetDays = 0): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day + offsetDays);
}

const formatDay = (date: Date, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString('en-US', options);

/** Chart series with labels counted back from the mock "today", so they always agree with it. */
function buildSubmissionTrends(today: string): Record<TrendPeriod, { heading: string; points: TrendPoint[] }> {
  const todayDetail = formatDay(localDate(today), { weekday: 'short', month: 'short', day: 'numeric' });
  const daily = TREND_VALUES.daily.map((value, i) => {
    const from = `${String(i * 4).padStart(2, '0')}:00`;
    const to = `${String(i * 4 + 4).padStart(2, '0')}:00`;
    return { label: from, detail: `${todayDetail} · ${from}–${to}`, value, expected: TREND_EXPECTED.daily[i] };
  });
  const weekly = TREND_VALUES.weekly.map((value, i, all) => {
    const date = localDate(today, i - (all.length - 1));
    return {
      label: formatDay(date, { weekday: 'short' }),
      detail: formatDay(date, { weekday: 'short', month: 'short', day: 'numeric' }),
      value,
      expected: TREND_EXPECTED.weekly[i],
    };
  });
  const monthly = TREND_VALUES.monthly.map((value, i, all) => {
    const end = localDate(today, (i - (all.length - 1)) * 7);
    const start = localDate(today, (i - (all.length - 1)) * 7 - 6);
    const startLabel = formatDay(start, { month: 'short', day: 'numeric' });
    const detail = `${startLabel} – ${formatDay(end, { month: 'short', day: 'numeric' })}`;
    return { label: startLabel, detail, value, expected: TREND_EXPECTED.monthly[i] };
  });
  return {
    daily: { heading: 'Submissions today', points: daily },
    weekly: { heading: 'Submissions, last 7 days', points: weekly },
    monthly: { heading: 'Submissions, last 4 weeks', points: monthly },
  };
}

@Component({
  selector: 'app-clinician-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    A11yModule,
    OverlayModule,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    StatsCardComponent,
    PatientListTableComponent,
    TrendChartComponent,
    UpcomingVisitsComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly patientData = inject(PatientDataService);
  readonly patients = this.patientData.patients;
  readonly today = this.patientData.today;

  private readonly snackBar = inject(MatSnackBar);

  readonly updatedAt = signal(new Date());
  readonly refreshing = signal(false);

  // Filter popover on the Needs attention table.
  readonly filterOpen = signal(false);
  readonly onlyWithAlerts = signal(false);
  readonly onlyLate = signal(false);
  readonly filtersActive = computed(() => this.onlyWithAlerts() || this.onlyLate());

  /** Most urgent first (see sortByUrgency), narrowed by the filter popover. */
  readonly needsAttention = computed(() =>
    sortByUrgency(
      this.patients().filter(
        (patient) => (!this.onlyWithAlerts() || patient.alerts > 0) && (!this.onlyLate() || patient.compliance === 'late'),
      ),
      this.today,
    ),
  );

  /** Reason chips for the Needs attention table, by patient ID. */
  readonly attentionReasons = computed(
    () => new Map(this.patients().map((patient) => [patient.id, urgencyReasons(patient, this.today)])),
  );

  /** Today's figures, derived from the same patient records as the table and the quick views. */
  private readonly figures = computed<DashboardFigures>(() => {
    const patients = this.patients();
    const sum = (value: (patient: PatientProfile) => number) => patients.reduce((total, p) => total + value(p), 0);
    const submitted = sum((p) => p.submissions30d.submitted);
    const expected = submitted + sum((p) => p.submissions30d.missed);
    return {
      unreviewed: sum((p) => p.pendingSubmissions),
      alerts: sum((p) => p.alerts),
      activePatients: patients.length,
      compliancePercent: expected ? Math.round((submitted / expected) * 100) : 100,
    };
  });

  /** Today minus yesterday's snapshot. */
  private readonly changes = computed(() => {
    const today = this.figures();
    const yesterday = this.patientData.yesterdayFigures;
    return {
      unreviewed: today.unreviewed - yesterday.unreviewed,
      alerts: today.alerts - yesterday.alerts,
      activePatients: today.activePatients - yesterday.activePatients,
      compliancePercent: today.compliancePercent - yesterday.compliancePercent,
    };
  });

  readonly stats = computed<StatSummary[]>(() => {
    const today = this.figures();
    const change = this.changes();
    const history = this.patientData.previousSixDays;
    return [
      {
        label: 'Unreviewed', value: today.unreviewed, delta: formatDelta(change.unreviewed), severity: today.unreviewed > 0 ? 'warning' : 'success', icon: 'pending_actions', higherIsBetter: false,
        filter: 'unreviewed', linkLabel: 'View unreviewed submissions', valueUnit: 'items',
        vizType: 'bars', vizValues: [...history.newSubmissions, Math.max(change.unreviewed, 0)],
      },
      {
        label: 'Alerts', value: today.alerts, delta: formatDelta(change.alerts), severity: today.alerts > 0 ? 'critical' : 'success', icon: 'notifications_active', higherIsBetter: false, pulse: today.alerts > 0,
        filter: 'alerts', linkLabel: 'View patients with alerts', valueUnit: 'alerts',
        vizType: 'dots', vizValues: [...history.newAlerts, Math.max(change.alerts, 0)],
      },
      {
        label: 'Active Patients', value: today.activePatients, delta: formatDelta(change.activePatients), severity: 'info', icon: 'groups', higherIsBetter: true,
        linkLabel: 'View all patients', valueUnit: 'patients',
        vizType: 'sparkline', vizValues: [...history.activePatients, today.activePatients],
      },
      {
        label: 'Compliance', value: `${today.compliancePercent}%`, delta: formatDelta(change.compliancePercent, '%'), severity: complianceSeverity(today.compliancePercent), icon: 'task_alt', higherIsBetter: true,
        filter: 'compliance', linkLabel: 'View patients by lowest compliance', valueUnit: 'compliance',
        vizType: 'progress', vizValues: [today.compliancePercent],
      },
    ];
  });

  readonly trendPeriodOptions: { value: TrendPeriod; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];
  readonly trendPeriod = signal<TrendPeriod>('weekly');
  private readonly submissionTrends = buildSubmissionTrends(this.today);
  readonly submissionsTrend = computed(() => this.submissionTrends[this.trendPeriod()]);

  /**
   * Mock data is local and always current, so a refresh only re-stamps the time.
   * TODO: refetch once the stats API exists.
   */
  refresh(): void {
    this.updatedAt.set(new Date());
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.refreshing.set(true);
    }
  }

  resetFilters(): void {
    this.onlyWithAlerts.set(false);
    this.onlyLate.set(false);
  }

  exportData(): void {
    this.snackBar.open('Export coming soon', undefined, { duration: 3000 });
  }
}
