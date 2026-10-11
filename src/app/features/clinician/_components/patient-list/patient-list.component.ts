import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { PatientDataService } from '../../../../core/services/patient-data.service';
import { ComplianceBadgeComponent } from '../../../../shared/components/compliance-badge/compliance-badge.component';

@Component({
  selector: 'app-patient-list-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatCardModule, MatTableModule, MatButtonModule, ComplianceBadgeComponent],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss',
})
export class PatientListTableComponent {
  private readonly patientData = inject(PatientDataService);

  readonly displayedColumns = ['id', 'name', 'lastSubmission', 'compliance', 'alerts', 'actions'];
  readonly patients = this.patientData.patients;
}
