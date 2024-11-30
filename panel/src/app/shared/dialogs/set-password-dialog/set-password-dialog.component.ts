import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { SHARED } from '../..';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { SubscriptionFormDialogComponent } from '../subscription-form-dialog/subscription-form-dialog.component';

@Component({
  selector: 'app-set-password-dialog',
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
  templateUrl: './set-password-dialog.component.html',
  styleUrl: './set-password-dialog.component.scss',
})
export class SetPasswordDialogComponent {
  readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<SetPasswordDialogComponent>);
  public http = inject(HttpClient);
  public snack = inject(MatSnackBar);
  passwordControl = new FormControl('', Validators.required);
  confirmPasswordControl = new FormControl('', Validators.required);

  mutation = injectMutation(() => ({
    mutationFn: (password: string) =>
      lastValueFrom(this.http.post<void>(`/api/auth/password`, { password })),
    onSuccess: async () => {
      location.reload();
    },
  }));

  save() {
    if (!this.passwordControl.value || !this.confirmPasswordControl.value)
      return;
    if (this.passwordControl.value !== this.confirmPasswordControl.value) {
      this.snack.open('Passwords do not match. Please try again.', '', {
        duration: 5000,
      });
      return;
    }
    this.mutation.mutate(this.passwordControl?.value);
  }
}
