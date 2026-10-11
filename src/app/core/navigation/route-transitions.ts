import { ActivatedRouteSnapshot, ViewTransitionInfo, withViewTransitions } from '@angular/router';

/** Top-level clinician pages that cross-fade into each other. */
const FADE_PATHS = new Set(['clinician/dashboard', 'clinician/patients', 'clinician/audit-log']);

function fullPath(snapshot: ActivatedRouteSnapshot): string {
  const segments: string[] = [];
  for (let route: ActivatedRouteSnapshot | null = snapshot.root; route; route = route.firstChild) {
    segments.push(...route.url.map((segment) => segment.path));
  }
  return segments.join('/');
}

/**
 * Router View Transitions, limited to moves between the main clinician pages.
 * Skipped for reduced motion and unsupported browsers (the router falls back to an instant swap).
 * The 150ms fade itself is defined in styles.scss.
 */
export function withClinicianRouteTransitions() {
  return withViewTransitions({
    skipInitialTransition: true,
    onViewTransitionCreated: ({ transition, from, to }: ViewTransitionInfo) => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion || !FADE_PATHS.has(fullPath(from)) || !FADE_PATHS.has(fullPath(to))) {
        transition.skipTransition();
      }
    },
  });
}
