import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientDataService } from '../../../core/services/patient-data.service';
import { AuditEntryComponent } from '../../../shared/components/audit-entry/audit-entry.component';
import { AUDIT_ACTION_LABELS, AUDIT_ACTIONS, AuditAction } from '../../../shared/models/audit.model';

type DateFilter = '7d' | '30d' | 'all';

const DATE_FILTER_DAYS: Record<DateFilter, number | null> = { '7d': 7, '30d': 30, all: null };

const DAY_MS = 24 * 60 * 60 * 1000;

@Component({
  selector: 'app-audit-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    AuditEntryComponent,
  ],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss',
})
export class AuditLogComponent {
  private readonly patientData = inject(PatientDataService);
  private readonly snackBar = inject(MatSnackBar);

  readonly patients = this.patientData.patients;
  readonly actions = AUDIT_ACTIONS;
  readonly actionLabels = AUDIT_ACTION_LABELS;
  readonly dateOptions: { value: DateFilter; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'all', label: 'All time' },
  ];

  readonly searchTerm = signal('');
  readonly patientFilter = signal<string>('all');
  readonly actionFilter = signal<AuditAction | 'all'>('all');
  readonly dateFilter = signal<DateFilter>('all');

  readonly hasActiveFilters = computed(
    () =>
      this.searchTerm().trim() !== '' ||
      this.patientFilter() !== 'all' ||
      this.actionFilter() !== 'all' ||
      this.dateFilter() !== 'all',
  );

  /** All entries joined with their patient, newest first. */
  private readonly allEntries = computed(() => {
    const patientsById = new Map(this.patients().map((patient) => [patient.id, patient]));
    return this.patientData
      .getAllAuditEntries()
      .map((entry) => ({
        entry,
        patient: patientsById.get(entry.patientId) ?? { id: entry.patientId, name: 'Unknown patient' },
      }))
      .sort((a, b) => Date.parse(b.entry.timestamp) - Date.parse(a.entry.timestamp));
  });

  readonly totalCount = computed(() => this.allEntries().length);

  readonly filteredEntries = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const patientId = this.patientFilter();
    const action = this.actionFilter();
    const days = DATE_FILTER_DAYS[this.dateFilter()];
    const cutoff = days === null ? null : Date.now() - days * DAY_MS;

    return this.allEntries().filter(({ entry, patient }) => {
      if (patientId !== 'all' && entry.patientId !== patientId) return false;
      if (action !== 'all' && entry.action !== action) return false;
      if (cutoff !== null && Date.parse(entry.timestamp) < cutoff) return false;
      if (!term) return true;
      return [patient.name, entry.patientId, entry.reason].some((text) => text?.toLowerCase().includes(term));
    });
  });

  clearFilters(): void {
    this.searchTerm.set('');
    this.patientFilter.set('all');
    this.actionFilter.set('all');
    this.dateFilter.set('all');
  }

  exportCsv(): void {
    this.snackBar.open('Export coming soon', undefined, { duration: 3000 });
  }
}
