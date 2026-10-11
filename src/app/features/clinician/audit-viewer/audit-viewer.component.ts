import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-audit-viewer',
  // Required on Angular 17; remove once the project is on Angular 19+.
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Audit Log</h1>`,
})
export class AuditViewerComponent {}
