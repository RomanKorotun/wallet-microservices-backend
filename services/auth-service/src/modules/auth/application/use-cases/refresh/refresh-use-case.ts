import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import { RefreshSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/refresh/refresh-success-response.dto';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { ITokenService } from '../../../../../modules/auth/domain/services/token.service';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject('ITokenService') private readonly tokenService: ITokenService,
    @Inject('ICookieService') private readonly cookieService: ICookieService,
  ) {}
  execute(res: Response, userId: string): RefreshSuccessResponseDto {
    const accessToken = this.tokenService.generate(userId, TokenType.ACCESS);
    const refreshToken = this.tokenService.generate(userId, TokenType.REFRESH);
    this.cookieService.setAuthCookie(res, accessToken, TokenType.ACCESS);
    this.cookieService.setAuthCookie(res, refreshToken, TokenType.REFRESH);
    return {
      message: 'Access Token i Refresh Token встановлені в cookies',
    };
  }
}
