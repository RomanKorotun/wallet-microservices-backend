import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { SignoutUseCase } from './signout-use-case';
import { TokenType } from '../../../../../modules/auth/domain/enums/token-type.enum';
import type { ICookieService } from '../../../../../modules/auth/domain/services/cookie.service';
import { ISessionRepository } from '../../../../../modules/auth/domain/repositories/session.repository';

describe('SignoutUseCase', () => {
  let signoutUseCase: SignoutUseCase;
  let cookieService: ICookieService;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SignoutUseCase,
        {
          provide: 'ICookieService',
          useValue: { clearAuthCookie: jest.fn() },
        },
        {
          provide: 'ISessionRepository',
          useValue: { deleteUserSessions: jest.fn() },
        },
      ],
    }).compile();

    signoutUseCase = module.get(SignoutUseCase);
    cookieService = module.get('ICookieService');
    sessionRepository = module.get('ISessionRepository');
  });

  const res = {} as Response;
  const userId = 'test-id';

  it('should clear auth cookies', async () => {
    await signoutUseCase.execute(res, userId);
    expect(cookieService.clearAuthCookie).toHaveBeenCalledTimes(2);

    expect(cookieService.clearAuthCookie).toHaveBeenCalledWith(
      res,
      TokenType.ACCESS,
    );

    expect(cookieService.clearAuthCookie).toHaveBeenCalledWith(
      res,
      TokenType.REFRESH,
    );
  });

  it('should clear all sessions in session repository', async () => {
    await signoutUseCase.execute(res, userId);
    expect(sessionRepository.deleteUserSessions).toHaveBeenCalledWith(userId);
  });

  it('should  return success message', async () => {
    const result = await signoutUseCase.execute(res, userId);
    expect(result).toEqual({ message: 'Ви успішно вийшли з системи' });
  });
});
