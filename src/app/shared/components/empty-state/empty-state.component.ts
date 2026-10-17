import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Empty state: an icon in a soft circle, a title and a hint, with an optional action projected in
 * (e.g. a "Clear filters" button).
 */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <span class="empty-state__icon" aria-hidden="true"><mat-icon>{{ icon() }}</mat-icon></span>
    <p class="empty-state__title">{{ title() }}</p>
    @if (hint(); as text) {
      <p class="empty-state__hint">{{ text }}</p>
    }
    <ng-content />
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly icon = input('search_off');
  readonly title = input.required<string>();
  readonly hint = input<string>();
}
