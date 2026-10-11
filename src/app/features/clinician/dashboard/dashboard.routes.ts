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
          import('../patients/patients.component').then((m) => m.PatientsComponent),
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
          import('../audit-log/audit-log.component').then((m) => m.AuditLogComponent),
      },
      {
        path: 'settings',
        title: 'Settings · MedAudit',
        loadComponent: () => import('../settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];
