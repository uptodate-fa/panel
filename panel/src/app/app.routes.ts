import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { searchRoutes } from './search/search.routes';
import { ContentComponent } from './content/content.component';
import { CalculatorsComponent } from './calculators/calculators.component';
import { authGuard } from './core/guards/auth.guard';
import { DrugInteractionsComponent } from './drug-interactions/drug-interactions.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'login',
        loadChildren: () =>
          import('./auth/auth.routes').then((m) => m.authRoutes),
      },
      {
        path: '',
        canActivate: [authGuard],
        children: [
          { path: 'search', children: searchRoutes },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
          { path: 'contents/:id', component: ContentComponent },
          { path: 'calculators', component: CalculatorsComponent },
          { path: 'interactions', component: DrugInteractionsComponent },
        ],
      },
    ],
  },
];
