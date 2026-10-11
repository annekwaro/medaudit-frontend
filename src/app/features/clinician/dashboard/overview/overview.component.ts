import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { PatientDataService } from '../../../../core/services/patient-data.service';
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

type DateRange = 'today' | '7d' | '30d';

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
  readonly patients = inject(PatientDataService).patients;

  readonly dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
  ];
  /** Cosmetic for now: the mock data below doesn't filter by it yet. */
  readonly dateRange = signal<DateRange>('7d');

  readonly updatedAt = signal(new Date());
  readonly refreshing = signal(false);

  // Mock data until the stats API exists.
  readonly stats = signal<StatSummary[]>([
    {
      label: 'Unreviewed', value: 12, delta: '+3 from yesterday', severity: 'warning', icon: 'pending_actions', higherIsBetter: false,
      filter: 'unreviewed', linkLabel: 'View unreviewed submissions', valueUnit: 'items',
    },
    {
      label: 'Alerts', value: 4, delta: '+2 from yesterday', severity: 'critical', icon: 'notifications_active', higherIsBetter: false, pulse: true,
      filter: 'alerts', linkLabel: 'View patients with alerts', valueUnit: 'alerts',
    },
    {
      label: 'Active Patients', value: 87, delta: '0 from yesterday', severity: 'info', icon: 'groups', higherIsBetter: true,
      linkLabel: 'View all patients', valueUnit: 'patients',
    },
    {
      label: 'Compliance', value: '94%', delta: '-2% from yesterday', severity: 'success', icon: 'task_alt', higherIsBetter: true,
      filter: 'compliance', linkLabel: 'View patients by lowest compliance', valueUnit: 'compliance',
    },
  ]);

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

  readonly sinceLastVisit = '3 new submissions, 2 new alerts, 2 patients flagged';

  /** Visual only: spins the icon once. With reduced motion there's nothing to show. */
  refresh(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.refreshing.set(true);
  }
}
