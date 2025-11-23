import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CookieService } from '../../../../../modules/auth/infrastructure/services/cookie.service';
import { TokenService } from '../../../../../modules/auth/infrastructure/services/token.service';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';

@Injectable()
export class RefreshUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}
  execute(res: Response, userId: string) {
    const accessToken = this.tokenService.generate(userId, TokenType.ACCESS);
    const refreshToken = this.tokenService.generate(userId, TokenType.REFRESH);
    this.cookieService.setAuthCookie(res, accessToken, TokenType.ACCESS);
    this.cookieService.setAuthCookie(res, refreshToken, TokenType.REFRESH);
    return {
      message: 'Access Token i Refresh Token встановлені в cookies',
    };
  }
}
