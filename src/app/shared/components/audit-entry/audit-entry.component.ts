import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserPreferencesService } from '../../../core/services/user-preferences.service';
import { AUDIT_ACTION_LABELS, AuditEntry } from '../../models/audit.model';

/**
 * One audit trail record, rendered as a timeline item. Apply to an `<li>` inside an `<ol>`.
 * Pass `patient` to show a link to that patient (for cross-patient views).
 */
@Component({
  selector: 'li[app-audit-entry]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  host: { '[attr.data-action]': 'entry().action' },
  templateUrl: './audit-entry.component.html',
  styleUrl: './audit-entry.component.scss',
})
export class AuditEntryComponent {
  readonly entry = input.required<AuditEntry>();
  readonly patient = input<{ id: string; name: string }>();
  /** Show only the time (e.g. under a day heading that already gives the date). */
  readonly timeOnly = input(false);

  readonly preferences = inject(UserPreferencesService);

  readonly actionLabel = computed(() => AUDIT_ACTION_LABELS[this.entry().action]);
}
