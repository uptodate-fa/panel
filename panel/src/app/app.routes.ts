import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { articlesRoutes } from './artiles/articles.routes';
import { searchRoutes } from './search/search.routes';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'articles', children: articlesRoutes },
      { path: 'search', children: searchRoutes },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
    ],
  },
];
