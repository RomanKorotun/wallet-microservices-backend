import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { PasswordService } from '../../services/password.service';
import { SignupRequestDto } from '../../../interfaces/dto/signup/signup-request.dto';
import type { IUserRepository } from '../../../domain/repositiries/user.repository';
import { TokenService } from '../../services/token.service';
import { TokenType } from '../../../domain/enums/token-type.enum';
import { CookieService } from '../../services/cookie.service';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly passwordService: PasswordService,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}
  async execute(res: Response, dto: SignupRequestDto) {
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
