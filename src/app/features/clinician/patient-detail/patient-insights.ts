import { DiaryDayStatus, PatientProfile } from '../../../shared/models/patient.model';
import { daysBetween } from '../../../shared/utils/dates';

/** What the clinician can do about it; each maps to one button on the Up next card. */
export type PatientActionKind = 'schedule' | 'message' | 'note' | 'review';

export interface PatientAction {
  kind: PatientActionKind;
  icon: string;
  title: string;
  /** One line of context, e.g. "No diary since Oct 7 (6 days)". */
  detail: string;
  /** Button label for the primary action. */
  actionLabel: string;
}

export type FactorTone = 'good' | 'warning' | 'critical' | 'neutral';

/** One reason behind the compliance score. */
export interface ComplianceFactor {
  tone: FactorTone;
  text: string;
}

/** The fields the actions look at. */
export type ActionFields = Pick<
  PatientProfile,
  'nextVisit' | 'lastSubmission' | 'pendingSubmissions' | 'oldestPendingSince' | 'enrolledOn'
>;

/** Days without a diary before the patient should be contacted. */
const CONTACT_AFTER_DAYS = 2;

/** Upcoming visits within this many days get a "prepare" action. */
const PREPARE_WITHIN_DAYS = 7;

const shortDate = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Open actions for a patient, most urgent first; the first is the card's "Up next".
 * 1. visit overdue → reschedule,
 * 2. no diary yet → device setup (at today's visit, if there is one),
 * 3. no diary for CONTACT_AFTER_DAYS or more → contact the patient,
 * 4. submissions waiting → review them,
 * 5. visit today or within PREPARE_WITHIN_DAYS → prepare.
 * Empty when nothing is open.
 *
 * @param today ISO date (yyyy-MM-dd), e.g. `PatientDataService.today`.
 */
export function patientActions(patient: ActionFields, today: string): PatientAction[] {
  const actions: PatientAction[] = [];
  const visitIn = patient.nextVisit === null ? null : daysBetween(today, patient.nextVisit);

  if (visitIn !== null && visitIn < 0) {
    actions.push({
      kind: 'schedule', icon: 'event_busy', title: 'Reschedule overdue visit',
      detail: `Was due ${shortDate(patient.nextVisit!)}`, actionLabel: 'Schedule visit',
    });
  }

  if (patient.lastSubmission === null) {
    actions.push(
      visitIn === 0
        ? {
            kind: 'note', icon: 'phonelink_setup', title: 'Set up diary device at today\'s visit',
            detail: `No submissions since enrollment on ${shortDate(patient.enrolledOn)}`, actionLabel: 'Add note',
          }
        : {
            kind: 'message', icon: 'phonelink_setup', title: 'Help patient set up their diary',
            detail: `No submissions since enrollment on ${shortDate(patient.enrolledOn)}`, actionLabel: 'Send message',
          },
    );
  } else {
    const silentDays = daysBetween(patient.lastSubmission, today);
    if (silentDays >= CONTACT_AFTER_DAYS) {
      actions.push({
        kind: 'message', icon: 'chat', title: 'Contact patient about missed diaries',
        detail: `No diary since ${shortDate(patient.lastSubmission)} (${silentDays} days)`, actionLabel: 'Send message',
      });
    }
  }

  if (patient.pendingSubmissions > 0) {
    const count = patient.pendingSubmissions;
    actions.push({
      kind: 'review', icon: 'pending_actions', title: `Review ${count} submission${count === 1 ? '' : 's'}`,
      detail: patient.oldestPendingSince ? `Oldest waiting since ${shortDate(patient.oldestPendingSince)}` : 'Waiting for review',
      actionLabel: 'Review',
    });
  }

  if (visitIn !== null && visitIn >= 0 && visitIn <= PREPARE_WITHIN_DAYS && patient.lastSubmission !== null) {
    actions.push({
      kind: 'schedule', icon: 'event', title: visitIn === 0 ? 'Visit today' : 'Prepare for upcoming visit',
      detail: shortDate(patient.nextVisit!), actionLabel: 'View visit',
    });
  }

  return actions;
}

/**
 * Why the compliance score is what it is: the 30-day rate against target, then this week's diaries
 * (latest first: a silent streak, then late ones). `week` is the last 7 days' statuses, oldest first.
 */
export function complianceFactors(
  patient: Pick<PatientProfile, 'submissions30d' | 'lastSubmission'>,
  percent: number,
  target: number,
  week: readonly DiaryDayStatus[],
  today: string,
): ComplianceFactor[] {
  const { submitted, missed } = patient.submissions30d;
  const factors: ComplianceFactor[] = [];

  const gap = target - percent;
  factors.push(
    gap <= 0
      ? { tone: 'good', text: `Meets the ${target}% target` }
      : { tone: gap >= 20 ? 'critical' : 'warning', text: `${gap} points below the ${target}% target` },
  );
  factors.push({ tone: 'neutral', text: `${submitted} of ${submitted + missed} diaries submitted` });

  const counted = week.filter((status) => status !== 'not-enrolled' && status !== 'due');
  const thisWeek = counted.filter((status) => status === 'submitted' || status === 'late').length;
  factors.push({
    tone: thisWeek === counted.length ? 'good' : thisWeek >= counted.length - 1 ? 'warning' : 'critical',
    text: `${thisWeek} of ${counted.length} this week`,
  });

  if (patient.lastSubmission === null) {
    factors.push({ tone: 'critical', text: 'Never submitted a diary' });
  } else {
    const silentDays = daysBetween(patient.lastSubmission, today);
    if (silentDays >= CONTACT_AFTER_DAYS) {
      factors.push({ tone: 'critical', text: `No diary for ${silentDays} days` });
    }
  }

  const late = week.filter((status) => status === 'late').length;
  if (late > 0) factors.push({ tone: 'warning', text: `${late} sent late this week` });

  return factors;
}
