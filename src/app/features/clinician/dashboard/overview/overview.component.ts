import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DashboardFigures, PatientDataService } from '../../../../core/services/patient-data.service';
import { PatientProfile } from '../../../../shared/models/patient.model';
import { StatsCardComponent, StatsSeverity } from '../../../../shared/components/stats-card/stats-card.component';
import { PatientListTableComponent } from '../../_components/patient-list/patient-list.component';
import { PatientQuickView } from '../../patients/patients.component';
import { TrendChartComponent, TrendPoint } from '../_components/trend-chart/trend-chart.component';
import { VisitBannerComponent } from '../_components/visit-banner/visit-banner.component';

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

// Mock series, consistent with each other: today (Sun Oct 11) totals 9, matching Sunday in the
// weekly series, and the latest week totals 77, matching the weekly total.
const SUBMISSION_TRENDS: Record<TrendPeriod, { heading: string; points: TrendPoint[] }> = {
  daily: {
    heading: 'Submissions today',
    points: [
      { label: '00:00', detail: 'Sun, Oct 11 · 00:00–04:00', value: 0 },
      { label: '04:00', detail: 'Sun, Oct 11 · 04:00–08:00', value: 1 },
      { label: '08:00', detail: 'Sun, Oct 11 · 08:00–12:00', value: 5 },
      { label: '12:00', detail: 'Sun, Oct 11 · 12:00–16:00', value: 3 },
    ],
  },
  weekly: {
    heading: 'Submissions this week',
    points: [
      { label: 'Mon', detail: 'Mon, Oct 5', value: 8 },
      { label: 'Tue', detail: 'Tue, Oct 6', value: 12 },
      { label: 'Wed', detail: 'Wed, Oct 7', value: 10 },
      { label: 'Thu', detail: 'Thu, Oct 8', value: 14 },
      { label: 'Fri', detail: 'Fri, Oct 9', value: 18 },
      { label: 'Sat', detail: 'Sat, Oct 10', value: 6 },
      { label: 'Sun', detail: 'Sun, Oct 11', value: 9 },
    ],
  },
  monthly: {
    heading: 'Submissions, last 4 weeks',
    points: [
      { label: 'Sep 14', detail: 'Week of Sep 14', value: 64 },
      { label: 'Sep 21', detail: 'Week of Sep 21', value: 71 },
      { label: 'Sep 28', detail: 'Week of Sep 28', value: 69 },
      { label: 'Oct 5', detail: 'Week of Oct 5', value: 77 },
    ],
  },
};

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

@Component({
  selector: 'app-clinician-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    StatsCardComponent,
    PatientListTableComponent,
    TrendChartComponent,
    VisitBannerComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  private readonly patientData = inject(PatientDataService);
  readonly patients = this.patientData.patients;

  readonly updatedAt = signal(new Date());
  readonly refreshing = signal(false);

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
      flaggedPatients: patients.filter((p) => p.compliance === 'missing').length,
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
      flaggedPatients: today.flaggedPatients - yesterday.flaggedPatients,
    };
  });

  readonly stats = computed<StatSummary[]>(() => {
    const today = this.figures();
    const change = this.changes();
    return [
      {
        label: 'Unreviewed', value: today.unreviewed, delta: formatDelta(change.unreviewed), severity: 'warning', icon: 'pending_actions', higherIsBetter: false,
        filter: 'unreviewed', linkLabel: 'View unreviewed submissions', valueUnit: 'items',
      },
      {
        label: 'Alerts', value: today.alerts, delta: formatDelta(change.alerts), severity: 'critical', icon: 'notifications_active', higherIsBetter: false, pulse: today.alerts > 0,
        filter: 'alerts', linkLabel: 'View patients with alerts', valueUnit: 'alerts',
      },
      {
        label: 'Active Patients', value: today.activePatients, delta: formatDelta(change.activePatients), severity: 'info', icon: 'groups', higherIsBetter: true,
        linkLabel: 'View all patients', valueUnit: 'patients',
      },
      {
        label: 'Compliance', value: `${today.compliancePercent}%`, delta: formatDelta(change.compliancePercent, '%'), severity: complianceSeverity(today.compliancePercent), icon: 'task_alt', higherIsBetter: true,
        filter: 'compliance', linkLabel: 'View patients by lowest compliance', valueUnit: 'compliance',
      },
    ];
  });

  readonly trendPeriodOptions: { value: TrendPeriod; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];
  readonly trendPeriod = signal<TrendPeriod>('weekly');
  readonly submissionsTrend = computed(() => SUBMISSION_TRENDS[this.trendPeriod()]);

  /** Increases only: e.g. "3 new submissions since yesterday. 2 patients flagged." */
  readonly sinceLastVisit = computed(() => {
    const change = this.changes();
    const submissions = plural(Math.max(change.unreviewed, 0), 'new submission');
    const flagged = plural(Math.max(change.flaggedPatients, 0), 'patient');
    return `${submissions} since yesterday. ${flagged} flagged.`;
  });

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
}
