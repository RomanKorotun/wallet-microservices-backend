import { Test } from '@nestjs/testing';
import { TokenService } from '../../../../../modules/auth/infrastructure/services/token.service';
import { RefreshUseCase } from './refresh-use-case';
import { CookieService } from '../../../../../modules/auth/infrastructure/services/cookie.service';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';

describe('Refresh', () => {
  let refreshUseCase: RefreshUseCase;
  let tokenService: TokenService;
  let cookieService: CookieService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RefreshUseCase,
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

    refreshUseCase = module.get(RefreshUseCase);
    tokenService = module.get(TokenService);
    cookieService = module.get(CookieService);
  });

  const res = {} as any;
  const userId = 'test-id';

  const tokens = {
    mockAccessToken: 'accessToken',
    mockRefreshToken: 'refreshToken',
  };

  it('should generate new Access and Refresh Tokens and set cookies', () => {
    jest
      .spyOn(tokenService, 'generate')
      .mockReturnValueOnce(tokens.mockAccessToken)
      .mockReturnValueOnce(tokens.mockRefreshToken);

    const result = refreshUseCase.execute(res, userId);
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

    expect(result).toEqual({
      message: 'Access Token i Refresh Token встановлені в cookies',
    });
  });
});
