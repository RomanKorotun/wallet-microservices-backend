import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import { SignoutSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/signout/signout-success-response.dto';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { ISessionRepository } from '../../../../../modules/auth/domain/repositories/session.repository';

@Injectable()
export class SignoutUseCase {
  constructor(
    @Inject('ICookieService') private readonly cookieService: ICookieService,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(
    res: Response,
    userId: string,
  ): Promise<SignoutSuccessResponseDto> {
    this.cookieService.clearAuthCookie(res, TokenType.ACCESS);
    this.cookieService.clearAuthCookie(res, TokenType.REFRESH);

    await this.sessionRepository.deleteUserSessions(userId);

    return { message: 'Ви успішно вийшли з системи' };
  }
}
