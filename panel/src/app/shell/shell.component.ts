import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    TranslateModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private dialog = inject(MatDialog);
  auth = inject(AuthService);

  openProfile() {
    this.dialog.open(ProfileDialogComponent);
  }

  openSubscriptionForm() {
    this.dialog.open(SubscriptionFormDialogComponent);
  }
}
