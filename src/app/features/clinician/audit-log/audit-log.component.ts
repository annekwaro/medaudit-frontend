import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-audit-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h1>Audit Log</h1>`,
})
export class AuditLogComponent {}
