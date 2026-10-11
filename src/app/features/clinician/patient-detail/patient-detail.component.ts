import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PatientDataService } from '../../../core/services/patient-data.service';
import { BackLinkComponent, previousAppUrl } from '../../../shared/components/back-link/back-link.component';
import { AuditEntryComponent } from '../../../shared/components/audit-entry/audit-entry.component';
import { ComplianceBadgeComponent } from '../../../shared/components/compliance-badge/compliance-badge.component';
import { AUDIT_ACTION_LABELS, AUDIT_ACTIONS, AuditAction } from '../../../shared/models/audit.model';

type DateRange = '7d' | '30d' | 'all';

const DATE_RANGE_DAYS: Record<DateRange, number | null> = { '7d': 7, '30d': 30, all: null };

const DAY_MS = 24 * 60 * 60 * 1000;

function backLabelFor(url: string | null): string {
  if (url?.startsWith('/clinician/patients')) return 'Patients';
  if (url?.startsWith('/clinician/audit-log')) return 'Audit Log';
  return 'Dashboard';
}

@Component({
  selector: 'app-patient-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    AuditEntryComponent,
    BackLinkComponent,
    ComplianceBadgeComponent,
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss',
})
export class PatientDetailComponent {
  private readonly patientData = inject(PatientDataService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly previousUrl = previousAppUrl(inject(Router));

  /** Bound from the :id route param (withComponentInputBinding). */
  readonly id = input.required<string>();

  readonly actions = AUDIT_ACTIONS;
  readonly actionLabels = AUDIT_ACTION_LABELS;
  readonly dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'all', label: 'All time' },
  ];

  /** Names the page Location.back() returns to; direct loads fall back to the dashboard. */
  readonly backLabel = backLabelFor(this.previousUrl);

  readonly dateRange = signal<DateRange>('all');
  readonly selectedActions = signal<ReadonlySet<AuditAction>>(new Set(AUDIT_ACTIONS));

  readonly patient = computed(() => this.patientData.getPatient(this.id()));

  /** Newest first. */
  private readonly auditTrail = computed(() =>
    this.patientData
      .getAuditTrail(this.id())
      .slice()
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
  );

  readonly filteredEntries = computed(() => {
    const days = DATE_RANGE_DAYS[this.dateRange()];
    const cutoff = days === null ? null : Date.now() - days * DAY_MS;
    const actions = this.selectedActions();
    return this.auditTrail().filter(
      (entry) => actions.has(entry.action) && (cutoff === null || Date.parse(entry.timestamp) >= cutoff),
    );
  });

  readonly totalEntries = computed(() => this.auditTrail().length);

  readonly compliancePercent = computed(() => {
    const totals = this.patient()?.submissions30d;
    if (!totals) return null;
    const expected = totals.submitted + totals.missed;
    return expected ? Math.round((totals.submitted / expected) * 100) : null;
  });

  /** >= 90% emerald, 70-89% amber, < 70% rose. */
  readonly complianceBand = computed(() => {
    const percent = this.compliancePercent() ?? 0;
    return percent >= 90 ? 'high' : percent >= 70 ? 'mid' : 'low';
  });

  /** "Last 30 days", or the shorter window for patients enrolled less than 30 days ago. */
  readonly complianceWindow = computed(() => {
    const totals = this.patient()?.submissions30d;
    const days = totals ? totals.submitted + totals.missed : 0;
    return days < 30 ? `Since enrollment (${days} days)` : 'Last 30 days';
  });

  comingSoon(): void {
    this.snackBar.open('Feature coming soon', undefined, { duration: 3000 });
  }

  exportCsv(): void {
    this.snackBar.open('Export coming soon', undefined, { duration: 3000 });
  }

  toggleAction(action: AuditAction, checked: boolean): void {
    this.selectedActions.update((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(action);
      } else {
        next.delete(action);
      }
      return next;
    });
  }
}
