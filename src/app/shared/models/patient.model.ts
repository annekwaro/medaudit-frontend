export type ComplianceStatus = 'on-track' | 'late' | 'missing';

export interface PatientSummary {
  id: string;
  name: string;
  /** ISO 8601 timestamp, or null if the patient has never submitted. */
  lastSubmission: string | null;
  compliance: ComplianceStatus;
  alerts: number;
}
