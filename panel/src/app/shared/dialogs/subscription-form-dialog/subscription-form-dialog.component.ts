import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHARED } from '../..';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental';
import {
  DiscountCoupon,
  HALF_YEAR_DAYS,
  SubscriptionDto,
  YEARLY_DAYS,
} from '@uptodate/types';
import { HttpClient } from '@angular/common/http';
import { debounceTime, lastValueFrom } from 'rxjs';
import { ActivationCodeSubscriptionDialogComponent } from '../activation-code-subscription-dialog/activation-code-subscription-dialog.component';

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

  readonly dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<SubscriptionFormDialogComponent>);
  readonly data? = inject<{
    force?: boolean;
  }>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  public auth = inject(AuthService);
  public http = inject(HttpClient);
  public snack = inject(MatSnackBar);

  @ViewChild('couponInput') couponInputElem: ElementRef;

  couponCodeControl = new FormControl('');
  couponCode = signal<string | null>('');

  private formData = signal<SubscriptionDto | undefined>(undefined);
  price = computed(() => {
    const data = this.formData();
    const coupon = this.couponQuery.data();

    return SubscriptionDto.price(data, coupon);
  });

  mutation = injectMutation(() => ({
    mutationFn: (dto: SubscriptionDto) =>
      lastValueFrom(
        this.http.post(`/api/subscription/payment`, dto, {
          responseType: 'text',
        }),
      ),
    onSuccess: async (link: string) => {
      if (link) {
        window.location.href = link;
      } else {
        location.reload();
      }
    },
  }));

  couponQuery = injectQuery(() => ({
    queryKey: ['coupon', this.couponCode()],
    queryFn: () =>
      lastValueFrom(
        this.http.get<DiscountCoupon>(
          `/api/subscription/coupon/${this.couponCode()}`,
        ),
      ),
    enabled: this.couponCode() !== '',
    retry: false,
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

    this.couponCodeControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(async (code) => {
        this.couponCode.set(code);
      });

    effect(() => {
      this.couponCodeControl.enable();
      if (this.couponQuery.status() === 'error') {
        this.couponCodeControl.setErrors({ notFound: true });
        this.couponInputElem?.nativeElement.blur();
      } else if (
        this.couponQuery.status() === 'success' &&
        this.couponQuery.data()
      ) {
        this.couponCodeControl.disable();
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    const dto: SubscriptionDto = this.form.getRawValue();
    if (this.couponQuery.data())
      dto.discountCouponId = this.couponQuery.data()?._id;

    this.mutation.mutate(dto);
  }

  haveCodeClick() {
    this.dialogRef.close();
    this.dialog.open(ActivationCodeSubscriptionDialogComponent, {
      disableClose: this.data?.force,
      data: {
        force: this.data?.force,
      },
    });
  }
}
