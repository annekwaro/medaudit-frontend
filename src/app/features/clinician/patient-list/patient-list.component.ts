import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-patient-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Patients</h1>`,
})
export class PatientListComponent {}
