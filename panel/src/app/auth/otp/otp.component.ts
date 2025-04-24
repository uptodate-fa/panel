import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { CommonModule, PlatformLocation } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SHARED } from '../../shared';
import { AuthService } from '../auth.service';
import { PersianNumberService } from '@uptodate/utils';
import { MatCardModule } from '@angular/material/card';
import { HttpStatusCode } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../shared/dialogs/alert-dialog/alert-dialog.component';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
  ],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss',
})
export class OtpComponent implements OnDestroy {
  time = signal(60);
  phone: string;
  loading = signal(false);
  error = signal(false);
  interval?: any;
  otpFormControl = new FormControl();
  saveLogin = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    private dialog: MatDialog,
  ) {
    const phone = this.router.getCurrentNavigation()?.extras?.state?.['phone'];

    if (!phone) {
      router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.phone = phone;
    this.resetTimer();

    this.otpFormControl.valueChanges.subscribe((value) => {
      this.error.set(false);
    });
  }

  async setToken(ev?: Event) {
    this.loading.set(true);
    const token = PersianNumberService.toEnglish(this.otpFormControl.value);
    try {
      await this.auth.login(this.phone, token, this.saveLogin);
      this.router.navigate(['/'], { replaceUrl: true });
    } catch (error: any) {
      this.error.set(true);
      if (error.status === HttpStatusCode.Forbidden) {
        this.snack.open('code is not correct', '', { duration: 2000 });
      } else if (error.status === HttpStatusCode.TooManyRequests) {
        this.dialog.open(AlertDialogComponent, {
          data: {
            title: 'Login Error',
            description:
              'You have reached the maximum number of devices allowed for login. To access your account on a new device, please contact support for assistance.',
            hideCancel: true,
          },
        });
      }
      this.loading.set(false);
    }
    ev?.preventDefault?.();
  }

  resetTimer() {
    this.time.set(60);
    this.otpFormControl?.setValue(null);
    this.error.set(false);
    if (this.interval) clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.time.update((prev) => {
        if (prev > 0) return prev - 1;
        return 0;
      });
    }, 1000);
  }

  async sendTokenAgain() {
    if (!this.time()) {
      this.loading.set(true);
      await this.auth.sendToken(this.phone);
      this.loading.set(false);
      this.resetTimer();
    }
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
  }
}
