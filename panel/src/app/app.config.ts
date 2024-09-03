import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { apiInterceptorProvider, provideTranslation } from './core/providers';
import {
  provideAngularQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptorsFromDi()),
    provideAngularQuery(new QueryClient()),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideTranslation(),
    apiInterceptorProvider(),
  ],
};
