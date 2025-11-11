import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  await app.listen(process.env.PORT ?? 3000, () =>
    logger.log(`Server running on ${process.env.PORT ?? 3000} PORT`),
  );
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Server failed:', err);
  process.exit(1);
});
