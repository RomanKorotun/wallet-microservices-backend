import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import { SignoutSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/signout/signout-success-response.dto';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';

@Injectable()
export class SignoutUseCase {
  constructor(
    @Inject('ICookieService') private readonly cookieService: ICookieService,
  ) {}

  execute(res: Response): SignoutSuccessResponseDto {
    this.cookieService.clearAuthCookie(res, TokenType.ACCESS);
    this.cookieService.clearAuthCookie(res, TokenType.REFRESH);

    return {
      message: 'Ви успішно вийшли з системи',
    };
  }
}
