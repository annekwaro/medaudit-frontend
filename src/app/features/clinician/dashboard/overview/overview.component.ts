import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

@Component({
  selector: 'app-clinician-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
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

  // Mock: Mon Oct 5 – Sun Oct 11, 2026.
  readonly submissionsTrend = signal<TrendPoint[]>([
    { date: '2026-10-05', value: 8 },
    { date: '2026-10-06', value: 12 },
    { date: '2026-10-07', value: 10 },
    { date: '2026-10-08', value: 14 },
    { date: '2026-10-09', value: 18 },
    { date: '2026-10-10', value: 6 },
    { date: '2026-10-11', value: 9 },
  ]);

  /** Increases only: e.g. "3 new submissions, 2 new alerts, 2 patients flagged". */
  readonly sinceLastVisit = computed(() => {
    const change = this.changes();
    return [
      plural(Math.max(change.unreviewed, 0), 'new submission'),
      plural(Math.max(change.alerts, 0), 'new alert'),
      `${plural(Math.max(change.flaggedPatients, 0), 'patient')} flagged`,
    ].join(', ');
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
