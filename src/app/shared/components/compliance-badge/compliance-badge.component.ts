import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { COMPLIANCE_LABELS, ComplianceStatus } from '../../models/patient.model';

/**
 * A patient's compliance status: a pastel gradient pill (matches the stats card palette), or a quieter
 * colored dot + label for dense rows that already carry other colored chips.
 */
@Component({
  selector: 'app-compliance-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-status]': 'status()', '[attr.data-appearance]': 'appearance()' },
  template: `{{ label() }}`,
  styleUrl: './compliance-badge.component.scss',
})
export class ComplianceBadgeComponent {
  readonly status = input.required<ComplianceStatus>();
  readonly appearance = input<'pill' | 'dot'>('pill');

  readonly label = computed(() => COMPLIANCE_LABELS[this.status()]);
}
