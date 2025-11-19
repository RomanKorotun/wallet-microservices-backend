import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/app-config.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { JwtConfigModule } from './config/jwt-config.module';

@Module({
  imports: [AppConfigModule, JwtConfigModule, AuthModule, PrismaModule],
})
export class AppModule {}
