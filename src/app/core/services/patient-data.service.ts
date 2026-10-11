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
      patientId: 'PT-1071',
      timestamp: '2026-09-20T07:45:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '2',
    },
    {
      id: 'AE-0002',
      patientId: 'PT-1088',
      timestamp: '2026-09-25T20:10:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '4',
    },
    {
      id: 'AE-0003',
      patientId: 'PT-1042',
      timestamp: '2026-09-27T08:02:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '4',
    },
    {
      id: 'AE-0004',
      patientId: 'PT-1042',
      timestamp: '2026-09-29T10:15:00',
      user: 'Dr. Wanjiru',
      action: 'reviewed',
      field: 'Pain level',
      reason: 'Stable since baseline. No action required.',
    },
    {
      id: 'AE-0005',
      patientId: 'PT-1088',
      timestamp: '2026-10-02T21:40:00',
      user: 'Patient (mobile)',
      action: 'modified',
      field: 'Sleep hours',
      oldValue: '4',
      newValue: '6',
      reason: 'Patient corrected own entry within the 24-hour edit window.',
    },
    {
      id: 'AE-0006',
      patientId: 'PT-1094',
      timestamp: '2026-10-03T09:00:00',
      user: 'System (compliance monitor)',
      action: 'flagged',
      field: 'Daily diary',
      reason: 'No submission within 72 hours of enrollment on Sep 30.',
    },
    {
      id: 'AE-0007',
      patientId: 'PT-1071',
      timestamp: '2026-10-04T07:20:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Sleep hours',
      newValue: '7',
    },
    {
      id: 'AE-0008',
      patientId: 'PT-1042',
      timestamp: '2026-10-04T07:55:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Sleep hours',
      newValue: '7.5',
    },
    {
      id: 'AE-0009',
      patientId: 'PT-1057',
      timestamp: '2026-10-04T21:31:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '6',
    },
    {
      id: 'AE-0010',
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
      id: 'AE-0011',
      patientId: 'PT-1057',
      timestamp: '2026-10-06T10:24:00',
      user: 'Dr. Martin',
      action: 'flagged',
      field: 'Pain level',
      reason: 'Pain level at protocol alert threshold (≥7). Adverse event assessment required.',
    },
    {
      id: 'AE-0012',
      patientId: 'PT-1063',
      timestamp: '2026-10-07T09:05:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '7',
    },
    {
      id: 'AE-0013',
      patientId: 'PT-1063',
      timestamp: '2026-10-07T09:06:00',
      user: 'System (compliance monitor)',
      action: 'flagged',
      field: 'Pain level',
      reason: 'Score of 7 meets protocol alert threshold (≥7). Clinician review required.',
    },
    {
      id: 'AE-0014',
      patientId: 'PT-1094',
      timestamp: '2026-10-08T09:00:00',
      user: 'System (compliance monitor)',
      action: 'flagged',
      reason: 'No submissions received since enrollment on Sep 30. Device setup to be verified.',
    },
    {
      id: 'AE-0015',
      patientId: 'PT-1063',
      timestamp: '2026-10-09T06:00:00',
      user: 'System (compliance monitor)',
      action: 'flagged',
      field: 'Daily diary',
      reason: 'Daily diary not received for Oct 8.',
    },
    {
      id: 'AE-0016',
      patientId: 'PT-1094',
      timestamp: '2026-10-09T15:20:00',
      user: 'J. Otieno (Site coordinator)',
      action: 'reviewed',
      reason: 'Phone contact attempted, voicemail left. Device setup visit scheduled for Oct 13.',
    },
    {
      id: 'AE-0017',
      patientId: 'PT-1088',
      timestamp: '2026-10-09T21:18:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Sleep hours',
      newValue: '5',
      reason: 'Submitted one day after the scheduled window.',
    },
    {
      id: 'AE-0018',
      patientId: 'PT-1057',
      timestamp: '2026-10-10T19:42:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Daily diary',
      reason: 'Captured offline Oct 9, 21:05. Synced late after connectivity restored.',
    },
    {
      id: 'AE-0019',
      patientId: 'PT-1063',
      timestamp: '2026-10-11T06:00:00',
      user: 'System (compliance monitor)',
      action: 'flagged',
      field: 'Daily diary',
      reason: 'Missed daily submissions on Oct 8, 9 and 10. Site to contact patient.',
    },
    {
      id: 'AE-0020',
      patientId: 'PT-1071',
      timestamp: '2026-10-11T07:30:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Sleep hours',
      newValue: '6.5',
    },
    {
      id: 'AE-0021',
      patientId: 'PT-1042',
      timestamp: '2026-10-11T08:14:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '3',
    },
    {
      id: 'AE-0022',
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

  getAllAuditEntries(): AuditEntry[] {
    return this.auditEntries();
  }

  getAuditTrail(patientId: string): AuditEntry[] {
    return this.auditEntries().filter((entry) => entry.patientId === patientId);
  }
}
