import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { PasswordService } from '../../services/password.service';
import type { IUserRepository } from '../../../../../modules/auth/domain/repositiries/user.repository';
import { TokenService } from '../../services/token.service';
import { CookieService } from '../../services/cookie.service';
import { SigninRequestDto } from '../../../../../modules/auth/interfaces/dto/signin/signin-request.dto';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';

@Injectable()
export class SigninUseCase {
  constructor(
    private readonly passwordService: PasswordService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}
  async execute(res: Response, dto: SigninRequestDto) {
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
