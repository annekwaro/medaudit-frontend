import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientDataService } from '../../../core/services/patient-data.service';
import { COMPLIANCE_LABELS, COMPLIANCE_STATUSES, ComplianceStatus } from '../../../shared/models/patient.model';
import { PatientListTableComponent } from '../_components/patient-list/patient-list.component';

@Component({
  selector: 'app-patients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    PatientListTableComponent,
  ],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.scss',
})
export class PatientsComponent {
  private readonly patientData = inject(PatientDataService);
  private readonly snackBar = inject(MatSnackBar);

  readonly statuses = COMPLIANCE_STATUSES;
  readonly statusLabels = COMPLIANCE_LABELS;

  readonly searchTerm = signal('');
  readonly statusFilter = signal<ComplianceStatus | 'all'>('all');

  readonly patients = this.patientData.patients;
  readonly totalCount = computed(() => this.patients().length);

  readonly filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.patients().filter(
      (patient) =>
        (status === 'all' || patient.compliance === status) &&
        (!term || patient.name.toLowerCase().includes(term) || patient.id.toLowerCase().includes(term)),
    );
  });

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
  }

  addPatient(): void {
    this.snackBar.open('Patient enrollment coming soon', undefined, { duration: 3000 });
  }
}
