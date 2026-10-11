import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-patients',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Patients</h1>`,
})
export class PatientsComponent {}
