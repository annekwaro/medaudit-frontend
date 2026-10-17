export type ComplianceStatus = 'on-track' | 'late' | 'missing';

export const COMPLIANCE_STATUSES: readonly ComplianceStatus[] = ['on-track', 'late', 'missing'];

export const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  'on-track': 'On Track',
  late: 'Late',
  missing: 'Missing',
};

/** Where a patient is in the study, in protocol order. */
export type TrialStage = 'screening' | 'baseline' | 'treatment' | 'follow-up' | 'completed';

export const TRIAL_STAGES: readonly TrialStage[] = ['screening', 'baseline', 'treatment', 'follow-up', 'completed'];

export const TRIAL_STAGE_LABELS: Record<TrialStage, string> = {
  screening: 'Screening',
  baseline: 'Baseline',
  treatment: 'Treatment',
  'follow-up': 'Follow-up',
  completed: 'Completed',
};

/** One day of a patient's diary. `due`: today's entry not in yet (not missed until the day ends). */
export type DiaryDayStatus = 'submitted' | 'late' | 'missed' | 'due' | 'not-enrolled';

export interface PatientSummary {
  id: string;
  name: string;
  /** ISO 8601 timestamp, or null if the patient has never submitted. */
  lastSubmission: string | null;
  compliance: ComplianceStatus;
  alerts: number;
  /** Diary submissions awaiting clinician review. */
  pendingSubmissions: number;
  /** ISO 8601 timestamp of the oldest submission awaiting review, or null if none are waiting. */
  oldestPendingSince: string | null;
}

/** Full patient record for the detail page (superset of the table summary). */
export interface PatientProfile extends PatientSummary {
  age: number;
  sex: 'Female' | 'Male';
  /** ISO 8601 date. */
  enrolledOn: string;
  site: string;
  /** Kept blinded for site staff in a blinded trial. */
  treatmentArm: string;
  /** ISO 8601 date, or null if none scheduled. */
  nextVisit: string | null;
  stage: TrialStage;
  /** Expected diary submissions over the last 30 days (or since enrollment, if shorter). */
  submissions30d: { submitted: number; missed: number };
}
