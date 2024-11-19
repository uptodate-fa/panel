import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from '../../shared/dialogs/profile-dialog/profile-dialog.component';

export const profileGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const dialog = inject(MatDialog);
  await auth.complete();
  if (!auth.isProfileComplete && auth.user) {
    await dialog
      .open(ProfileDialogComponent, {
        disableClose: true,
      })
      .afterClosed()
      .toPromise();
  }
  return true;
};
