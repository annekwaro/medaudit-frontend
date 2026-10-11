import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { COMPLIANCE_LABELS, ComplianceStatus } from '../../models/patient.model';

/** Pastel gradient pill for a patient's compliance status (matches the stats card palette). */
@Component({
  selector: 'app-compliance-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-status]': 'status()' },
  template: `{{ label() }}`,
  styleUrl: './compliance-badge.component.scss',
})
export class ComplianceBadgeComponent {
  readonly status = input.required<ComplianceStatus>();

  readonly label = computed(() => COMPLIANCE_LABELS[this.status()]);
}
