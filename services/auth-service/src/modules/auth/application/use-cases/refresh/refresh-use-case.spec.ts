import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { RefreshUseCase } from './refresh-use-case';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import type { ITokenService } from '../../../../../modules/auth/domain/services/token.service';
//import type { ISessionRepository } from '../../../../../modules/auth/domain/repositories/session.repository';
import { UnauthorizedException } from '@nestjs/common';

describe('RefreshUseCase', () => {
  let refreshUseCase: RefreshUseCase;
  let tokenService: ITokenService;
  let cookieService: ICookieService;
  // let sessionRepository: ISessionRepository;

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
        // {
        //   provide: 'ISessionRepository',
        //   useValue: {
        //     deleteByRefreshToken: jest.fn(),
        //     set: jest.fn(),
        //   },
        // },
      ],
    }).compile();

    refreshUseCase = module.get(RefreshUseCase);
    tokenService = module.get('ITokenService');
    cookieService = module.get('ICookieService');
    // sessionRepository = module.get('ISessionRepository ');
  });

  const req: Partial<Request> = {
    cookies: { refreshToken: 'oldRefreshToken' },
  };
  const res = {} as Response;
  const userId = 'test-id';

  const tokens = {
    mockAccessToken: 'accessToken',
    mockRefreshToken: 'refreshToken',
  };

  it('should throw ConflictException if refreshToken is missing', async () => {
    const emptyCookiesReq: Partial<Request> = { cookies: {} };
    await expect(
      refreshUseCase.execute(emptyCookiesReq as Request, res, userId),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should generate access and refresh tokens with correct types', async () => {
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await refreshUseCase.execute(req as Request, res, userId);

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

  it('should set access and refresh tokens in cookies', async () => {
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    await refreshUseCase.execute(req as Request, res, userId);

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

  it('should return object with correct field', async () => {
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    const result = await refreshUseCase.execute(req as Request, res, userId);
    expect(result).toEqual({
      message: 'Access Token i Refresh Token встановлені в cookies',
    });
  });
});
