import { Test } from '@nestjs/testing';
import { SignoutUseCase } from './signout-use-case';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';

describe('Signout', () => {
  let signoutUseCase: SignoutUseCase;
  let cookieService: ICookieService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SignoutUseCase,
        {
          provide: 'ICookieService',
          useValue: { clearAuthCookie: jest.fn() },
        },
      ],
    }).compile();

    signoutUseCase = module.get(SignoutUseCase);
    cookieService = module.get('ICookieService');
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
