import { computed, Injectable, signal } from '@angular/core';

/** Full-date patterns for Angular's DatePipe. */
export type DateFormat = 'MMM d, y' | 'dd MMM yyyy' | 'MM/dd/yyyy';

/** The same order without the year, for day + time stamps and weekday dates. */
const SHORT_DATE: Record<DateFormat, string> = {
  'MMM d, y': 'MMM d',
  'dd MMM yyyy': 'dd MMM',
  'MM/dd/yyyy': 'MM/dd',
};

export const PREFERENCE_DEFAULTS = {
  dateFormat: 'MMM d, y' as DateFormat,
  compactRows: false,
};

/**
 * Display preferences set on the Settings page and read across the app.
 * Session state only until there's a user profile API.
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  /** Full dates, e.g. "Oct 13, 2026" / "13 Oct 2026" / "10/13/2026". */
  readonly dateFormat = signal<DateFormat>(PREFERENCE_DEFAULTS.dateFormat);
  /** Tighter table rows (44px instead of 56px). */
  readonly compactRows = signal(PREFERENCE_DEFAULTS.compactRows);

  /** e.g. "Oct 13, 08:05" / "13 Oct, 08:05" / "10/13, 08:05". */
  readonly dateTime = computed(() => `${SHORT_DATE[this.dateFormat()]}, HH:mm`);
  /** e.g. "Tue, Oct 13" / "Tue, 13 Oct" / "Tue, 10/13". */
  readonly weekdayDate = computed(() => `EEE, ${SHORT_DATE[this.dateFormat()]}`);
}
