import { Route } from '@angular/router';
import { UserListComponent } from './list/list.component';

export const usersRoutes: Route[] = [
  { path: 'list', component: UserListComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
