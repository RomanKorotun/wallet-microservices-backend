import { ConfigService } from '@nestjs/config';
import { Server } from 'http';
import { createTestApp, ITestApp } from './helpers/test-app';
import { ISessionRepository } from '../../../src/modules/auth/domain/repositories/session.repository';
import { ITokenService } from '../../../src/modules/auth/domain/services/token.service';
import { TokenType } from '../../../src/modules/auth/domain/enums/token-type.enum';
import { IUserRepository } from '../../../src/modules/auth/domain/repositories/user.repository';
import { getCookies, getCookiesHeader } from './helpers/cookies.helper';
import { getToken } from './helpers/tokens.helper';
import { refreshRequest, signupRequest } from './helpers/request.helper';

describe('AuthController e2e - refresh', () => {
  let testApp: ITestApp;
  let server: Server;
  let userRepository: IUserRepository;
  let sessionRepository: ISessionRepository;
  let tokenService: ITokenService;
  let configService: ConfigService;

  beforeAll(async () => {
    testApp = await createTestApp();
    server = testApp.server;
    userRepository = testApp.app.get<IUserRepository>('IUserRepository');
    sessionRepository =
      testApp.app.get<ISessionRepository>('ISessionRepository');
    tokenService = testApp.app.get<ITokenService>('ITokenService');
    configService = testApp.app.get(ConfigService);
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
    const { statusCode } = await refreshRequest(server, invalidRefreshToken);
    expect(statusCode).toBe(401);
  });

  it('should return 401 if missing refreshToken', async () => {
    const { statusCode } = await refreshRequest(server);
    expect(statusCode).toBe(401);
  });

  it('should delete old session in the session repository', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const refreshToken = getToken(cookiesSignup, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    const cookieHeader = getCookiesHeader(cookiesSignup);
    await refreshRequest(server, cookieHeader);
    const oldSessionKey = `session:${payload.id}:${refreshToken}`;
    const deletedSession = await sessionRepository.getSession(oldSessionKey);
    expect(deletedSession).toBeNull();
  });

  it('should have valid payload in accessToken', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const refreshRes = await refreshRequest(server, cookiesHeader);
    const cookiesRefresh = getCookies(refreshRes);
    const accessToken = getToken(cookiesRefresh, TokenType.ACCESS);
    const payload = tokenService.decode(accessToken, TokenType.ACCESS);
    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('jti');
  });

  it('should have valid payload in refreshToken', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const refreshRes = await refreshRequest(server, cookiesHeader);
    const cookiesRefresh = getCookies(refreshRes);
    const refreshToken = getToken(cookiesRefresh, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    expect(payload).toHaveProperty('id');
    expect(payload).toHaveProperty('jti');
  });

  it('should create session in the session repository', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const refreshRes = await refreshRequest(server, cookiesHeader);
    const cookiesRefresh = getCookies(refreshRes);
    const refreshToken = getToken(cookiesRefresh, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    const sessionKey = `session:${payload.id}:${refreshToken}`;
    const session = await sessionRepository.getSession(sessionKey);
    expect(session).not.toBeNull();
    expect(session!.userId).toBeDefined();
    expect(session?.createdAt).toBeGreaterThan(0);
  });

  it('should set accessToken and refreshToken in cookies', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const refreshRes = await refreshRequest(server, cookiesHeader);
    const cookiesRefresh = getCookies(refreshRes);
    expect(
      cookiesRefresh.some((c: string) => c.startsWith('accessToken=')),
    ).toBe(true);
    expect(
      cookiesRefresh.some((c: string) => c.startsWith('refreshToken=')),
    ).toBe(true);
  });

  it('shoult set cookies with secure attributes', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const refreshRes = await refreshRequest(server, cookiesHeader);
    const cookiesRefresh = getCookies(refreshRes);
    expect(cookiesRefresh.every((c) => c.includes('HttpOnly'))).toBe(true);
    if (configService.getOrThrow('NODE_ENV') === 'production') {
      expect(cookiesRefresh.every((c) => c.includes('Secure'))).toBe(true);
      expect(cookiesRefresh.every((c) => c.includes('SameSite=None'))).toBe(
        true,
      );
    } else {
      expect(cookiesRefresh.every((c) => !c.includes('Secure'))).toBe(true);
      expect(cookiesRefresh.every((c) => c.includes('SameSite=Lax'))).toBe(
        true,
      );
    }
  });

  it('should return a success response', async () => {
    const signupRes = await signupRequest(server, signupDto);
    const cookiesSignup = getCookies(signupRes);
    const cookiesHeader = getCookiesHeader(cookiesSignup);
    const refreshRes = await refreshRequest(server, cookiesHeader);
    expect(refreshRes.body).toEqual({
      message: 'Access Token i Refresh Token встановлені в cookies',
    });
  });
});
