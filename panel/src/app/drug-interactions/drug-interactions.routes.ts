import { Route } from '@angular/router';
import { DrugInteractionsComponent } from './drug-interactions.component';
import { DrugInteractionDetailsComponent } from './details/details.component';

export const drugInteractionsRoutes: Route[] = [
  {
    path: '',
    component: DrugInteractionsComponent,
  },
  {
    path: ':id',
    component: DrugInteractionDetailsComponent,
  },
];
