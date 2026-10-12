import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

type Language = 'en' | 'fr';

interface Profile {
  name: string;
  role: string;
  site: string;
  email: string;
}

interface ProfileField {
  key: keyof Profile;
  label: string;
  /** Role and site drive access control, so only the site administrator can change them. */
  editable: boolean;
  inputType?: 'text' | 'email';
  autocomplete?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Angular DatePipe format strings. */
type DateFormat = 'dd MMM yyyy' | 'MM/dd/yyyy';

const DEFAULTS = {
  notifyFlagged: true,
  notifySubmission: false,
  dailyDigest: true,
  weeklySummary: false,
  language: 'en' as Language,
  dateFormat: 'dd MMM yyyy' as DateFormat,
  compactRows: false,
};

@Component({
  selector: 'app-clinician-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly injector = inject(Injector);

  // ── Profile ── Saved values display in read mode; edits go to a draft until Save.
  readonly profile = signal<Profile>({
    name: 'Dr. Sarah Martin',
    role: 'Clinician',
    site: 'Site 042 · Grenoble',
    email: 's.martin@medaudit.example',
  });

  readonly profileFields: ProfileField[] = [
    { key: 'name', label: 'Name', editable: true, inputType: 'text', autocomplete: 'name' },
    { key: 'role', label: 'Role', editable: false },
    { key: 'site', label: 'Site', editable: false },
    { key: 'email', label: 'Email', editable: true, inputType: 'email', autocomplete: 'email' },
  ];

  readonly editingProfile = signal(false);
  readonly profileDraft = signal<Profile>(this.profile());

  readonly profileChanged = computed(() => {
    const saved = this.profile();
    const draft = this.profileDraft();
    return draft.name.trim() !== saved.name || draft.email.trim() !== saved.email;
  });
  readonly nameInvalid = computed(() => !this.profileDraft().name.trim());
  readonly emailInvalid = computed(() => !EMAIL_PATTERN.test(this.profileDraft().email.trim()));
  readonly canSaveProfile = computed(() => this.profileChanged() && !this.nameInvalid() && !this.emailInvalid());

  private readonly profileEditButton = viewChild<ElementRef<HTMLButtonElement>>('profileEdit');
  private readonly firstProfileInput = viewChild<ElementRef<HTMLInputElement>>('profileInput');

  // ── Notifications ── Toggles write straight to their signals while editing; Cancel restores the snapshot.
  readonly editingNotifications = signal(false);
  private readonly notificationsSnapshot = signal<boolean[]>([]);
  private readonly notificationsEditButton = viewChild<ElementRef<HTMLButtonElement>>('notificationsEdit');
  private readonly firstNotificationToggle = viewChild<MatSlideToggle>('notificationToggle');

  readonly notifyFlagged = signal(DEFAULTS.notifyFlagged);
  readonly notifySubmission = signal(DEFAULTS.notifySubmission);
  readonly dailyDigest = signal(DEFAULTS.dailyDigest);
  readonly weeklySummary = signal(DEFAULTS.weeklySummary);

  readonly language = signal<Language>(DEFAULTS.language);
  readonly dateFormat = signal<DateFormat>(DEFAULTS.dateFormat);
  readonly compactRows = signal(DEFAULTS.compactRows);

  readonly notifications: { label: string; state: WritableSignal<boolean> }[] = [
    { label: 'Email me when a patient is flagged', state: this.notifyFlagged },
    { label: 'Email me when a new submission arrives', state: this.notifySubmission },
    { label: 'Daily digest at 8:00 AM', state: this.dailyDigest },
    { label: 'Weekly summary on Mondays', state: this.weeklySummary },
  ];

  readonly notificationsChanged = computed(() => {
    const snapshot = this.notificationsSnapshot();
    return this.notifications.some((item, i) => item.state() !== snapshot[i]);
  });

  readonly languageOptions: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ];

  readonly dateFormatOptions: { value: DateFormat; label: string }[] = [
    { value: 'dd MMM yyyy', label: 'DD MMM YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  ];

  editProfile(): void {
    this.profileDraft.set(this.profile());
    this.editingProfile.set(true);
    this.focusAfterRender(() => this.firstProfileInput()?.nativeElement.focus());
  }

  updateDraft(key: keyof Profile, value: string): void {
    this.profileDraft.update((draft) => ({ ...draft, [key]: value }));
  }

  saveProfile(): void {
    if (!this.canSaveProfile()) return;
    // Signal state only; no persistence yet.
    const draft = this.profileDraft();
    this.profile.update((saved) => ({ ...saved, name: draft.name.trim(), email: draft.email.trim() }));
    this.editingProfile.set(false);
    this.snackBar.open('Profile updated', undefined, { duration: 3000 });
    this.focusAfterRender(() => this.profileEditButton()?.nativeElement.focus());
  }

  cancelProfile(): void {
    this.editingProfile.set(false);
    this.focusAfterRender(() => this.profileEditButton()?.nativeElement.focus());
  }

  editNotifications(): void {
    this.notificationsSnapshot.set(this.notifications.map((item) => item.state()));
    this.editingNotifications.set(true);
    this.focusAfterRender(() => this.firstNotificationToggle()?.focus());
  }

  saveNotifications(): void {
    this.editingNotifications.set(false);
    this.snackBar.open('Notification settings updated', undefined, { duration: 3000 });
    this.focusAfterRender(() => this.notificationsEditButton()?.nativeElement.focus());
  }

  cancelNotifications(): void {
    const snapshot = this.notificationsSnapshot();
    this.notifications.forEach((item, i) => item.state.set(snapshot[i]));
    this.editingNotifications.set(false);
    this.focusAfterRender(() => this.notificationsEditButton()?.nativeElement.focus());
  }

  /** Footer: Display Preferences only (Profile and Notifications have their own Save). */
  save(): void {
    // No persistence yet.
    this.snackBar.open('Display preferences saved', undefined, { duration: 3000 });
  }

  resetToDefaults(): void {
    this.language.set(DEFAULTS.language);
    this.dateFormat.set(DEFAULTS.dateFormat);
    this.compactRows.set(DEFAULTS.compactRows);
  }

  /** Move focus once the swapped-in controls exist, so keyboard users aren't dropped to <body>. */
  private focusAfterRender(focus: () => void): void {
    afterNextRender(focus, { injector: this.injector });
  }
}
