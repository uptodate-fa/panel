import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { SHARED } from '../../shared';
import { AuthService } from '../auth.service';
import { PersianNumberService } from '@uptodate/utils';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [
    CommonModule,
    SHARED,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss',
})
export class PasswordComponent {
  loading = signal(false);
  phone: string;

  constructor(
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    private route: ActivatedRoute,
  ) {
    const phone = this.router.getCurrentNavigation()?.extras?.state?.['phone'];

    if (!phone) {
      router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.phone = phone;
  }

  async login(password: string, ev: SubmitEvent) {
    if (!password) return;
    password = PersianNumberService.toEnglish(password);
    this.loading.set(true);
    try {
      await this.auth.loginWithPassword(this.phone, password);
      this.router.navigate(['/'], { replaceUrl: true });
    } catch (error) {
      this.snack.open('password is incorrect', '', { duration: 3000 });
      this.loading.set(false);
    }
    ev.preventDefault();
  }

  async loginWithOtp() {
    await this.auth.sendToken(`${this.phone}`);
    this.loading.set(true);
    this.router.navigate(['/login/otp'], {
      state: { phone: `${this.phone}` },
      queryParams: this.route.snapshot.queryParams,
    });
  }
}
