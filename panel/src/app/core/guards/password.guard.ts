import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SetPasswordDialogComponent } from '../../shared/dialogs/set-password-dialog/set-password-dialog.component';

export const passwordGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const dialog = inject(MatDialog);
  await auth.complete();
  if (auth.isProfileComplete && auth.user) {
    if (!auth.user.password)
      await dialog
        .open(SetPasswordDialogComponent, {
          disableClose: true,
        })
        .afterClosed()
        .toPromise();
  }
  return true;
};
