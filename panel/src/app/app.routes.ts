import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { searchRoutes } from './search/search.routes';
import { ContentComponent } from './content/content.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'search', children: searchRoutes },
      { path: '', redirectTo: 'search', pathMatch: 'full' },
      { path: 'contents/:id', component: ContentComponent },
    ],
  },
];
