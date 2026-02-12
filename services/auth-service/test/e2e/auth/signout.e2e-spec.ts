import { Server } from 'http';
import { createTestApp, ITestApp } from './helpers/test-app';
import { ISessionRepository } from '../../../src/modules/auth/domain/repositories/session.repository';
import { signoutRequest, signupRequest } from './helpers/request.helper';
import { getCookies, getCookiesHeader } from './helpers/cookies.helper';
import { getToken } from './helpers/tokens.helper';
import { TokenType } from '../../../src/modules/auth/domain/enums/token-type.enum';
import { ITokenService } from '../../../src/modules/auth/domain/services/token.service';
import { IUserRepository } from '../../../src/modules/auth/domain/repositories/user.repository';

describe('AuthController e2e - signout', () => {
  let testApp: ITestApp;
  let server: Server;
  let tokenService: ITokenService;
  let userRepository: IUserRepository;
  let sessionRepository: ISessionRepository;

  beforeAll(async () => {
    testApp = await createTestApp();
    server = testApp.server;
    tokenService = testApp.app.get<ITokenService>('ITokenService');
    userRepository = testApp.app.get<IUserRepository>('IUserRepository');
    sessionRepository =
      testApp.app.get<ISessionRepository>('ISessionRepository');
  });

  afterEach(async () => {
    await sessionRepository.deleteAll();
    await userRepository.deleteAll();
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  const signupDto = {
    username: 'test',
    email: 'test_signup@gmail.com',
    password: 'R123456',
  };

  const invalidRefreshToken = 'refreshToken=invalid-token';

  it('should return 401 if refreshToken is invalid', async () => {
    const { statusCode } = await signoutRequest(server, invalidRefreshToken);
    expect(statusCode).toBe(401);
  });

  it('should return 401 if missing refreshToken', async () => {
    const { statusCode } = await signoutRequest(server);
    expect(statusCode).toBe(401);
  });

  it('should delete tokens from cookies', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const signoutRes = await signoutRequest(server, cookiesHeader);
    const cookiesSignout = getCookies(signoutRes);

    const accessDeleted = cookiesSignout.some((cookie) =>
      /^accessToken=;/.test(cookie),
    );

    const refreshDeleted = cookiesSignout.some((cookie) =>
      /^refreshToken=;/.test(cookie),
    );

    expect(accessDeleted).toBe(true);
    expect(refreshDeleted).toBe(true);
  });

  it('should delete all sessions of the user', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const refreshToken = getToken(cookiesSignup, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    await signoutRequest(server, cookiesHeader);
    const userSessions = await sessionRepository.getUserSessions(payload.id);
    expect(userSessions).toEqual([]);
  });

  it('should return a success response', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const signoutRes = await signoutRequest(server, cookiesHeader);
    expect(signoutRes.body).toEqual({ message: 'Ви успішно вийшли з системи' });
  });
});
