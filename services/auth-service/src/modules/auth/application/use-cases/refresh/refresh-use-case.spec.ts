import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { RefreshUseCase } from './refresh-use-case';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { ITokenService } from 'src/modules/auth/domain/services/token.service';

describe('RefreshUseCase', () => {
  let refreshUseCase: RefreshUseCase;
  let tokenService: ITokenService;
  let cookieService: ICookieService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RefreshUseCase,
        {
          provide: 'ITokenService',
          useValue: { generate: jest.fn() },
        },
        {
          provide: 'ICookieService',
          useValue: { setAuthCookie: jest.fn() },
        },
      ],
    }).compile();

    refreshUseCase = module.get(RefreshUseCase);
    tokenService = module.get('ITokenService');
    cookieService = module.get('ICookieService');
  });

  const res = {} as Response;
  const userId = 'test-id';

  const tokens = {
    mockAccessToken: 'accessToken',
    mockRefreshToken: 'refreshToken',
  };

  it('should generate access and refresh tokens with correct types', () => {
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    refreshUseCase.execute(res, userId);

    expect(tokenService.generate).toHaveBeenNthCalledWith(
      1,
      userId,
      TokenType.ACCESS,
    );

    expect(tokenService.generate).toHaveBeenNthCalledWith(
      2,
      userId,
      TokenType.REFRESH,
    );
  });

  it('should set access and refresh tokens in cookies', () => {
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    refreshUseCase.execute(res, userId);

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

  it('should return object with correct field', () => {
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    const result = refreshUseCase.execute(res, userId);
    expect(result).toEqual({
      message: 'Access Token i Refresh Token встановлені в cookies',
    });
  });
});
