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

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.auth.clearToken()
  }

  async sendToken(phone: string, ev: SubmitEvent) {
    if (phone.length !== 11) return;
    phone = PersianNumberService.toEnglish(phone);
    this.loading.set(true);
    const res = await this.auth.preLogin(`${phone}`);

    this.router.navigate([res?.password ? '/login/password' : '/login/otp'], {
      state: { phone: `${phone}` },
      queryParams: this.route.snapshot.queryParams,
    });
    ev.preventDefault();
  }
}
