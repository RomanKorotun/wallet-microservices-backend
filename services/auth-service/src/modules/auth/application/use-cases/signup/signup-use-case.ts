import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { SignupRequestDto } from '../../../interfaces/dto/signup/signup-request.dto';
import type { IUserRepository } from '../../../domain/repositiries/user.repository';
import { TokenType } from '../../../domain/enums/token-type.enum';
import { SignupSuccessResponseDto } from '../../../../../modules/auth/interfaces/dto/signup/signup-success-response.dto';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { IPasswordService } from '../../../../../modules/auth/domain/services/password.service';
import type { ITokenService } from '../../../../../modules/auth/domain/services/token.service';

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('ITokenService') private readonly tokenService: ITokenService,
    @Inject('ICookieService') private readonly cookieService: ICookieService,
  ) {}
  async execute(
    res: Response,
    dto: SignupRequestDto,
  ): Promise<SignupSuccessResponseDto> {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);

    if (user) {
      throw new ConflictException(
        `Користувач з email ${email} уже існує в базі`,
      );
    }

    const hashedPassword = await this.passwordService.hash(password);

    const createdUser = await this.userRepository.createUser({
      ...dto,
      password: hashedPassword,
    });

    const accessToken = this.tokenService.generate(
      createdUser.id,
      TokenType.ACCESS,
    );

    const refreshToken = this.tokenService.generate(
      createdUser.id,
      TokenType.REFRESH,
    );

    this.cookieService.setAuthCookie(res, accessToken, TokenType.ACCESS);

    this.cookieService.setAuthCookie(res, refreshToken, TokenType.REFRESH);

    return {
      message: 'Access Token i Refresh Token встановлені в кукі',
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
      },
    };
  }
}
