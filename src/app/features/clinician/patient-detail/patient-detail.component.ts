import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-patient-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Patient {{ id() }}</h1>`,
})
export class PatientDetailComponent {
  /** Bound from the :id route param (withComponentInputBinding). */
  readonly id = input.required<string>();
}
