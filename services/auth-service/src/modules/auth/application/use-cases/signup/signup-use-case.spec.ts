jest.mock('nanoid', () => ({
  nanoid: () => 'test-nanoid',
}));
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository';
import { SignupUseCase } from './signup-use-case';
import { DomainUser } from '../../../domain/entities/user';
import { TokenType } from '../../../domain/enums/token-type.enum';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { IPasswordService } from '../../../../../modules/auth/domain/services/password.service';
import type { ITokenService } from '../../../../../modules/auth/domain/services/token.service';
import { ISessionRepository } from '../../../domain/repositories/session.repository';

describe('SignupUseCase', () => {
  let signupUseCase: SignupUseCase;
  let passwordService: IPasswordService;
  let userRepository: IUserRepository;
  let tokenService: ITokenService;
  let cookieService: ICookieService;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SignupUseCase,
        {
          provide: 'IPasswordService',
          useValue: { hash: jest.fn() },
        },
        {
          provide: 'IUserRepository',
          useValue: { createUser: jest.fn(), findByEmail: jest.fn() },
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

    signupUseCase = module.get(SignupUseCase);
    passwordService = module.get('IPasswordService');
    userRepository = module.get('IUserRepository');
    tokenService = module.get('ITokenService');
    cookieService = module.get('ICookieService');
    sessionRepository = module.get('ISessionRepository');
  });

  const dto = {
    username: 'test',
    email: 'test@gmail.com',
    password: 'R123456',
  };

  const hashedPassword = 'hashedPassword';

  const response: DomainUser = {
    id: 'test-id',
    username: 'test',
    email: 'test@gmail.com',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = {} as Response;

  const tokens = {
    mockAccessToken: 'accessToken',
    mockRefreshToken: 'refreshToken',
  };

  it('should throw ConflictException if user already exists', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(response);
    await expect(signupUseCase.execute(res, dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should hash password', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);
    await signupUseCase.execute(res, dto);
    expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
  });

  it('should save user with hashed password', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await signupUseCase.execute(res, dto);

    expect(userRepository.createUser).toHaveBeenCalledWith({
      ...dto,
      password: hashedPassword,
    });
  });

  it('should generate access and refresh tokens with correct types', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await signupUseCase.execute(res, dto);

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

  it('should save session with correct parameters', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(userRepository, 'createUser').mockResolvedValueOnce(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await signupUseCase.execute(res, dto);

    expect(sessionRepository.set).toHaveBeenCalledTimes(1);

    expect(sessionRepository.set).toHaveBeenCalledWith(
      expect.stringMatching(/^session:/),
      { userId: response.id, createdAt: expect.any(Number) },
      7 * 24 * 60 * 60,
    );
  });

  it('should set access and refresh tokens in cookies', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await signupUseCase.execute(res, dto);

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
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    const result = await signupUseCase.execute(res, dto);

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
