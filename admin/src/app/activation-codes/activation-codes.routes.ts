import { Route } from '@angular/router';
import { ActivationCodesListComponent } from './list/list.component';

export const activationCodesRoutes: Route[] = [
  { path: 'list', component: ActivationCodesListComponent },
  { path: '', redirectTo: 'list', pathMatch: 'full' },
];
