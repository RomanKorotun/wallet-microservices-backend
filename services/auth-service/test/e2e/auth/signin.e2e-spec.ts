import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { ITokenService } from '../../../src/modules/auth/domain/services/token.service';
import { IUserRepository } from '../../../src/modules/auth/domain/repositiries/user.repository';
import { createTestApp, ITestApp } from './helpers/test-app';
import { getCookies } from './helpers/cookies';
import { getToken } from './helpers/tokens';
import { TokenType } from '../../../src/modules/auth/domain/enums/token-type.enum';

describe('AuthController e2e - signin', () => {
  let testApp: ITestApp;
  let userRepository: IUserRepository;
  let tokenService: ITokenService;
  let configService: ConfigService;

  beforeAll(async () => {
    testApp = await createTestApp();
    userRepository = testApp.app.get('IUserRepository');
    tokenService = testApp.app.get('ITokenService');
    configService = testApp.app.get(ConfigService);
  });

  afterAll(async () => {
    await testApp.app.close();
  });

  afterEach(async () => {
    await userRepository.deleteAll();
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
  const urlSignup = '/api/auth/signup';
  const urlSignin = '/api/auth/signin';

  it('should return 400 if body is empty', async () => {
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send({});
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is missing', async () => {
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send(invalidEmail.missing);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send(invalidEmail.invalid);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is missing', async () => {
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send(invalidPassword.missing);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is invalid', async () => {
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send(invalidPassword.invalid);
    expect(statusCode).toBe(400);
  });

  it('should return 401 if user with this email does not exist', async () => {
    await request(testApp.server).post(urlSignup).send(signupDto);
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send(invalidEmail.notExist);
    expect(statusCode).toBe(401);
  });

  it('should return 401 if password is incorrect', async () => {
    await request(testApp.server).post(urlSignup).send(signupDto);
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send(invalidPassword.validButWrong);
    expect(statusCode).toBe(401);
  });

  it('should return status 200', async () => {
    await request(testApp.server).post(urlSignup).send(signupDto);
    const { statusCode } = await request(testApp.server)
      .post(urlSignin)
      .send(signinDto);
    expect(statusCode).toBe(200);
  });

  it('should return user object with correct fields', async () => {
    await request(testApp.server).post(urlSignup).send(signupDto);
    const response = await request(testApp.server)
      .post(urlSignin)
      .send(signinDto);
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
    await request(testApp.server).post(urlSignup).send(signupDto);
    const response = await request(testApp.server)
      .post(urlSignin)
      .send(signinDto);
    const cookiesArray: string[] = getCookies(response);
    const accessToken = getToken(cookiesArray, TokenType.ACCESS);
    const payload = tokenService.decode(accessToken, TokenType.ACCESS);
    expect(payload).toHaveProperty('id');
  });

  it('should have valid payload in refreshToken', async () => {
    await request(testApp.server).post(urlSignup).send(signupDto);
    const response = await request(testApp.server)
      .post(urlSignin)
      .send(signinDto);
    const cookiesArray: string[] = getCookies(response);
    const refreshToken = getToken(cookiesArray, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    expect(payload).toHaveProperty('id');
  });

  it('should set accessToken and refreshToken cookies', async () => {
    await request(testApp.server).post(urlSignup).send(signupDto);
    const response = await request(testApp.server)
      .post(urlSignin)
      .send(signinDto);
    const cookiesArray: string[] = getCookies(response);
    expect(cookiesArray.some((c: string) => c.startsWith('accessToken'))).toBe(
      true,
    );
    expect(cookiesArray.some((c: string) => c.startsWith('refreshToken'))).toBe(
      true,
    );
  });

  it('should set cookies with security attributes', async () => {
    await request(testApp.server).post(urlSignup).send(signupDto);
    const response = await request(testApp.server)
      .post(urlSignin)
      .send(signinDto);
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
