import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { SigninUseCase } from './signin-use-case';
import { DomainUser } from '../../../../../modules/auth/domain/entities/user';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { IPasswordService } from '../../../../../modules/auth/domain/services/password.service';
import type { ITokenService } from '../../../../../modules/auth/domain/services/token.service';

describe('SigninUseCase', () => {
  let signinUseCase: SigninUseCase;
  let passwordService: IPasswordService;
  let userRepository: IUserRepository;
  let tokenService: ITokenService;
  let cookieService: ICookieService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SigninUseCase,
        {
          provide: 'IPasswordService',
          useValue: { compare: jest.fn() },
        },
        {
          provide: 'IUserRepository',
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: 'ITokenService',
          useValue: { generate: jest.fn() },
        },
        {
          provide: 'ICookieService',
          useValue: { setAuthCookie: jest.fn() },
        },
        {
          provide: 'ISessionRepository',
          useValue: { set: jest.fn() },
        },
      ],
    }).compile();

    signinUseCase = module.get(SigninUseCase);
    passwordService = module.get('IPasswordService');
    userRepository = module.get('IUserRepository');
    tokenService = module.get('ITokenService');
    cookieService = module.get('ICookieService');
  });

  const dto = { email: 'test@gmail.com', password: 'R123456' };

  const response: DomainUser = {
    id: 'test-id',
    username: 'test',
    email: 'test@gmail.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = {} as Response;

  const tokens = {
    mockAccessToken: 'accessToken',
    mockRefreshToken: 'refreshToken',
  };

  it('should throw UnauthorizedException if user does not exist', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    await expect(signinUseCase.execute(res, dto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(response);
    jest.spyOn(passwordService, 'compare').mockResolvedValue(false);
    await expect(signinUseCase.execute(res, dto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should generate access and refresh tokens with correct types', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(response);
    jest.spyOn(passwordService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await signinUseCase.execute(res, dto);

    expect(tokenService.generate).toHaveBeenNthCalledWith(
      1,
      response.id,
      TokenType.ACCESS,
    );

    expect(tokenService.generate).toHaveBeenNthCalledWith(
      2,
      response.id,
      TokenType.REFRESH,
    );
  });

  it('should set access and refresh tokens in cookies', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(response);
    jest.spyOn(passwordService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await signinUseCase.execute(res, dto);

    expect(cookieService.setAuthCookie).toHaveBeenCalledTimes(2);

    expect(cookieService.setAuthCookie).toHaveBeenCalledWith(
      res,
      tokens.mockAccessToken,
      TokenType.ACCESS,
    );

    expect(cookieService.setAuthCookie).toHaveBeenCalledWith(
      res,
      tokens.mockRefreshToken,
      TokenType.REFRESH,
    );
  });

  it('should return user object with correct fields', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(response);
    jest.spyOn(passwordService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    const result = await signinUseCase.execute(res, dto);

    expect(result).toEqual({
      message: 'Access Token i Refresh Token встановлені в кукі',
      user: {
        id: response.id,
        username: response.username,
        email: response.email,
      },
    });
  });
});
