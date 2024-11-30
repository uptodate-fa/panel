import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OtpComponent } from './otp/otp.component';
import { PasswordComponent } from './password/password.component';

export const authRoutes: Route[] = [
  { path: '', component: LoginComponent },
  { path: 'otp', component: OtpComponent },
  { path: 'password', component: PasswordComponent },
];
