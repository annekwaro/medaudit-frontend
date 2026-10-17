import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Honorifics skipped when taking initials ("Dr. Sarah Martin" → "SM"). */
const TITLES = new Set(['dr.', 'dr', 'prof.', 'prof', 'mr.', 'mrs.', 'ms.']);

/**
 * Round initials avatar. Decorative: the name is always shown next to it, so it's hidden from
 * screen readers. `tone="dark"` fills it deep teal (the signed-in user); the default is pale teal.
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ initials() }}',
  styleUrl: './avatar.component.scss',
  host: { 'aria-hidden': 'true', '[attr.data-tone]': 'tone()' },
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly tone = input<'light' | 'dark'>('light');

  readonly initials = computed(() => {
    const parts = this.name().split(/\s+/).filter((part) => part && !TITLES.has(part.toLowerCase()));
    const letters = parts.length > 1 ? [parts[0], parts.at(-1)!] : parts;
    return letters.map((part) => part[0]).join('').toUpperCase();
  });
}
