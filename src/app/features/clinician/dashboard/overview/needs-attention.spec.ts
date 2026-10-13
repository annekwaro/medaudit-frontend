import { ReasonFields, sortByUrgency, urgencyReasons, UrgencyFields } from './needs-attention';

type TestPatient = UrgencyFields & { id: string };

const TODAY = '2026-10-13';

function patient(id: string, overrides: Partial<UrgencyFields> = {}): TestPatient {
  return { id, alerts: 0, nextVisit: null, compliance: 'on-track', pendingSubmissions: 0, ...overrides };
}

const ids = (patients: TestPatient[]) => patients.map((p) => p.id);

describe('sortByUrgency', () => {
  it('puts the most open alerts first', () => {
    const sorted = sortByUrgency([patient('a', { alerts: 1 }), patient('b', { alerts: 3 }), patient('c')], TODAY);
    expect(ids(sorted)).toEqual(['b', 'a', 'c']);
  });

  it('then puts overdue visits first; today and future visits are not overdue', () => {
    const sorted = sortByUrgency(
      [
        patient('future', { nextVisit: '2026-10-14' }),
        patient('today', { nextVisit: TODAY }),
        patient('none'),
        patient('overdue', { nextVisit: '2026-10-12' }),
      ],
      TODAY,
    );
    expect(ids(sorted)[0]).toBe('overdue');
    expect(ids(sorted).slice(1)).toEqual(['future', 'today', 'none']);
  });

  it('then orders compliance missing, late, on-track', () => {
    const sorted = sortByUrgency(
      [patient('on-track'), patient('late', { compliance: 'late' }), patient('missing', { compliance: 'missing' })],
      TODAY,
    );
    expect(ids(sorted)).toEqual(['missing', 'late', 'on-track']);
  });

  it('then puts the most pending submissions first', () => {
    const sorted = sortByUrgency(
      [patient('a', { pendingSubmissions: 2 }), patient('b', { pendingSubmissions: 7 }), patient('c')],
      TODAY,
    );
    expect(ids(sorted)).toEqual(['b', 'a', 'c']);
  });

  it('applies the keys in priority order', () => {
    const sorted = sortByUrgency(
      [
        patient('pending', { pendingSubmissions: 9 }),
        patient('missing', { compliance: 'missing' }),
        patient('overdue', { nextVisit: '2026-10-01' }),
        patient('alert', { alerts: 1 }),
      ],
      TODAY,
    );
    expect(ids(sorted)).toEqual(['alert', 'overdue', 'missing', 'pending']);
  });

  it('keeps input order for ties and does not modify the input', () => {
    const input = [patient('a'), patient('b'), patient('c', { alerts: 1 })];
    const sorted = sortByUrgency(input, TODAY);
    expect(ids(sorted)).toEqual(['c', 'a', 'b']);
    expect(ids(input)).toEqual(['a', 'b', 'c']);
  });
});

describe('urgencyReasons', () => {
  const base: ReasonFields = {
    alerts: 0,
    nextVisit: null,
    compliance: 'on-track',
    pendingSubmissions: 0,
    lastSubmission: '2026-10-13T08:00:00',
  };
  const labels = (overrides: Partial<ReasonFields>) => urgencyReasons({ ...base, ...overrides }, TODAY).map((r) => r.label);

  it('is empty when nothing is urgent', () => {
    expect(labels({ nextVisit: '2026-10-14' })).toEqual([]);
  });

  it('lists every reason in priority order', () => {
    expect(labels({ alerts: 3, nextVisit: '2026-10-12', lastSubmission: null, pendingSubmissions: 7 })).toEqual([
      '3 alerts',
      'Visit overdue',
      'No submissions yet',
      '7 to review',
    ]);
  });

  it('uses the singular for one alert and flags a visit due today', () => {
    expect(labels({ alerts: 1, nextVisit: TODAY })).toEqual(['1 alert', 'Visit today']);
  });

  it('marks alerts and overdue visits critical', () => {
    const tones = urgencyReasons({ ...base, alerts: 2, nextVisit: '2026-10-01', pendingSubmissions: 1 }, TODAY).map((r) => r.tone);
    expect(tones).toEqual(['critical', 'critical', 'warning']);
  });
});
