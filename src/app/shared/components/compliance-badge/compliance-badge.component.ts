import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ComplianceStatus } from '../../models/patient.model';
import { BadgeComponent, BadgeTone } from '../badge/badge.component';

const COMPLIANCE_DISPLAY: Record<ComplianceStatus, { label: string; tone: BadgeTone }> = {
  'on-track': { label: 'On Track', tone: 'primary' },
  late: { label: 'Late', tone: 'tertiary' },
  missing: { label: 'Missing', tone: 'error' },
};

@Component({
  selector: 'app-compliance-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  template: `<app-badge [tone]="display().tone">{{ display().label }}</app-badge>`,
})
export class ComplianceBadgeComponent {
  readonly status = input.required<ComplianceStatus>();

  readonly display = computed(() => COMPLIANCE_DISPLAY[this.status()]);
}
