import { Routes } from '@angular/router';

// Mounted at clinician/patient/:id. The empty-path child inherits :id, bound to the component's `id` input.
export const PATIENT_DETAIL_ROUTES: Routes = [
  {
    path: '',
    title: 'Patient · MedAudit',
    loadComponent: () => import('./patient-detail.component').then((m) => m.PatientDetailComponent),
  },
];
