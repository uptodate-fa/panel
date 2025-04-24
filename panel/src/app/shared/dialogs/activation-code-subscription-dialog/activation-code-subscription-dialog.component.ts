import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SHARED } from '../..';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { SubscriptionFormDialogComponent } from '../subscription-form-dialog/subscription-form-dialog.component';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-activation-code-subscription-dialog',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './activation-code-subscription-dialog.component.html',
  styleUrl: './activation-code-subscription-dialog.component.scss',
})
export class ActivationCodeSubscriptionDialogComponent {
  readonly dialog = inject(MatDialog);
  readonly data? = inject<{
    force?: boolean;
  }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(
    MatDialogRef<ActivationCodeSubscriptionDialogComponent>,
  );
  public http = inject(HttpClient);
  public snack = inject(MatSnackBar);
  public auth = inject(AuthService);
  codeControl = new FormControl('');

  mutation = injectMutation(() => ({
    mutationFn: (code: string) =>
      lastValueFrom(this.http.get<void>(`/api/subscription/active/${code}`)),
    onSuccess: async () => {
      location.reload();
    },
    onError: (error: any) => {
      switch (error.status) {
        case HttpStatusCode.Conflict:
          this.snack.open('This activation code has already been used.', '', {
            duration: 5000,
          });
          break;
        case HttpStatusCode.Gone:
          this.snack.open('This activation code has expired.', '', {
            duration: 5000,
          });
          break;
        default:
          this.snack.open(
            'Invalid activation code. Please check and try again.',
            '',
            { duration: 5000 },
          );
          break;
      }
    },
  }));

  save() {
    if (!this.codeControl.value) return;
    this.mutation.mutate(this.codeControl?.value);
  }

  noCodeClick() {
    this.dialogRef.close();
    this.dialog.open(SubscriptionFormDialogComponent, {
      data: { force: this.data?.force },
      disableClose: true,
    });
  }
}
