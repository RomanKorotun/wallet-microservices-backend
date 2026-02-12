import { ConfigService } from '@nestjs/config';
import { Server } from 'http';
import { ITokenService } from '../../../src/modules/auth/domain/services/token.service';
import { IUserRepository } from '../../../src/modules/auth/domain/repositories/user.repository';
import { createTestApp, ITestApp } from './helpers/test-app';
import { getCookies } from './helpers/cookies.helper';
import { getToken } from './helpers/tokens.helper';
import { TokenType } from '../../../src/modules/auth/domain/enums/token-type.enum';
import { signinRequest, signupRequest } from './helpers/request.helper';
import { ISessionRepository } from '../../../src/modules/auth/domain/repositories/session.repository';

describe('AuthController e2e - signin', () => {
  let testApp: ITestApp;
  let server: Server;
  let userRepository: IUserRepository;
  let tokenService: ITokenService;
  let configService: ConfigService;
  let sessionRepository: ISessionRepository;

  beforeAll(async () => {
    testApp = await createTestApp();
    server = testApp.server;
    userRepository = testApp.app.get<IUserRepository>('IUserRepository');
    tokenService = testApp.app.get<ITokenService>('ITokenService');
    configService = testApp.app.get(ConfigService);
    sessionRepository =
      testApp.app.get<ISessionRepository>('ISessionRepository');
  });

  beforeEach(async () => {
    await signupRequest(server, signupDto);
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
    email: 'test_signin@gmail.com',
    password: 'R123456',
  };

  const signinDto = {
    email: 'test_signin@gmail.com',
    password: 'R123456',
  };

  const invalidEmail = {
    missing: { password: signinDto.password },
    invalid: { ...signinDto, email: 'test.gmail.com' },
    notExist: { ...signinDto, email: 'validemail@gmail.com' },
  };

  const invalidPassword = {
    missing: { email: signinDto.email },
    invalid: { ...signinDto, password: '123' },
    validButWrong: { ...signinDto, password: 'R999999' },
  };

  it('should return 400 if body is empty', async () => {
    const { statusCode } = await signinRequest(server, {});
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is missing', async () => {
    const { statusCode } = await signinRequest(server, invalidEmail.missing);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    const { statusCode } = await signinRequest(server, invalidEmail.invalid);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is missing', async () => {
    const { statusCode } = await signinRequest(server, invalidPassword.missing);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is invalid', async () => {
    const { statusCode } = await signinRequest(server, invalidPassword.invalid);
    expect(statusCode).toBe(400);
  });

  it('should return 401 if user with this email does not exist', async () => {
    const { statusCode } = await signinRequest(server, invalidEmail.notExist);
    expect(statusCode).toBe(401);
  });

  it('should return 401 if password is incorrect', async () => {
    const { statusCode } = await signinRequest(
      server,
      invalidPassword.validButWrong,
    );
    expect(statusCode).toBe(401);
  });

  it('should return status 200', async () => {
    const { statusCode } = await signinRequest(server, signinDto);
    expect(statusCode).toBe(200);
  });

  it('should return user object with correct fields', async () => {
    const response = await signinRequest(server, signinDto);
    expect(response.body).toEqual({
      message: 'Access Token i Refresh Token встановлені в кукі',
      user: {
        id: expect.any(String),
        username: signupDto.username,
        email: signupDto.email,
      },
    });
  });

  it('should have valid payload in accessToken', async () => {
    const response = await signinRequest(server, signinDto);
    const cookies = getCookies(response);
    const accessToken = getToken(cookies, TokenType.ACCESS);
    const payload = tokenService.decode(accessToken, TokenType.ACCESS);
    expect(payload).toHaveProperty('id');
  });

  it('should have valid payload in refreshToken', async () => {
    const response = await signinRequest(server, signinDto);
    const cookies = getCookies(response);
    const refreshToken = getToken(cookies, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    expect(payload).toHaveProperty('id');
  });

  it('should create session in the session repository', async () => {
    const response = await signinRequest(server, signinDto);
    const cookies = getCookies(response);
    const refreshToken = getToken(cookies, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    const sessionKey = `session:${payload.id}:${refreshToken}`;
    const session = await sessionRepository.getSession(sessionKey);
    expect(session).not.toBeNull();
    expect(session!.userId).toBeDefined();
    expect(session!.createdAt).toBeGreaterThan(0);
  });

  it('should set accessToken and refreshToken in cookies', async () => {
    const response = await signinRequest(server, signinDto);
    const cookies = getCookies(response);
    expect(cookies.some((c: string) => c.startsWith('accessToken='))).toBe(
      true,
    );
    expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(
      true,
    );
  });

  it('should set cookies with security attributes', async () => {
    const response = await signinRequest(server, signinDto);
    const cookies = getCookies(response);
    expect(cookies.every((c) => c.includes('HttpOnly'))).toBe(true);
    if (configService.getOrThrow('NODE_ENV') === 'production') {
      expect(cookies.every((c) => c.includes('Secure'))).toBe(true);
      expect(cookies.every((c) => c.includes('SameSite=None'))).toBe(true);
    } else {
      expect(cookies.every((c) => !c.includes('Secure'))).toBe(true);
      expect(cookies.every((c) => c.includes('SameSite=Lax'))).toBe(true);
    }
  });
});
