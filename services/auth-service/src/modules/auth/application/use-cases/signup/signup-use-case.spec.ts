import { Test } from '@nestjs/testing';
import { IUserRepository } from '../../../domain/repositiries/user.repository';
import { CookieService } from '../../services/cookie.service';
import { PasswordService } from '../../services/password.service';
import { TokenService } from '../../services/token.service';
import { SignupUseCase } from './signup-use-case';
import { ConflictException } from '@nestjs/common';
import { DomainUser } from '../../../domain/entities/user';
import { TokenType } from '../../../domain/enums/token-type.enum';

describe('SignupUseCase', () => {
  let signupUseCase: SignupUseCase;
  let passwordService: PasswordService;
  let userRepository: IUserRepository;
  let tokenService: TokenService;
  let cookieService: CookieService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SignupUseCase,
        {
          provide: PasswordService,
          useValue: { hash: jest.fn() },
        },
        {
          provide: 'IUserRepository',
          useValue: { createUser: jest.fn(), findByEmail: jest.fn() },
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

    signupUseCase = module.get(SignupUseCase);
    passwordService = module.get(PasswordService);
    userRepository = module.get('IUserRepository');
    tokenService = module.get(TokenService);
    cookieService = module.get(CookieService);
  });

  const dto = {
    username: 'test',
    email: 'test@gmail.com',
    password: '123456',
  };

  const response: DomainUser = {
    id: 'test-id',
    username: 'test',
    email: 'test@gmail.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = {} as any;

  it('should throw ConflictException if user already exists', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(response);
    await expect(signupUseCase.execute(res, dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('should create user and set cookies', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue('hashedPassword');
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce('accessToken')
      .mockReturnValueOnce('refreshToken');
    const result = await signupUseCase.execute(res, dto);

    expect(passwordService.hash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.createUser).toHaveBeenCalledWith({
      ...dto,
      password: 'hashedPassword',
    });
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
    expect(cookieService.setAuthCookie).toHaveBeenCalledWith(
      res,
      'accessToken',
      TokenType.ACCESS,
    );
    expect(cookieService.setAuthCookie).toHaveBeenCalledWith(
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
