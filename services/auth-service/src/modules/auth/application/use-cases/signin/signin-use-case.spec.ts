import { Test } from '@nestjs/testing';
import { IUserRepository } from 'src/modules/auth/domain/repositiries/user.repository';
import { PasswordService } from '../../../infrastructure/services/password.service';
import { SigninUseCase } from './signin-use-case';
import { TokenService } from '../../../infrastructure/services/token.service';
import { CookieService } from '../../../infrastructure/services/cookie.service';
import { DomainUser } from '../../../../../modules/auth/domain/entities/user';
import { UnauthorizedException } from '@nestjs/common';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';

describe('SigninUseCase', () => {
  let signinUseCase: SigninUseCase;
  let passwordService: PasswordService;
  let userRepository: IUserRepository;
  let tokenService: TokenService;
  let cookieServbice: CookieService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SigninUseCase,
        {
          provide: PasswordService,
          useValue: { compare: jest.fn() },
        },
        {
          provide: 'IUserRepository',
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: { generate: jest.fn() },
        },
        {
          provide: CookieService,
          useValue: { setAuthCookie: jest.fn() },
        },
      ],
    }).compile();

    signinUseCase = module.get(SigninUseCase);
    passwordService = module.get(PasswordService);
    userRepository = module.get('IUserRepository');
    tokenService = module.get(TokenService);
    cookieServbice = module.get(CookieService);
  });

  const dto = { email: 'test@gmail.com', password: '123456' };

  const response: DomainUser = {
    id: 'test-id',
    username: 'test',
    email: 'test@gmail.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = {} as any;

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

  it('should authenticate user and set cookies', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(response);
    jest.spyOn(passwordService, 'compare').mockResolvedValue(true);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce('accessToken')
      .mockReturnValueOnce('refreshToken');

    const result = await signinUseCase.execute(res, dto);

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

    expect(cookieServbice.setAuthCookie).toHaveBeenCalledWith(
      res,
      'accessToken',
      TokenType.ACCESS,
    );

    expect(cookieServbice.setAuthCookie).toHaveBeenCalledWith(
      res,
      'refreshToken',
      TokenType.REFRESH,
    );

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
