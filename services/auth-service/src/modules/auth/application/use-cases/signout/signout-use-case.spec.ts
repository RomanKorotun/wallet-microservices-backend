import { Test } from '@nestjs/testing';
import { CookieService } from '../../../../../modules/auth/infrastructure/services/cookie.service';
import { SignoutUseCase } from './signout-use-case';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';

describe('Signout', () => {
  let signoutUseCase: SignoutUseCase;
  let cookieService: CookieService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SignoutUseCase,
        {
          provide: CookieService,
          useValue: { clearAuthCookie: jest.fn() },
        },
      ],
    }).compile();

    signoutUseCase = module.get(SignoutUseCase);
    cookieService = module.get(CookieService);
  });

  const res = {} as any;

  it('should clear auth cookies and return success message', () => {
    const result = signoutUseCase.execute(res);

    expect(cookieService.clearAuthCookie).toHaveBeenCalledWith(
      res,
      TokenType.ACCESS,
    );

    expect(cookieService.clearAuthCookie).toHaveBeenCalledWith(
      res,
      TokenType.REFRESH,
    );

    expect(result).toEqual({ message: 'Ви успішно вийшли з системи' });
  });
});
