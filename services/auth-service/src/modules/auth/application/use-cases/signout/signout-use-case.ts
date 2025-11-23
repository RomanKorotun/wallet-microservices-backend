import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import { CookieService } from '../../../../../modules/auth/infrastructure/services/cookie.service';
import { SignoutSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/signout/signout-success-response.dto';

@Injectable()
export class SignoutUseCase {
  constructor(private readonly cookieService: CookieService) {}

  execute(res: Response): SignoutSuccessResponseDto {
    this.cookieService.clearAuthCookie(res, TokenType.ACCESS);
    this.cookieService.clearAuthCookie(res, TokenType.REFRESH);

    return {
      message: 'Ви успішно вийшли з системи',
    };
  }
}
