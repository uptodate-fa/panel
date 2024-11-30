import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionFormDialogComponent } from '../../shared/dialogs/subscription-form-dialog/subscription-form-dialog.component';
import { ActivationCodeSubscriptionDialogComponent } from '../../shared/dialogs/activation-code-subscription-dialog/activation-code-subscription-dialog.component';

export const subscriptionGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const dialog = inject(MatDialog);
  await auth.complete();
  if (auth.isProfileComplete && auth.user) {
    if (!auth.user.subscription)
      dialog.open(ActivationCodeSubscriptionDialogComponent, {
        disableClose: true,
      });
    else if (new Date(auth.user.subscription.expiredAt).valueOf() < Date.now())
      dialog.open(SubscriptionFormDialogComponent, {
        data: { force: true },
        disableClose: true,
      });
  }
  return true;
};
