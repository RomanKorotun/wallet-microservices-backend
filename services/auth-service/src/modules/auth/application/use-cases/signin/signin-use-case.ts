import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import type { IUserRepository } from '../../../../../modules/auth/domain/repositiries/user.repository';
import { SigninRequestDto } from '../../../../../modules/auth/interfaces/dto/signin/signin-request.dto';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import { SigninSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/signin/signin-success-response.dto';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { IPasswordService } from '../../../../../modules/auth/domain/services/password.service';
import type { ITokenService } from '../../../../../modules/auth/domain/services/token.service';

@Injectable()
export class SigninUseCase {
  constructor(
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('ITokenService') private readonly tokenService: ITokenService,
    @Inject('ICookieService')
    private readonly cookieService: ICookieService,
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
