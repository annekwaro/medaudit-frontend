import { Routes } from '@angular/router';

export const CLINICIAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · MedAudit',
        loadComponent: () => import('./overview/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: 'patients',
        title: 'Patients · MedAudit',
        loadComponent: () =>
          import('../patient-list/patient-list.component').then((m) => m.PatientListComponent),
      },
      {
        path: 'patient/:id',
        loadChildren: () =>
          import('../patient-detail/patient-detail.routes').then((m) => m.PATIENT_DETAIL_ROUTES),
      },
      {
        path: 'audit-log',
        title: 'Audit Log · MedAudit',
        loadComponent: () =>
          import('../audit-viewer/audit-viewer.component').then((m) => m.AuditViewerComponent),
      },
      {
        path: 'settings',
        title: 'Settings · MedAudit',
        loadComponent: () => import('../settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];
