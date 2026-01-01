import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtConfigModule } from './config/jwt-config.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    AppConfigModule,
    JwtConfigModule,
    AuthModule,
    PrismaModule,
    RedisModule,
  ],
})
export class AppModule {}
