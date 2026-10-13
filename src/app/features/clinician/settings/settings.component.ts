import { DatePipe } from '@angular/common';
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
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PatientDataService } from '../../../core/services/patient-data.service';
import { DateFormat, PREFERENCE_DEFAULTS, UserPreferencesService } from '../../../core/services/user-preferences.service';

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

interface NotificationSetting {
  label: string;
  description: string;
  state: WritableSignal<boolean>;
}

interface DisplayDraft {
  dateFormat: DateFormat;
  compactRows: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NOTIFICATION_DEFAULTS = {
  notifyFlagged: true,
  notifySubmission: false,
  dailyDigest: true,
  weeklySummary: false,
};

@Component({
  selector: 'app-clinician-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
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
  private readonly preferences = inject(UserPreferencesService);

  /** The mock "today", used to preview each date format. */
  readonly today = inject(PatientDataService).today;

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

  // ── Notifications ── Read mode shows On/Off text; toggles write straight to their signals while
  // editing, and Cancel restores the snapshot.
  readonly editingNotifications = signal(false);
  private readonly notificationsSnapshot = signal<boolean[]>([]);
  private readonly notificationsEditButton = viewChild<ElementRef<HTMLButtonElement>>('notificationsEdit');
  private readonly firstNotificationToggle = viewChild<MatSlideToggle>('notificationToggle');

  readonly notifications: NotificationSetting[] = [
    {
      label: 'Email me when a patient is flagged',
      description: 'When the compliance monitor or a colleague flags one of your patients.',
      state: signal(NOTIFICATION_DEFAULTS.notifyFlagged),
    },
    {
      label: 'Email me when a new submission arrives',
      description: 'One email per diary submission, so this can be frequent.',
      state: signal(NOTIFICATION_DEFAULTS.notifySubmission),
    },
    {
      label: 'Daily digest at 8:00 AM',
      description: "Yesterday's submissions and alerts in one email.",
      state: signal(NOTIFICATION_DEFAULTS.dailyDigest),
    },
    {
      label: 'Weekly summary on Mondays',
      description: 'Compliance trends for your site over the past week.',
      state: signal(NOTIFICATION_DEFAULTS.weeklySummary),
    },
  ];

  readonly notificationsChanged = computed(() => {
    const snapshot = this.notificationsSnapshot();
    return this.notifications.some((item, i) => item.state() !== snapshot[i]);
  });

  // ── Display ── Edits go to a draft; Save applies it app-wide through UserPreferencesService.
  // No language setting until the UI is actually translated.
  readonly dateFormat = this.preferences.dateFormat.asReadonly();
  readonly compactRows = this.preferences.compactRows.asReadonly();

  readonly editingDisplay = signal(false);
  readonly displayDraft = signal<DisplayDraft>({ dateFormat: this.dateFormat(), compactRows: this.compactRows() });
  readonly displayChanged = computed(() => {
    const draft = this.displayDraft();
    return draft.dateFormat !== this.dateFormat() || draft.compactRows !== this.compactRows();
  });
  readonly displayIsDefault = computed(() => {
    const draft = this.displayDraft();
    return draft.dateFormat === PREFERENCE_DEFAULTS.dateFormat && draft.compactRows === PREFERENCE_DEFAULTS.compactRows;
  });

  private readonly displayEditButton = viewChild<ElementRef<HTMLButtonElement>>('displayEdit');
  private readonly dateFormatSelect = viewChild<MatSelect>('dateFormatSelect');

  /** Previewed with today's date in the template, e.g. "Oct 13, 2026". */
  readonly dateFormatOptions: DateFormat[] = ['MMM d, y', 'dd MMM yyyy', 'MM/dd/yyyy'];

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

  editDisplay(): void {
    this.displayDraft.set({ dateFormat: this.dateFormat(), compactRows: this.compactRows() });
    this.editingDisplay.set(true);
    this.focusAfterRender(() => this.dateFormatSelect()?.focus());
  }

  updateDisplayDraft(change: Partial<DisplayDraft>): void {
    this.displayDraft.update((draft) => ({ ...draft, ...change }));
  }

  /** Resets the draft only; Save still applies it. */
  resetDisplayDraft(): void {
    this.displayDraft.set({ ...PREFERENCE_DEFAULTS });
  }

  saveDisplay(): void {
    const draft = this.displayDraft();
    this.preferences.dateFormat.set(draft.dateFormat);
    this.preferences.compactRows.set(draft.compactRows);
    this.editingDisplay.set(false);
    this.snackBar.open('Display preferences updated', undefined, { duration: 3000 });
    this.focusAfterRender(() => this.displayEditButton()?.nativeElement.focus());
  }

  cancelDisplay(): void {
    this.editingDisplay.set(false);
    this.focusAfterRender(() => this.displayEditButton()?.nativeElement.focus());
  }

  /** Move focus once the swapped-in controls exist, so keyboard users aren't dropped to <body>. */
  private focusAfterRender(focus: () => void): void {
    afterNextRender(focus, { injector: this.injector });
  }
}
