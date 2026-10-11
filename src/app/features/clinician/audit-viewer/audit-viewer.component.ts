import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-audit-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Audit Log</h1>`,
})
export class AuditViewerComponent {}
