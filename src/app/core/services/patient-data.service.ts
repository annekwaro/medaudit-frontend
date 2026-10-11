import { Injectable, signal } from '@angular/core';
import { AuditEntry } from '../../shared/models/audit.model';
import { PatientSummary } from '../../shared/models/patient.model';

/** Mock patient and audit data until the backend API exists. */
@Injectable({ providedIn: 'root' })
export class PatientDataService {
  readonly patients = signal<PatientSummary[]>([
    { id: 'PT-1042', name: 'Amara Okafor', lastSubmission: '2026-10-11T08:14:00', compliance: 'on-track', alerts: 0 },
    { id: 'PT-1057', name: 'Daniel Mwangi', lastSubmission: '2026-10-10T19:42:00', compliance: 'late', alerts: 1 },
    { id: 'PT-1063', name: 'Sofia Lindqvist', lastSubmission: '2026-10-07T09:05:00', compliance: 'missing', alerts: 3 },
    { id: 'PT-1071', name: 'Hiroshi Tanaka', lastSubmission: '2026-10-11T07:30:00', compliance: 'on-track', alerts: 0 },
    { id: 'PT-1088', name: 'Grace Achieng', lastSubmission: '2026-10-09T21:18:00', compliance: 'late', alerts: 0 },
    { id: 'PT-1094', name: 'Mateo Fernández', lastSubmission: null, compliance: 'missing', alerts: 2 },
  ]);

  private readonly auditEntries = signal<AuditEntry[]>([
    {
      id: 'AE-0001',
      patientId: 'PT-1057',
      timestamp: '2026-09-14T09:12:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Baseline pain diary',
      reason: 'Enrollment visit, completed on site device.',
    },
    {
      id: 'AE-0002',
      patientId: 'PT-1057',
      timestamp: '2026-09-15T11:40:00',
      user: 'Dr. Martin',
      action: 'reviewed',
      field: 'Baseline pain diary',
      reason: 'Baseline confirmed. Eligible for randomization.',
    },
    {
      id: 'AE-0003',
      patientId: 'PT-1057',
      timestamp: '2026-09-28T20:05:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '5',
    },
    {
      id: 'AE-0004',
      patientId: 'PT-1057',
      timestamp: '2026-10-04T21:31:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '6',
    },
    {
      id: 'AE-0005',
      patientId: 'PT-1057',
      timestamp: '2026-10-06T10:18:00',
      user: 'Dr. Martin',
      action: 'modified',
      field: 'Pain level',
      oldValue: '6',
      newValue: '8',
      reason: 'Patient reported change during visit. Source document SD-1057-04.',
    },
    {
      id: 'AE-0006',
      patientId: 'PT-1057',
      timestamp: '2026-10-06T10:24:00',
      user: 'Dr. Martin',
      action: 'flagged',
      field: 'Pain level',
      reason: 'Increase of 3 points since baseline. Adverse event assessment required.',
    },
    {
      id: 'AE-0007',
      patientId: 'PT-1057',
      timestamp: '2026-10-08T14:02:00',
      user: 'J. Otieno (Site coordinator)',
      action: 'modified',
      field: 'Rescue medication doses',
      oldValue: '1',
      newValue: '2',
      reason: 'Transcription error corrected against paper medication log.',
    },
    {
      id: 'AE-0008',
      patientId: 'PT-1057',
      timestamp: '2026-10-10T19:42:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Daily diary',
      reason: 'Captured offline Oct 9, 21:05. Synced late after connectivity restored.',
    },
    {
      id: 'AE-0009',
      patientId: 'PT-1057',
      timestamp: '2026-10-10T19:43:00',
      user: 'Patient (mobile)',
      action: 'modified',
      field: 'Sleep quality',
      oldValue: '3',
      newValue: '2',
      reason: 'Patient corrected own entry within the 24-hour edit window.',
    },
    {
      id: 'AE-0010',
      patientId: 'PT-1057',
      timestamp: '2026-10-11T08:30:00',
      user: 'Dr. Martin',
      action: 'reviewed',
      field: 'Pain level',
      reason: 'Flag reviewed. AE form opened and sponsor notified.',
    },
  ]);

  getPatient(id: string): PatientSummary | undefined {
    return this.patients().find((patient) => patient.id === id);
  }

  getAuditTrail(patientId: string): AuditEntry[] {
    return this.auditEntries().filter((entry) => entry.patientId === patientId);
  }
}
