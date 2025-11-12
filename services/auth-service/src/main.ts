import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const config = app.get(ConfigService);
  const PORT = config.get('PORT');
  await app.listen(PORT, () => logger.log(`Server running on ${PORT} PORT`));
}
bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Server failed:', err);
  process.exit(1);
});
