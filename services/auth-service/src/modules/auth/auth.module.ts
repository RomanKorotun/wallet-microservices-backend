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
import { RefreshUseCase } from './application/use-cases/refresh/refresh-use-case';
import { JwtRefreshStrategy } from './infrastructure/strategies/jwt-refresh-strategy';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    SigninUseCase,
    RefreshUseCase,
    SignoutUseCase,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    { provide: 'IPasswordService', useClass: PasswordService },
    { provide: 'ITokenService', useClass: TokenService },
    { provide: 'ICookieService', useClass: CookieService },
    { provide: 'IUserRepository', useClass: UserRepository },
  ],
})
export class AuthModule {}
