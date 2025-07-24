import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { searchRoutes } from './search/search.routes';
import { ContentComponent } from './content/content.component';
import { CalculatorsComponent } from './calculators/calculators.component';
import { authGuard } from './core/guards/auth.guard';
import { DrugInteractionsComponent } from './drug-interactions/drug-interactions.component';
import { profileGuard } from './core/guards/profile.guard';
import { TableOfContentsComponent } from './table-of-contents/table-of-contents.component';
import { subscriptionGuard } from './core/guards/subscription.guard';
import { AbstractsComponent } from './content/abstracts/abstracts.component';
import { passwordGuard } from './core/guards/password.guard';
import { PrintContentComponent } from './content/print/print-content.component';
import { drugInteractionsRoutes } from './drug-interactions/drug-interactions.routes';

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
          {
            path: '',
            canActivate: [passwordGuard],
            children: [
              {
                path: '',
                canActivate: [subscriptionGuard],
                children: [
                  { path: 'search', children: searchRoutes },
                  { path: '', redirectTo: 'search', pathMatch: 'full' },
                  {
                    path: 'contents/table-of-contents',
                    component: TableOfContentsComponent,
                  },
                  {
                    path: 'contents/table-of-contents/:topic',
                    component: TableOfContentsComponent,
                  },
                  {
                    path: 'contents/table-of-contents/:topic/:sub',
                    component: TableOfContentsComponent,
                  },
                  { path: 'contents/:id', component: ContentComponent },
                  {
                    path: 'contents/print/:id',
                    component: PrintContentComponent,
                  },
                  {
                    path: 'contents/:topic/abstract/:range',
                    component: AbstractsComponent,
                  },
                  { path: 'calculators', component: CalculatorsComponent },
                  {
                    path: 'interactions',
                    children: drugInteractionsRoutes,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
