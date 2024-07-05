import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { articlesRoutes } from './artiles/articles.routes';
import { SearchComponent } from './search/search.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'articles', children: articlesRoutes },
      { path: 'search', component: SearchComponent },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
    ],
  },
];
