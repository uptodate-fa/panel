import { Route } from '@angular/router';
import { UptodateAccountsListComponent } from './list/list.component';

export const uptodateAccountsRoutes: Route[] = [
  { path: 'list', component: UptodateAccountsListComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
