import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AUDIT_ACTION_LABELS, AuditAction, AuditEntry } from '../../models/audit.model';
import { BadgeComponent, BadgeTone } from '../badge/badge.component';

const ACTION_TONES: Record<AuditAction, BadgeTone> = {
  submitted: 'primary',
  modified: 'tertiary',
  reviewed: 'secondary',
  flagged: 'error',
};

/**
 * One audit trail record, rendered as a timeline item. Apply to an `<li>` inside an `<ol>`.
 * Pass `patient` to show a link to that patient (for cross-patient views).
 */
@Component({
  selector: 'li[app-audit-entry]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, BadgeComponent],
  host: { '[attr.data-action]': 'entry().action' },
  templateUrl: './audit-entry.component.html',
  styleUrl: './audit-entry.component.scss',
})
export class AuditEntryComponent {
  readonly entry = input.required<AuditEntry>();
  readonly patient = input<{ id: string; name: string }>();

  readonly actionLabel = computed(() => AUDIT_ACTION_LABELS[this.entry().action]);
  readonly actionTone = computed(() => ACTION_TONES[this.entry().action]);
}
