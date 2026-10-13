import { Injectable } from '@angular/core';

/**
 * Remembers which pages have been shown since the app loaded, so entrance animations play on the
 * first visit only. Clinicians return to the same pages many times a day; a reload starts over.
 */
@Injectable({ providedIn: 'root' })
export class FirstVisitService {
  private readonly seen = new Set<string>();

  /** True the first time it's called for `key` in this app session, false afterwards. */
  isFirstVisit(key: string): boolean {
    if (this.seen.has(key)) return false;
    this.seen.add(key);
    return true;
  }
}
