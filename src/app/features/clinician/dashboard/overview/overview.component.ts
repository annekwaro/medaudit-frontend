import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PatientDataService } from '../../../../core/services/patient-data.service';
import { StatsCardComponent, StatsSeverity } from '../../../../shared/components/stats-card/stats-card.component';
import { PatientListTableComponent } from '../../_components/patient-list/patient-list.component';

interface StatSummary {
  label: string;
  value: string | number;
  delta?: string;
  severity: StatsSeverity;
  higherIsBetter: boolean;
}

@Component({
  selector: 'app-clinician-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatsCardComponent, PatientListTableComponent],
  template: `
    <h1>Dashboard</h1>

    <section class="stats-grid" aria-label="Summary statistics">
      @for (stat of stats(); track stat.label) {
        <app-stats-card
          [label]="stat.label"
          [value]="stat.value"
          [delta]="stat.delta"
          [severity]="stat.severity"
          [higherIsBetter]="stat.higherIsBetter"
        />
      }
    </section>

    <app-patient-list-table
      class="patient-list"
      heading="Recent Submissions"
      viewAllLink="/clinician/patients"
      [patients]="patients()"
    />
  `,
  styles: `
    :host {
      display: block;
      // Size the grid by the content area, not the viewport: the docked sidenav takes 240px.
      container-type: inline-size;
    }

    .patient-list {
      margin-top: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }

    // Tablet: 2 columns.
    @container (max-width: 900px) {
      .stats-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    // Mobile: 1 column.
    @container (max-width: 520px) {
      .stats-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class OverviewComponent {
  readonly patients = inject(PatientDataService).patients;

  // Mock data until the stats API exists.
  readonly stats = signal<StatSummary[]>([
    { label: 'Unreviewed', value: 12, delta: '+3 from yesterday', severity: 'warning', higherIsBetter: false },
    { label: 'Alerts', value: 4, delta: '+2 from yesterday', severity: 'critical', higherIsBetter: false },
    { label: 'Active Patients', value: 87, delta: '0 from yesterday', severity: 'info', higherIsBetter: true },
    { label: 'Compliance', value: '94%', delta: '-2% from yesterday', severity: 'info', higherIsBetter: true },
  ]);
}
