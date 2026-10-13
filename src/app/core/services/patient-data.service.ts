import { Injectable, signal } from '@angular/core';
import { AuditEntry } from '../../shared/models/audit.model';
import { PatientProfile } from '../../shared/models/patient.model';

/** Dashboard figures at a point in time; today's are derived from `patients`. */
export interface DashboardFigures {
  /** Sum of pendingSubmissions. */
  unreviewed: number;
  /** Sum of open alerts. */
  alerts: number;
  activePatients: number;
  /** Pooled 30-day submission rate across all patients, rounded. */
  compliancePercent: number;
  /** Patients in the Missing compliance band. */
  flaggedPatients: number;
}

/** Mock patient and audit data until the backend API exists. */
@Injectable({ providedIn: 'root' })
export class PatientDataService {
  /**
   * The mock data's "today" (a Tuesday), as an ISO date. Use this instead of `new Date()` wherever
   * the dashboard needs today's date, so the mock records, deltas and charts stay in step.
   */
  readonly today = '2026-10-13';

  // submissions30d is chosen so each patient's rate lands in their compliance band
  // (On Track >= 90%, Late 70-89%, Missing < 70%). All patients are at Dr. Martin's site.
  readonly patients = signal<PatientProfile[]>([
    {
      id: 'PT-1042', name: 'Amara Okafor', lastSubmission: '2026-10-13T08:05:00', compliance: 'on-track', alerts: 0, pendingSubmissions: 0,
      age: 34, sex: 'Female', enrolledOn: '2026-09-12', site: 'Site 042 · Grenoble', treatmentArm: 'Blinded',
      nextVisit: '2026-10-18', submissions30d: { submitted: 28, missed: 2 },
    },
    {
      id: 'PT-1057', name: 'Daniel Mwangi', lastSubmission: '2026-10-12T20:47:00', compliance: 'late', alerts: 1, pendingSubmissions: 3,
      age: 51, sex: 'Male', enrolledOn: '2026-09-01', site: 'Site 042 · Grenoble', treatmentArm: 'Blinded',
      nextVisit: '2026-10-14', submissions30d: { submitted: 24, missed: 6 },
    },
    {
      id: 'PT-1063', name: 'Sofia Lindqvist', lastSubmission: '2026-10-07T09:05:00', compliance: 'missing', alerts: 3, pendingSubmissions: 7,
      age: 46, sex: 'Female', enrolledOn: '2026-08-24', site: 'Site 042 · Grenoble', treatmentArm: 'Blinded',
      nextVisit: '2026-10-12', submissions30d: { submitted: 18, missed: 12 },
    },
    {
      id: 'PT-1071', name: 'Hiroshi Tanaka', lastSubmission: '2026-10-13T07:22:00', compliance: 'on-track', alerts: 0, pendingSubmissions: 0,
      age: 62, sex: 'Male', enrolledOn: '2026-08-20', site: 'Site 042 · Grenoble', treatmentArm: 'Blinded',
      nextVisit: '2026-10-25', submissions30d: { submitted: 29, missed: 1 },
    },
    {
      id: 'PT-1088', name: 'Grace Achieng', lastSubmission: '2026-10-12T21:52:00', compliance: 'late', alerts: 0, pendingSubmissions: 2,
      age: 29, sex: 'Female', enrolledOn: '2026-09-05', site: 'Site 042 · Grenoble', treatmentArm: 'Blinded',
      nextVisit: '2026-10-16', submissions30d: { submitted: 23, missed: 7 },
    },
    {
      // Enrolled Sep 30, device not yet set up (see audit trail); setup visit today, Oct 13.
      // 13 expected daily diaries since enrollment (Sep 30 – Oct 12), none received.
      id: 'PT-1094', name: 'Mateo Fernández', lastSubmission: null, compliance: 'missing', alerts: 2, pendingSubmissions: 0,
      age: 38, sex: 'Male', enrolledOn: '2026-09-30', site: 'Site 042 · Grenoble', treatmentArm: 'Blinded',
      nextVisit: '2026-10-13', submissions30d: { submitted: 0, missed: 13 },
    },
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
    {
      id: 'AE-0023',
      patientId: 'PT-1057',
      timestamp: '2026-10-12T20:47:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Daily diary',
      reason: 'Submitted after the scheduled window.',
    },
    {
      id: 'AE-0024',
      patientId: 'PT-1088',
      timestamp: '2026-10-12T21:52:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Sleep hours',
      newValue: '6',
      reason: 'Submitted after the scheduled window.',
    },
    {
      id: 'AE-0025',
      patientId: 'PT-1063',
      timestamp: '2026-10-13T06:00:00',
      user: 'System (compliance monitor)',
      action: 'flagged',
      field: 'Daily diary',
      reason: 'No daily diary since Oct 7 (missed Oct 8–12). Escalated to site coordinator.',
    },
    {
      id: 'AE-0026',
      patientId: 'PT-1071',
      timestamp: '2026-10-13T07:22:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Sleep hours',
      newValue: '7',
    },
    {
      id: 'AE-0027',
      patientId: 'PT-1042',
      timestamp: '2026-10-13T08:05:00',
      user: 'Patient (mobile)',
      action: 'submitted',
      field: 'Pain level',
      newValue: '2',
    },
    {
      id: 'AE-0028',
      patientId: 'PT-1094',
      timestamp: '2026-10-13T08:40:00',
      user: 'J. Otieno (Site coordinator)',
      action: 'reviewed',
      reason: 'Patient confirmed by phone. Device setup visit today at 14:00.',
    },
  ]);

  /** Mock snapshot from yesterday, for the dashboard's day-over-day deltas. */
  readonly yesterdayFigures: DashboardFigures = {
    unreviewed: 9,
    alerts: 4,
    activePatients: 6,
    compliancePercent: 78,
    flaggedPatients: 0,
  };

  /**
   * Mock daily history for the stats cards' micro-visualizations: the six days before today,
   * oldest first. Today's value is appended from the live figures, so the two always agree.
   */
  readonly previousSixDays = {
    newSubmissions: [3, 5, 2, 6, 4, 7],
    newAlerts: [2, 3, 1, 4, 2, 5],
    activePatients: [5, 5, 6, 6, 6, 6],
  } as const;

  getPatient(id: string): PatientProfile | undefined {
    return this.patients().find((patient) => patient.id === id);
  }

  getAllAuditEntries(): AuditEntry[] {
    return this.auditEntries();
  }

  getAuditTrail(patientId: string): AuditEntry[] {
    return this.auditEntries().filter((entry) => entry.patientId === patientId);
  }
}
