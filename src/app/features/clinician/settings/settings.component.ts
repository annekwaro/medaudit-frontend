import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-clinician-settings',
  // Required on Angular 17; remove once the project is on Angular 19+.
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Settings</h1>`,
})
export class SettingsComponent {}
