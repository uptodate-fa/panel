import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { authRoutes } from './auth/auth.routes';

export const appRoutes: Route[] = [
  {
    path: 'login',
    children: authRoutes,
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [],
  },
];
