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
