import { ActionFields, complianceFactors, patientActions } from './patient-insights';

const TODAY = '2026-10-13';

function patient(overrides: Partial<ActionFields> = {}): ActionFields {
  return {
    nextVisit: null,
    lastSubmission: '2026-10-13T08:00:00',
    pendingSubmissions: 0,
    oldestPendingSince: null,
    enrolledOn: '2026-09-01',
    ...overrides,
  };
}

const kinds = (fields: ActionFields) => patientActions(fields, TODAY).map((action) => action.title);

describe('patientActions', () => {
  it('is empty when nothing is open', () => {
    expect(patientActions(patient(), TODAY)).toEqual([]);
  });

  it('puts an overdue visit first, then a silent streak, then reviews', () => {
    const titles = kinds(
      patient({ nextVisit: '2026-10-12', lastSubmission: '2026-10-07T09:05:00', pendingSubmissions: 7 }),
    );
    expect(titles).toEqual(['Reschedule overdue visit', 'Contact patient about missed diaries', 'Review 7 submissions']);
  });

  it('asks for contact only after two silent days', () => {
    expect(kinds(patient({ lastSubmission: '2026-10-12T20:47:00' }))).toEqual([]);
    expect(kinds(patient({ lastSubmission: '2026-10-11T20:47:00' }))).toEqual(['Contact patient about missed diaries']);
  });

  it('turns a no-submission patient with a visit today into a device setup note, without a separate visit action', () => {
    const actions = patientActions(patient({ lastSubmission: null, nextVisit: TODAY }), TODAY);
    expect(actions.map((action) => action.kind)).toEqual(['note']);
  });

  it('adds a prepare action for visits within a week', () => {
    expect(kinds(patient({ nextVisit: '2026-10-16' }))).toEqual(['Prepare for upcoming visit']);
    expect(kinds(patient({ nextVisit: '2026-10-25' }))).toEqual([]);
  });
});

describe('complianceFactors', () => {
  const week = ['submitted', 'submitted', 'submitted', 'submitted', 'submitted', 'submitted', 'submitted'] as const;

  it('says when the target is met', () => {
    const factors = complianceFactors(
      { submissions30d: { submitted: 29, missed: 1 }, lastSubmission: '2026-10-13T07:22:00' }, 97, 90, week, TODAY,
    );
    expect(factors[0]).toEqual({ tone: 'good', text: 'Meets the 90% target' });
    expect(factors.map((factor) => factor.text)).toContain('7 of 7 this week');
  });

  it('explains a low score with the gap, the silent streak and this week', () => {
    const factors = complianceFactors(
      { submissions30d: { submitted: 18, missed: 12 }, lastSubmission: '2026-10-07T09:05:00' },
      60,
      90,
      ['submitted', 'missed', 'missed', 'missed', 'missed', 'missed', 'due'],
      TODAY,
    );
    expect(factors.map((factor) => factor.text)).toEqual([
      '30 points below the 90% target',
      '18 of 30 diaries submitted',
      '1 of 6 this week',
      'No diary for 6 days',
    ]);
    expect(factors[0].tone).toBe('critical');
  });
});
