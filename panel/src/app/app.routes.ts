import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { articlesRoutes } from './artiles/articles.routes';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [{ path: 'articles', children: articlesRoutes }],
  },
];
