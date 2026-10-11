import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PatientDataService } from '../../../../core/services/patient-data.service';
import { StatsCardComponent, StatsSeverity } from '../../../../shared/components/stats-card/stats-card.component';
import { PatientListTableComponent } from '../../_components/patient-list/patient-list.component';

interface StatSummary {
  label: string;
  value: string | number;
  delta?: string;
  severity: StatsSeverity;
  icon: string;
  higherIsBetter: boolean;
  pulse?: boolean;
}

@Component({
  selector: 'app-clinician-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatsCardComponent, PatientListTableComponent],
  template: `
    <h1>Dashboard</h1>

    <section class="stats-grid" aria-label="Summary statistics">
      @for (stat of stats(); track stat.label; let i = $index) {
        <app-stats-card
          [style.--stagger-index]="i"
          [label]="stat.label"
          [value]="stat.value"
          [delta]="stat.delta"
          [severity]="stat.severity"
          [icon]="stat.icon"
          [higherIsBetter]="stat.higherIsBetter"
          [pulse]="stat.pulse ?? false"
        />
      }
    </section>

    <app-patient-list-table
      class="patient-list rise-in"
      [style.--rise-index]="stats().length"
      heading="Recent Submissions"
      viewAllLink="/clinician/patients"
      [patients]="patients()"
      [staggerRows]="true"
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
      // Rows start staggering as the card itself begins its entrance (index 4 × 60ms).
      --rows-enter-delay: 240ms;
    }

    // Page-load entrance: fade in + rise 8px, staggered 60ms per item.
    @media (prefers-reduced-motion: no-preference) {
      .rise-in {
        animation: rise-in 250ms ease-out both;
        animation-delay: calc(var(--rise-index, 0) * 60ms);
      }
    }

    @keyframes rise-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }

    // Stats card entrance stagger: 0 / 60 / 120 / 180ms.
    .stats-grid > app-stats-card {
      --stats-card-enter-delay: calc(var(--stagger-index, 0) * 60ms);
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
    { label: 'Unreviewed', value: 12, delta: '+3 from yesterday', severity: 'warning', icon: 'pending_actions', higherIsBetter: false },
    { label: 'Alerts', value: 4, delta: '+2 from yesterday', severity: 'critical', icon: 'notifications_active', higherIsBetter: false, pulse: true },
    { label: 'Active Patients', value: 87, delta: '0 from yesterday', severity: 'info', icon: 'groups', higherIsBetter: true },
    { label: 'Compliance', value: '94%', delta: '-2% from yesterday', severity: 'success', icon: 'task_alt', higherIsBetter: true },
  ]);
}
