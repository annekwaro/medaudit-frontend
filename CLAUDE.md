# MedAudit — eCOA Clinical Data Platform (Frontend)

## Tech Stack

- Angular 19+ (standalone components, signals, no NgModules)
- Angular Material 3 for UI
- SCSS with CSS custom properties for design tokens
- Charts: ngx-charts or Chart.js

## Angular Conventions (CRITICAL)

- ALWAYS use standalone components (never set `standalone: true`)
- Use `signal()` for local state, `computed()` for derived state
- Use native control flow: `@if`, `@for`, `@switch` (NOT *ngIf, *ngFor)
- Use `inject()` function instead of constructor injection
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on ALL components
- Use `input()` and `output()` functions, NOT decorators
- Do NOT use `ngClass` or `ngStyle` — use class/style bindings

## Project Structure

```
src/app/
├── core/                     (singleton services, interceptors)
│   └── services/             (patient-data.service: mock patients + audit entries)
├── shared/
│   ├── components/           (audit-entry, compliance-badge, stats-card)
│   └── models/               (patient.model, audit.model)
└── features/clinician/
    ├── dashboard/            (app shell: sidenav + toolbar, clinician routes, overview/ page)
    ├── patients/             (Patients page — /clinician/patients)
    ├── patient-detail/       (single-patient audit trail — /clinician/patient/:id)
    ├── audit-log/            (global audit search — /clinician/audit-log)
    ├── settings/
    └── _components/          (feature-local components, e.g. patient-list table)
```

## Current Task

Building clinician dashboard shell + stats cards + patient list table.

## Domain Context

This is an eCOA (electronic Clinical Outcome Assessment) platform for clinical trials.
Key domain constraints:

- Audit trail on every data change (who, what, when, old value, new value)
- Role-based views: PATIENT, CLINICIAN, ADMIN
- Offline-first data capture (hospital WiFi is unreliable)
- Patient compliance tracking is critical for trial integrity
