import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../..';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { SubscriptionDto } from '@uptodate/types';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-subscription-form-dialog',
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
  templateUrl: './subscription-form-dialog.component.html',
  styleUrl: './subscription-form-dialog.component.scss',
})
export class SubscriptionFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SubscriptionFormDialogComponent>);
  private fb = inject(FormBuilder);
  public auth = inject(AuthService);
  public http = inject(HttpClient);
  public snack = inject(MatSnackBar);

  mutation = injectMutation(() => ({
    mutationFn: (dto: SubscriptionDto) =>
      lastValueFrom(this.http.post(`/api/subscription/payment`, dto)),
    onSuccess: async () => {
      await this.auth.revalidateUserInfo();
      this.snack.open('Subscription Purchased Successfully!', '', {
        duration: 3000,
      });
      this.dialogRef.close();
    },
  }));

  form: FormGroup;
  constructor() {
    this.form = this.fb.group({
      days: [183, Validators.required],
      maxDevice: [1, Validators.required],
    });
  }

  save() {
    if (this.form.invalid) return;
    this.mutation.mutate(this.form.getRawValue());
  }
}
