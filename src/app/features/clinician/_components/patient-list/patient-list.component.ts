import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { ComplianceBadgeComponent } from '../../../../shared/components/compliance-badge/compliance-badge.component';
import { PatientSummary } from '../../../../shared/models/patient.model';

/** Patient table in an outlined card. The header row only renders when `heading` is set. */
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
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListTableComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly patients = input.required<PatientSummary[]>();
  readonly heading = input<string>();
  /** Router link for a "View all" button in the header. */
  readonly viewAllLink = input<string>();
  /** Fade + slide rows in on first render, 40ms apart. Offset the start with --rows-enter-delay. */
  readonly staggerRows = input(false);

  readonly displayedColumns = ['id', 'name', 'lastSubmission', 'compliance', 'alerts', 'actions'];

  /** Placeholder actions until the backend exists. Patients are never deleted (ICH-GCP): archive only. */
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
