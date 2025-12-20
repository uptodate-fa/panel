import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./drug-interaction.component').then((m) => m.DrugInteractionComponent),
  },
];

