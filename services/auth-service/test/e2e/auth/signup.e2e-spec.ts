import { ConfigService } from '@nestjs/config';
import { Server } from 'http';
import type { IUserRepository } from '../../../src/modules/auth/domain/repositories/user.repository';
import { TokenType } from '../../../src/modules/auth/domain/enums/token-type.enum';
import { getCookies } from './helpers/cookies.helper';
import { getToken } from './helpers/tokens.helper';
import type { ITokenService } from '../../../src/modules/auth/domain/services/token.service';
import { createTestApp, ITestApp } from './helpers/test-app';
import { postRequest } from './helpers/request.helper';
import { ISessionRepository } from '../../../src/modules/auth/domain/repositories/session.repository';

describe('AuthController e2e - signup', () => {
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

  const invalidUsername = {
    missing: { email: signupDto.email, password: signupDto.password },
    notString: { ...signupDto, username: 123 },
    tooShort: { ...signupDto, username: 'A' },
    tooLong: { ...signupDto, username: 'Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  };

  const invalidEmail = {
    missing: { username: signupDto.username, password: signupDto.password },
    invalid: { ...signupDto, email: 'test.gmail.com' },
  };

  const invalidPassword = {
    missing: { username: signupDto.username, email: signupDto.email },
    invalid: { ...signupDto, password: '123' },
  };

  const urlSignup = '/api/auth/signup';

  it('should return 400 if body is empty', async () => {
    const { statusCode } = await postRequest(server, urlSignup, {});
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is missing', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidUsername.missing,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is not a string', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidUsername.notString,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is short', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidUsername.tooShort,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is long', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidUsername.tooLong,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is missing', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidEmail.missing,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidEmail.invalid,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is missing', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidPassword.missing,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is invalid', async () => {
    const { statusCode } = await postRequest(
      server,
      urlSignup,
      invalidPassword.invalid,
    );
    expect(statusCode).toBe(400);
  });

  it('should return 409 if user with same email exists', async () => {
    await postRequest(server, urlSignup, signupDto);
    const { statusCode } = await postRequest(server, urlSignup, signupDto);
    expect(statusCode).toBe(409);
  });

  it('should create user in database', async () => {
    await postRequest(server, urlSignup, signupDto);
    const user = await userRepository.findByEmail(signupDto.email);
    expect(user).toBeTruthy();
  });

  it('should return status 201', async () => {
    const { statusCode } = await postRequest(server, urlSignup, signupDto);
    expect(statusCode).toBe(201);
  });

  it('should return user object with correct fields', async () => {
    const response = await postRequest(server, urlSignup, signupDto);
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
    const response = await postRequest(server, urlSignup, signupDto);
    const cookiesArray: string[] = getCookies(response);
    const accessToken = getToken(cookiesArray, TokenType.ACCESS);
    const payload = tokenService.decode(accessToken, TokenType.ACCESS);
    expect(payload).toHaveProperty('id');
  });

  it('should have valid payload in refreshToken', async () => {
    const response = await postRequest(server, urlSignup, signupDto);
    const cookiesArray: string[] = getCookies(response);
    const refreshToken = getToken(cookiesArray, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    expect(payload).toHaveProperty('id');
  });

  it('should create session in the session repository', async () => {
    const response = await postRequest(server, urlSignup, signupDto);
    const cookiesArray: string[] = getCookies(response);
    const refreshToken = getToken(cookiesArray, TokenType.REFRESH);
    const session = await sessionRepository.getByRefreshToken(refreshToken);
    expect(session).not.toBeNull();
    expect(session!.userId).toBeDefined();
    expect(session!.createdAt).toBeGreaterThan(0);
  });

  it('should set accessToken and refreshToken cookies', async () => {
    const response = await postRequest(server, urlSignup, signupDto);
    const cookiesArray: string[] = getCookies(response);
    expect(cookiesArray.some((c: string) => c.startsWith('accessToken'))).toBe(
      true,
    );
    expect(cookiesArray.some((c: string) => c.startsWith('refreshToken'))).toBe(
      true,
    );
  });

  it('should set cookies with security attributes', async () => {
    const response = await postRequest(server, urlSignup, signupDto);
    const cookiesArray: string[] = getCookies(response);
    expect(cookiesArray.every((c) => c.includes('HttpOnly'))).toBe(true);
    if (configService.getOrThrow('NODE_ENV') === 'production') {
      expect(cookiesArray.every((c) => c.includes('Secure'))).toBe(true);
      expect(cookiesArray.every((c) => c.includes('SameSite=None'))).toBe(true);
    } else {
      expect(cookiesArray.every((c) => !c.includes('Secure'))).toBe(true);
      expect(cookiesArray.every((c) => c.includes('SameSite=Lax'))).toBe(true);
    }
  });
});
