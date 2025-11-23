import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { PasswordService } from '../../../infrastructure/services/password.service';
import type { IUserRepository } from '../../../../../modules/auth/domain/repositiries/user.repository';
import { TokenService } from '../../../infrastructure/services/token.service';
import { CookieService } from '../../../infrastructure/services/cookie.service';
import { SigninRequestDto } from '../../../../../modules/auth/interfaces/dto/signin/signin-request.dto';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import { SigninSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/signin/signin-success-response.dto';

@Injectable()
export class SigninUseCase {
  constructor(
    private readonly passwordService: PasswordService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}
  async execute(
    res: Response,
    dto: SigninRequestDto,
  ): Promise<SigninSuccessResponseDto> {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email або password не вірні');
    }

    const passwordCompare = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!passwordCompare) {
      throw new UnauthorizedException('Email або password не вірні');
    }

    const accessToken = this.tokenService.generate(user.id, TokenType.ACCESS);

    const refreshToke = this.tokenService.generate(user.id, TokenType.REFRESH);

    this.cookieService.setAuthCookie(res, accessToken, TokenType.ACCESS);

    this.cookieService.setAuthCookie(res, refreshToke, TokenType.REFRESH);

    return {
      message: 'Access Token i Refresh Token встановлені в кукі',
      user: { id: user.id, username: user.username, email: user.email },
    };
  }
}
