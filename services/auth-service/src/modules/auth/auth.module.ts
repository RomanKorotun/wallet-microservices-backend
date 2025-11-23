import { Module } from '@nestjs/common';
import { AuthController } from './interfaces/auth.controller';
import { SignupUseCase } from './application/use-cases/signup/signup-use-case';
import { PasswordService } from './infrastructure/services/password.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { TokenService } from './infrastructure/services/token.service';
import { CookieService } from './infrastructure/services/cookie.service';
import { SigninUseCase } from './application/use-cases/signin/signin-use-case';
import { JwtAccessStrategy } from './infrastructure/strategies/jwt-access-strategy';
import { SignoutUseCase } from './application/use-cases/signout/signout-use-case';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    SigninUseCase,
    SignoutUseCase,
    PasswordService,
    TokenService,
    CookieService,
    JwtAccessStrategy,
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
})
export class AuthModule {}
