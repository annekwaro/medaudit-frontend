import { ComplianceStatus, PatientProfile } from '../../../../shared/models/patient.model';
import { RowReason } from '../../_components/patient-list/patient-list.component';

/** The fields the urgency order looks at. */
export type UrgencyFields = Pick<PatientProfile, 'alerts' | 'nextVisit' | 'compliance' | 'pendingSubmissions'>;

/** Worst compliance first. */
const COMPLIANCE_RANK: Record<ComplianceStatus, number> = {
  missing: 0,
  late: 1,
  'on-track': 2,
};

/** Visit dates are ISO dates (yyyy-MM-dd), so string order is date order. */
function isOverdue(nextVisit: string | null, today: string): boolean {
  return nextVisit !== null && nextVisit < today;
}

/**
 * "Needs attention" order for the overview, most urgent first:
 * 1. open alerts (most first),
 * 2. next visit overdue (before `today`),
 * 3. compliance: missing, then late, then on-track,
 * 4. pending submissions (most first).
 * Ties keep their input order. Returns a new array; the input is not modified.
 *
 * @param today ISO date (yyyy-MM-dd), e.g. `PatientDataService.today`.
 */
export function sortByUrgency<T extends UrgencyFields>(patients: readonly T[], today: string): T[] {
  return [...patients].sort(
    (a, b) =>
      b.alerts - a.alerts ||
      Number(isOverdue(b.nextVisit, today)) - Number(isOverdue(a.nextVisit, today)) ||
      COMPLIANCE_RANK[a.compliance] - COMPLIANCE_RANK[b.compliance] ||
      b.pendingSubmissions - a.pendingSubmissions,
  );
}

/** The fields the reason chips look at. */
export type ReasonFields = UrgencyFields & Pick<PatientProfile, 'lastSubmission'>;

/**
 * Why a patient is in "Needs attention", in the same priority as sortByUrgency, e.g.
 * ["3 alerts", "Visit overdue", "7 to review"]. Empty when nothing is urgent.
 * Compliance has its own column, so it isn't repeated here.
 *
 * @param today ISO date (yyyy-MM-dd), e.g. `PatientDataService.today`.
 */
export function urgencyReasons(patient: ReasonFields, today: string): RowReason[] {
  const reasons: RowReason[] = [];
  if (patient.alerts > 0) {
    const label = `${patient.alerts} alert${patient.alerts === 1 ? '' : 's'}`;
    reasons.push({ label, tone: 'critical', icon: 'notifications_active' });
  }
  if (isOverdue(patient.nextVisit, today)) {
    reasons.push({ label: 'Visit overdue', tone: 'critical', icon: 'event_busy' });
  } else if (patient.nextVisit === today) {
    reasons.push({ label: 'Visit today', tone: 'info', icon: 'today' });
  }
  if (patient.lastSubmission === null) {
    reasons.push({ label: 'No submissions yet', tone: 'warning', icon: 'hourglass_empty' });
  }
  if (patient.pendingSubmissions > 0) {
    reasons.push({ label: `${patient.pendingSubmissions} to review`, tone: 'warning', icon: 'pending_actions' });
  }
  return reasons;
}
