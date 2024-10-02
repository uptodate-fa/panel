import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SHARED } from '../..';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../auth/auth.service';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { User } from '@uptodate/types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
  ],
  templateUrl: './profile-dialog.component.html',
  styleUrl: './profile-dialog.component.scss',
})
export class ProfileDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ProfileDialogComponent>);
  private fb = inject(FormBuilder);
  public auth = inject(AuthService);
  public snack = inject(MatSnackBar);

  mutation = injectMutation(() => ({
    mutationFn: (dto: User) => this.auth.update(dto),
    onSuccess: () => {
      this.snack.open('Profile updated successfully!', '', { duration: 3000 });
      this.dialogRef.close();
    },
  }));

  form: FormGroup;
  constructor() {
    this.form = this.fb.group({
      firstName: [this.auth.user?.firstName, Validators.required],
      lastName: [this.auth.user?.lastName, Validators.required],
      birthDate: [this.auth.user?.birthDate, Validators.required],
      email: [this.auth.user?.email],
      job: [this.auth.user?.job, Validators.required],
      city: [this.auth.user?.city, Validators.required],
    });
  }

  save() {
    if (this.form.invalid) return;
    this.mutation.mutate(this.form.getRawValue());
  }
}
