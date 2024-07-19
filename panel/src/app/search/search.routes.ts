import { Route } from '@angular/router';
import { SearchComponent } from './search.component';
import { ResultComponent } from './result/result.component';

export const searchRoutes: Route[] = [
  {
    path: '',
    component: SearchComponent,
  },
  {
    path: 'result',
    component: ResultComponent,
  },
];
