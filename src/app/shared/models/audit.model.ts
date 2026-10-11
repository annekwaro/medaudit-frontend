export type AuditAction = 'submitted' | 'modified' | 'reviewed' | 'flagged';

export const AUDIT_ACTIONS: readonly AuditAction[] = ['submitted', 'modified', 'reviewed', 'flagged'];

/** One immutable audit trail record: who, what, when, old value, new value, why. */
export interface AuditEntry {
  id: string;
  patientId: string;
  /** ISO 8601 timestamp of when the change was recorded. */
  timestamp: string;
  user: string;
  action: AuditAction;
  field?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  submitted: 'Submitted',
  modified: 'Modified',
  reviewed: 'Reviewed',
  flagged: 'Flagged',
};
