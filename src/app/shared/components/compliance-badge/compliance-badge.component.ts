import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { COMPLIANCE_LABELS, ComplianceStatus } from '../../models/patient.model';
import { BadgeComponent, BadgeTone } from '../badge/badge.component';

const COMPLIANCE_TONES: Record<ComplianceStatus, BadgeTone> = {
  'on-track': 'primary',
  late: 'tertiary',
  missing: 'error',
};

@Component({
  selector: 'app-compliance-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  template: `<app-badge [tone]="tone()">{{ label() }}</app-badge>`,
})
export class ComplianceBadgeComponent {
  readonly status = input.required<ComplianceStatus>();

  readonly label = computed(() => COMPLIANCE_LABELS[this.status()]);
  readonly tone = computed(() => COMPLIANCE_TONES[this.status()]);
}
