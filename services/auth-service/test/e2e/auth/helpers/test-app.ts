import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Server } from 'http';
import { AppModule } from '../../../../src/app.module';
import { AllExceptionFilter } from '../../../../src/common/filters/all-exception.filter';

export interface ITestApp {
  app: INestApplication;
  server: Server;
}

export const createTestApp = async (): Promise<ITestApp> => {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = module.createNestApplication();

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.useGlobalFilters(new AllExceptionFilter());

  await app.init();

  const server = app.getHttpServer();

  return { app, server };
};
