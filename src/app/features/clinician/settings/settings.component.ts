import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-clinician-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Settings</h1>`,
})
export class SettingsComponent {}
