import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from '../../shared/dialogs/profile-dialog/profile-dialog.component';

export const profileGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const dialog = inject(MatDialog);
  setTimeout(async () => {
    await auth.complete();
    if (!auth.isProfileComplete && auth.user) {
      dialog.open(ProfileDialogComponent, {
        disableClose: true,
      });
    }
  }, 3000);
  return true;
};
