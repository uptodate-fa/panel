/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './app/core/sentry.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      // Performance Monitoring
      tracesSampleRate: 1.0,
    });

    app.useGlobalInterceptors(new SentryInterceptor());
  }

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
