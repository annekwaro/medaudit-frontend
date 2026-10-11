import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-clinician-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Dashboard</h1>`,
})
export class OverviewComponent {}
