import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DiaryDayStatus } from '../../models/patient.model';

/**
 * One day's diary status as a 12px dot. Decorative: the surrounding text or link label carries the
 * status for screen readers. Shape as well as color, so status never depends on color alone.
 */
@Component({
  selector: 'app-diary-dot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-status]': 'status()', 'aria-hidden': 'true' },
  template: '',
  styleUrl: './diary-dot.component.scss',
})
export class DiaryDotComponent {
  readonly status = input.required<Exclude<DiaryDayStatus, 'not-enrolled'>>();
}
