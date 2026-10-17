import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PatientDataService } from '../../../../../core/services/patient-data.service';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';
import { AvatarComponent } from '../../../../../shared/components/avatar/avatar.component';
import { DiaryDotComponent } from '../../../../../shared/components/diary-dot/diary-dot.component';
import { DiaryDayStatus, PatientProfile } from '../../../../../shared/models/patient.model';
import { daysBetween } from '../../../../../shared/utils/dates';

/** Days shown before and after today: a week of diary history, a week of upcoming visits. */
const DAYS_BEFORE = 6;
const DAYS_AFTER = 7;

/**
 * Protocol visit window: the visit may happen this many days either side of its scheduled date.
 * TODO: read from the study protocol config once it exists.
 */
export const VISIT_WINDOW_DAYS = 2;

type VisitTone = 'overdue' | 'today' | 'upcoming';

interface TimelineDay {
  iso: string;
  /** Local midnight, for the date pipe. */
  date: Date;
  isToday: boolean;
  isWeekend: boolean;
}

interface TimelineCell {
  iso: string;
  /** Null for future days. */
  status: DiaryDayStatus | null;
}

interface VisitBar {
  /** 0-based first and last visible day columns of the window. */
  first: number;
  last: number;
  date: string;
  tone: VisitTone;
}

interface TimelineRow {
  id: string;
  name: string;
  cells: TimelineCell[];
  /** The visit window, clipped to the visible days; null if it falls outside them. */
  visit: VisitBar | null;
  /** A scheduled visit after the visible range, shown as a "later" hint. */
  laterVisit: string | null;
  /** Screen-reader name for the row link. */
  summary: string;
}

const DIARY_LABELS: Record<DiaryDayStatus, string> = {
  submitted: 'submitted',
  late: 'late',
  missed: 'missed',
  due: 'due today',
  'not-enrolled': 'not enrolled',
};

function addDays(iso: string, offset: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
}

function localDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Patient × day grid (Planned Absences pattern): a week of diary dots up to today, then each
 * patient's visit window as a bar. Today's column is tinted; days before enrollment are hatched.
 * Each row links to the patient.
 */
@Component({
  selector: 'app-visit-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatCardModule, MatIconModule, AvatarComponent, DiaryDotComponent],
  templateUrl: './visit-timeline.component.html',
  styleUrl: './visit-timeline.component.scss',
})
export class VisitTimelineComponent {
  readonly patients = input.required<readonly PatientProfile[]>();
  /** ISO date, e.g. `PatientDataService.today`. */
  readonly today = input.required<string>();

  private readonly patientData = inject(PatientDataService);
  readonly preferences = inject(UserPreferencesService);
  readonly windowDays = VISIT_WINDOW_DAYS;

  readonly days = computed<TimelineDay[]>(() =>
    Array.from({ length: DAYS_BEFORE + 1 + DAYS_AFTER }, (_, i) => {
      const iso = addDays(this.today(), i - DAYS_BEFORE);
      const date = localDate(iso);
      return { iso, date, isToday: i === DAYS_BEFORE, isWeekend: date.getDay() === 0 || date.getDay() === 6 };
    }),
  );

  readonly rows = computed<TimelineRow[]>(() => {
    const today = this.today();
    const days = this.days();
    const firstDay = days[0].iso;
    const lastIndex = days.length - 1;

    return this.patients().map((patient) => {
      const cells = days.map(({ iso }) => ({
        iso,
        status: iso > today ? null : this.patientData.diaryStatus(patient, iso),
      }));

      let visit: VisitBar | null = null;
      let laterVisit: string | null = null;
      if (patient.nextVisit) {
        const offset = daysBetween(firstDay, patient.nextVisit);
        const first = Math.max(offset - VISIT_WINDOW_DAYS, 0);
        const last = Math.min(offset + VISIT_WINDOW_DAYS, lastIndex);
        if (first <= last) {
          const daysAway = daysBetween(today, patient.nextVisit);
          const tone: VisitTone = daysAway < 0 ? 'overdue' : daysAway === 0 ? 'today' : 'upcoming';
          visit = { first, last, date: patient.nextVisit, tone };
        } else if (offset > lastIndex) {
          laterVisit = patient.nextVisit;
        }
      }

      return { id: patient.id, name: patient.name, cells, visit, laterVisit, summary: this.summarize(patient, cells, visit) };
    });
  });

  /** The hatching legend entry only appears when some visible day is before enrollment. */
  readonly anyNotEnrolled = computed(() =>
    this.rows().some((row) => row.cells.some((cell) => cell.status === 'not-enrolled')),
  );

  private summarize(patient: PatientProfile, cells: TimelineCell[], visit: VisitBar | null): string {
    const counted = cells.filter((cell) => cell.status && cell.status !== 'not-enrolled' && cell.status !== 'due');
    const submitted = counted.filter((cell) => cell.status === 'submitted' || cell.status === 'late').length;
    const late = counted.filter((cell) => cell.status === 'late').length;
    const today = cells.find((cell) => cell.iso === this.today())?.status;
    const parts = [
      `${patient.name}, ${patient.id}`,
      `${submitted} of ${counted.length} diaries in the past week${late ? `, ${late} late` : ''}`,
    ];
    if (today) parts.push(`today ${DIARY_LABELS[today]}`);
    if (visit) {
      const date = localDate(visit.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      parts.push(visit.tone === 'overdue' ? `visit overdue since ${date}` : visit.tone === 'today' ? 'visit today' : `visit ${date}`);
    }
    return parts.join('; ');
  }
}
