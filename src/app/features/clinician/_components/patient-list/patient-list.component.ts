import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { UserPreferencesService } from '../../../../core/services/user-preferences.service';
import { ComplianceBadgeComponent } from '../../../../shared/components/compliance-badge/compliance-badge.component';
import { PatientSummary } from '../../../../shared/models/patient.model';

export type RowReasonTone = 'critical' | 'warning' | 'info';

/** Short "why this row matters" chip, e.g. { label: '3 alerts', tone: 'critical', icon: 'notifications_active' }. */
export interface RowReason {
  label: string;
  tone: RowReasonTone;
  /** Material icon name; decorative, the label carries the meaning. */
  icon: string;
}

/**
 * Patient table in an outlined card. The header row only renders when `heading` is set;
 * extra header controls can be projected next to "View all" with `[patientListActions]`.
 */
@Component({
  selector: 'app-patient-list-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    ComplianceBadgeComponent,
  ],
  host: { '[class.patient-list-host--compact]': 'preferences.compactRows()' },
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListTableComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  readonly preferences = inject(UserPreferencesService);

  readonly patients = input.required<PatientSummary[]>();
  readonly heading = input<string>();
  /** Router link for a "View all" button in the header. */
  readonly viewAllLink = input<string>();
  /** Fade + slide rows in on first render, 40ms apart. Offset the start with --rows-enter-delay. */
  readonly staggerRows = input(false);

  /**
   * Reason chips per patient ID. When set, a Reason column replaces Last Submission and Alerts
   * (alert counts appear as a reason instead).
   */
  readonly reasons = input<ReadonlyMap<string, readonly RowReason[]>>();

  readonly displayedColumns = computed(() =>
    this.reasons()
      ? ['id', 'name', 'reasons', 'compliance', 'actions']
      : ['id', 'name', 'lastSubmission', 'compliance', 'alerts', 'actions'],
  );

  /** Placeholder actions until the backend exists: messages must say nothing was saved. Patients are never deleted (ICH-GCP): archive only. */
  notify(message: string): void {
    this.snackBar.open(message, undefined, { duration: 3000 });
  }

  openPatient(patient: PatientSummary, event: MouseEvent): void {
    // Let links/buttons handle their own clicks (incl. ctrl/cmd-click to a new tab),
    // and don't navigate when the user is selecting text.
    const target = event.target as HTMLElement;
    if (target.closest('a, button') || window.getSelection()?.toString()) return;
    this.router.navigate(['/clinician/patient', patient.id]);
  }
}
