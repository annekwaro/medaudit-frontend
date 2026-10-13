import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { UserPreferencesService } from '../../../../../core/services/user-preferences.service';
import { PatientProfile } from '../../../../../shared/models/patient.model';

type VisitStatus = 'overdue' | 'today' | 'upcoming';

interface VisitRow {
  id: string;
  name: string;
  /** ISO date. */
  date: string;
  status: VisitStatus;
  /** "Overdue", "Today", "In 3 days". */
  statusLabel: string;
  icon: string;
}

/** Visits up to this many days ahead are listed, after overdue and today's. */
const DAYS_AHEAD = 7;

const STATUS_ICONS: Record<VisitStatus, string> = {
  overdue: 'event_busy',
  today: 'today',
  upcoming: 'event',
};

/** Whole days from one ISO date (yyyy-MM-dd) to another; negative if `to` is earlier. UTC avoids DST shifts. */
function daysBetween(from: string, to: string): number {
  const utc = (iso: string) => {
    const [year, month, day] = iso.split('-').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

function statusLabel(days: number): string {
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  return `In ${days} day${days === 1 ? '' : 's'}`;
}

/** Overdue, today's and next-7-days patient visits, soonest (most overdue) first. Each row links to the patient. */
@Component({
  selector: 'app-upcoming-visits',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, MatCardModule, MatIconModule],
  templateUrl: './upcoming-visits.component.html',
  styleUrl: './upcoming-visits.component.scss',
})
export class UpcomingVisitsComponent {
  readonly patients = input.required<readonly PatientProfile[]>();
  /** ISO date, e.g. `PatientDataService.today`. */
  readonly today = input.required<string>();

  readonly daysAhead = DAYS_AHEAD;
  readonly preferences = inject(UserPreferencesService);

  readonly visits = computed<VisitRow[]>(() => {
    const today = this.today();
    return this.patients()
      .flatMap((patient) => {
        if (!patient.nextVisit) return [];
        const days = daysBetween(today, patient.nextVisit);
        return days <= DAYS_AHEAD ? [{ patient, date: patient.nextVisit, days }] : [];
      })
      .sort((a, b) => a.days - b.days)
      .map(({ patient, date, days }) => {
        const status: VisitStatus = days < 0 ? 'overdue' : days === 0 ? 'today' : 'upcoming';
        return { id: patient.id, name: patient.name, date, status, statusLabel: statusLabel(days), icon: STATUS_ICONS[status] };
      });
  });
}
