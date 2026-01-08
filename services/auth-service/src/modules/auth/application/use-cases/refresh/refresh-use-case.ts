import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import { RefreshSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/refresh/refresh-success-response.dto';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { ITokenService } from '../../../../../modules/auth/domain/services/token.service';
import type { ISessionRepository } from '../../../../../modules/auth/domain/repositories/session.repository';

@Injectable()
export class RefreshUseCase {
  constructor(
    @Inject('ITokenService') private readonly tokenService: ITokenService,
    @Inject('ICookieService') private readonly cookieService: ICookieService,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}
  async execute(
    req: Request,
    res: Response,
    userId: string,
  ): Promise<RefreshSuccessResponseDto> {
    const oldRefreshToke = req.cookies?.refreshToken;
    if (!oldRefreshToke) {
      throw new UnauthorizedException('Відсутній refrehToken');
    }
    await this.sessionRepository.deleteByRefreshToken(oldRefreshToke);

    const accessToken = this.tokenService.generate(userId, TokenType.ACCESS);
    const refreshToken = this.tokenService.generate(userId, TokenType.REFRESH);

    const sessionKey = `session:${refreshToken}`;
    await this.sessionRepository.set(
      sessionKey,
      { userId, createdAt: Date.now() },
      7 * 24 * 60 * 60,
    );

    this.cookieService.setAuthCookie(res, accessToken, TokenType.ACCESS);
    this.cookieService.setAuthCookie(res, refreshToken, TokenType.REFRESH);
    return {
      message: 'Access Token i Refresh Token встановлені в cookies',
    };
  }
}
