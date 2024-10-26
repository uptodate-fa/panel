import { Component, computed, inject, signal } from '@angular/core';
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
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { HALF_YEAR_DAYS, SubscriptionDto, YEARLY_DAYS } from '@uptodate/types';
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
  YEARLY_DAYS = YEARLY_DAYS;
  HALF_YEAR_DAYS = HALF_YEAR_DAYS;

  readonly dialogRef = inject(MatDialogRef<SubscriptionFormDialogComponent>);
  readonly data = inject<{
    force?: boolean;
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  public auth = inject(AuthService);
  public http = inject(HttpClient);
  public snack = inject(MatSnackBar);

  private formData = signal<SubscriptionDto | undefined>(undefined);
  price = computed(() => {
    const data = this.formData();
    return SubscriptionDto.price(data);
  });

  mutation = injectMutation(() => ({
    mutationFn: (dto: SubscriptionDto) =>
      lastValueFrom(
        this.http.post(`/api/subscription/payment`, dto, {
          responseType: 'text',
        }),
      ),
    onSuccess: async (link: string) => {
      window.location.href = link;
    },
  }));

  form: FormGroup;
  constructor() {
    this.form = this.fb.group({
      days: [HALF_YEAR_DAYS, Validators.required],
      maxDevice: [1, Validators.required],
    });

    this.formData.set({ days: HALF_YEAR_DAYS, maxDevice: 1 });

    this.form.valueChanges.subscribe((dto) => {
      this.formData.set(dto);
    });
  }

  save() {
    if (this.form.invalid) return;
    this.mutation.mutate(this.form.getRawValue());
  }
}
