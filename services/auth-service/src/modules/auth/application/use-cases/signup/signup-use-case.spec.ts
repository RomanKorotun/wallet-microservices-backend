import { Test } from '@nestjs/testing';
import { IUserRepository } from '../../../domain/repositiries/user.repository';
import { CookieService } from '../../../infrastructure/services/cookie.service';
import { PasswordService } from '../../../infrastructure/services/password.service';
import { TokenService } from '../../../infrastructure/services/token.service';
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

  const dto = { username: 'test', email: 'test@gmail.com', password: '123456' };

  const hashedPassword = 'hashedPassword';

  const response: DomainUser = {
    id: 'test-id',
    username: 'test',
    email: 'test@gmail.com',
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const res = {} as any;

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

  it('should call tokenService.generate twice with correct token types', async () => {
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

  it('should set access and refresh tokens in cookies', async () => {
    jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);
    jest.spyOn(passwordService, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(userRepository, 'createUser').mockResolvedValue(response);
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await signupUseCase.execute(res, dto);

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
