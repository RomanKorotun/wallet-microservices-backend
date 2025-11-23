import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { TokenType } from '../../domain/enums/token-type.enum';

@Injectable()
export class CookieService {
  private readonly ACCESS_TOKEN = 'accessToken';
  private readonly REFRESH_TOKEN = 'refreshToken';

  private readonly cookieNames = {
    [TokenType.ACCESS]: this.ACCESS_TOKEN,
    [TokenType.REFRESH]: this.REFRESH_TOKEN,
  };

  constructor(private readonly configService: ConfigService) {}

  private isProduction(): boolean {
    return this.configService.getOrThrow('NODE_ENV') === 'production';
  }

  private getCookieOptions(): CookieOptions {
    const isProd = this.isProduction();
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    };
  }

  setAuthCookie(res: Response, token: string, tokenType: TokenType): void {
    const accessTokenTime = +this.configService.getOrThrow(
      'JWT_ACCESS_TOKEN_TIME',
    );
    const refreshTokenTime = +this.configService.getOrThrow(
      'JWT_REFRESH_TOKEN_TIME',
    );

    const cookieOptions = this.getCookieOptions();

    const cookieName = this.cookieNames[tokenType];
    if (!cookieName) {
      throw new InternalServerErrorException('Недопустимий тип токена');
    }

    const maxAge =
      tokenType === TokenType.ACCESS
        ? accessTokenTime * 1000
        : refreshTokenTime * 1000;

    res.cookie(cookieName, token, { ...cookieOptions, maxAge });
  }
  clearAuthCookie(res: Response, tokenType: TokenType): void {
    const cookieOptions = this.getCookieOptions();

    const cookieName = this.cookieNames[tokenType];
    if (!cookieName) {
      throw new InternalServerErrorException('Недопустимий тип токена');
    }

    res.clearCookie(cookieName, cookieOptions);
  }
}
