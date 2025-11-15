import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { PasswordService } from './application/services/password.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { TokenService } from './application/services/token.service';
import { CookieService } from './application/services/cookie.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    PasswordService,
    TokenService,
    CookieService,
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
})
export class AuthModule {}
