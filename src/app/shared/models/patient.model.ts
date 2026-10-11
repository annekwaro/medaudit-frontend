export type ComplianceStatus = 'on-track' | 'late' | 'missing';

export const COMPLIANCE_STATUSES: readonly ComplianceStatus[] = ['on-track', 'late', 'missing'];

export const COMPLIANCE_LABELS: Record<ComplianceStatus, string> = {
  'on-track': 'On Track',
  late: 'Late',
  missing: 'Missing',
};

export interface PatientSummary {
  id: string;
  name: string;
  /** ISO 8601 timestamp, or null if the patient has never submitted. */
  lastSubmission: string | null;
  compliance: ComplianceStatus;
  alerts: number;
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
  /** Expected diary submissions over the last 30 days (or since enrollment, if shorter). */
  submissions30d: { submitted: number; missed: number };
}
