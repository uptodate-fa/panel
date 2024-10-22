import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { searchRoutes } from './search/search.routes';
import { ContentComponent } from './content/content.component';
import { CalculatorsComponent } from './calculators/calculators.component';
import { authGuard } from './core/guards/auth.guard';
import { DrugInteractionsComponent } from './drug-interactions/drug-interactions.component';
import { profileGuard } from './core/guards/profile.guard';
import { TableOfContentsComponent } from './table-of-contents/table-of-contents.component';

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
        canActivate: [authGuard, profileGuard],
        children: [
          { path: 'search', children: searchRoutes },
          { path: '', redirectTo: 'search', pathMatch: 'full' },
          {
            path: 'contents/table-of-contents/:topic',
            component: TableOfContentsComponent,
          },
          {
            path: 'contents/table-of-contents/:topic/:sub',
            component: TableOfContentsComponent,
          },
          { path: 'contents/:id', component: ContentComponent },
          { path: 'calculators', component: CalculatorsComponent },
          { path: 'interactions', component: DrugInteractionsComponent },
        ],
      },
    ],
  },
];
