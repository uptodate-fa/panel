import { Route } from '@angular/router';
import { ArticleListComponent } from './article-list/article-list.component';

export const articlesRoutes: Route[] = [
  { path: 'list', component: ArticleListComponent },
];
