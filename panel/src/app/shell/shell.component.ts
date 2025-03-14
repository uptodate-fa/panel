import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ProfileDialogComponent } from '../shared/dialogs/profile-dialog/profile-dialog.component';
import { AuthService } from '../auth/auth.service';
import { SubscriptionFormDialogComponent } from '../shared/dialogs/subscription-form-dialog/subscription-form-dialog.component';
import { SHARED } from '../shared';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { DialogService } from '../core/services/dialog.service';
import { PwaService } from '../core/services/pwa.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterModule,
    SHARED,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    TranslateModule,
    SearchbarComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private dialog = inject(MatDialog);
  private dialogService = inject(DialogService);
  readonly pwa = inject(PwaService);
  auth = inject(AuthService);
  remainDays = computed(() => {
    const sub = this.auth.user?.subscription;
    if (sub) {
      return Math.floor(
        (new Date(sub.expiredAt).valueOf() - Date.now()) / 3600000 / 24,
      );
    }
    return -1;
  });

  openProfile() {
    this.dialog.open(ProfileDialogComponent);
  }

  openSubscriptionForm() {
    this.dialog.open(SubscriptionFormDialogComponent);
  }

  async logout() {
    const ok = await this.dialogService.alert(
      'Logout Confirmation',
      'Are you sure you want to logout?',
    );
    if (ok) {
      this.auth.clearToken();
      location.reload();
    }
  }
}
