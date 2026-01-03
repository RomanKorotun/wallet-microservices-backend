import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

const envFilePath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
    }),
  ],
})
export class AppConfigModule {}
