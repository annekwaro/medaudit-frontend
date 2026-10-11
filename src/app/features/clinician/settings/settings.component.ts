import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

type Language = 'en' | 'fr';
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
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly snackBar = inject(MatSnackBar);

  // Read-only; managed by the site administrator.
  readonly profile: { label: string; value: string }[] = [
    { label: 'Name', value: 'Dr. Sarah Martin' },
    { label: 'Role', value: 'Clinician' },
    { label: 'Site', value: 'Site 042 · Grenoble' },
    { label: 'Email', value: 's.martin@medaudit.example' },
  ];

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

  readonly languageOptions: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
  ];

  readonly dateFormatOptions: { value: DateFormat; label: string }[] = [
    { value: 'dd MMM yyyy', label: 'DD MMM YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  ];

  save(): void {
    // No persistence yet.
    this.snackBar.open('Settings saved', undefined, { duration: 3000 });
  }

  resetToDefaults(): void {
    this.notifyFlagged.set(DEFAULTS.notifyFlagged);
    this.notifySubmission.set(DEFAULTS.notifySubmission);
    this.dailyDigest.set(DEFAULTS.dailyDigest);
    this.weeklySummary.set(DEFAULTS.weeklySummary);
    this.language.set(DEFAULTS.language);
    this.dateFormat.set(DEFAULTS.dateFormat);
    this.compactRows.set(DEFAULTS.compactRows);
  }
}
