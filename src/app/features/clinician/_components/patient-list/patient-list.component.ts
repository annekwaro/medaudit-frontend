import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

export type ComplianceStatus = 'on-track' | 'late' | 'missing';

export interface PatientSubmission {
  id: string;
  name: string;
  lastSubmission: string | null;
  compliance: ComplianceStatus;
  alerts: number;
}

const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  'on-track': 'On Track',
  late: 'Late',
  missing: 'Missing',
};

@Component({
  selector: 'app-patient-list-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatCardModule, MatTableModule, MatButtonModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListTableComponent {
  readonly displayedColumns = ['id', 'name', 'lastSubmission', 'compliance', 'alerts', 'actions'];

  // Mock data until the submissions API exists.
  readonly patients = signal<PatientSubmission[]>([
    { id: 'PT-1042', name: 'Amara Okafor', lastSubmission: '2026-10-11T08:14:00', compliance: 'on-track', alerts: 0 },
    { id: 'PT-1057', name: 'Daniel Mwangi', lastSubmission: '2026-10-10T19:42:00', compliance: 'late', alerts: 1 },
    { id: 'PT-1063', name: 'Sofia Lindqvist', lastSubmission: '2026-10-07T09:05:00', compliance: 'missing', alerts: 3 },
    { id: 'PT-1071', name: 'Hiroshi Tanaka', lastSubmission: '2026-10-11T07:30:00', compliance: 'on-track', alerts: 0 },
    { id: 'PT-1088', name: 'Grace Achieng', lastSubmission: '2026-10-09T21:18:00', compliance: 'late', alerts: 0 },
    { id: 'PT-1094', name: 'Mateo Fernández', lastSubmission: null, compliance: 'missing', alerts: 2 },
  ]);

  // matCellDef rows are untyped in templates, so resolve display values here.
  readonly rows = computed(() =>
    this.patients().map((patient) => ({ ...patient, complianceLabel: COMPLIANCE_LABELS[patient.compliance] })),
  );
}
