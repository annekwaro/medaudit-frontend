import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { ComplianceBadgeComponent } from '../../../../shared/components/compliance-badge/compliance-badge.component';
import { PatientSummary } from '../../../../shared/models/patient.model';

/** Patient table in an outlined card. The header row only renders when `heading` is set. */
@Component({
  selector: 'app-patient-list-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatCardModule, MatTableModule, MatButtonModule, ComplianceBadgeComponent],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListTableComponent {
  private readonly router = inject(Router);

  readonly patients = input.required<PatientSummary[]>();
  readonly heading = input<string>();
  /** Router link for a "View all" button in the header. */
  readonly viewAllLink = input<string>();

  readonly displayedColumns = ['id', 'name', 'lastSubmission', 'compliance', 'alerts', 'actions'];

  openPatient(patient: PatientSummary, event: MouseEvent): void {
    // Let links/buttons handle their own clicks (incl. ctrl/cmd-click to a new tab),
    // and don't navigate when the user is selecting text.
    const target = event.target as HTMLElement;
    if (target.closest('a, button') || window.getSelection()?.toString()) return;
    this.router.navigate(['/clinician/patient', patient.id]);
  }
}
