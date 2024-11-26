import { Route } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { authRoutes } from './auth/auth.routes';
import { usersRoutes } from './users/users.routes';
import { activationCodesRoutes } from './activation-codes/activation-codes.routes';

export const appRoutes: Route[] = [
  {
    path: 'login',
    children: authRoutes,
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'codes', children: activationCodesRoutes },
      { path: 'users', children: usersRoutes },
      { path: '', redirectTo: 'users', pathMatch: 'full' },
    ],
  },
];
