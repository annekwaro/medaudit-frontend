import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clinician' },
  {
    path: 'clinician',
    loadChildren: () =>
      import('./features/clinician/dashboard/dashboard.routes').then((m) => m.CLINICIAN_ROUTES),
  },
  { path: '**', redirectTo: 'clinician' },
];
