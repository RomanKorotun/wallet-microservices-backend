import request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { createTestApp, ITestAppContext } from './test-app';
import { IUserRepository } from '../src/modules/auth/domain/repositiries/user.repository';
import { TokenService } from '../src/modules/auth/infrastructure/services/token.service';
import { TokenType } from '../src/modules/auth/domain/enums/token-type.enum';
import { getCookies } from './helpers/cookies';
import { getToken } from './helpers/tokens';

describe('AuthController e2e - signup', () => {
  let ctx: ITestAppContext;
  let userRepository: IUserRepository;
  let tokenService: TokenService;
  let configService: ConfigService;

  beforeAll(async () => {
    ctx = await createTestApp();
    userRepository = ctx.app.get('IUserRepository');
    tokenService = ctx.app.get(TokenService);
    configService = ctx.app.get(ConfigService);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  afterEach(async () => {
    await userRepository.deleteAll();
  });

  const dto = {
    username: 'test',
    email: 'test@gmail.com',
    password: 'R123456',
  };

  const invalidUsername = {
    missing: { email: dto.email, password: dto.password },
    notString: { ...dto, username: 123 },
    tooShort: { ...dto, username: 'A' },
    tooLong: { ...dto, username: 'Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  };

  const invalidEmail = {
    missing: { username: dto.username, password: dto.password },
    invalid: { ...dto, email: 'test.gmail.com' },
  };

  const invalidPassword = {
    missing: { username: dto.username, email: dto.email },
    invalid: { ...dto, password: '123' },
  };

  const url = '/api/auth/signup';

  it('should create user in database', async () => {
    await request(ctx.server).post(url).send(dto);
    const user = await userRepository.findByEmail(dto.email);
    expect(user).toBeTruthy();
  });

  it('should return status 201', async () => {
    const { statusCode } = await request(ctx.server).post(url).send(dto);
    expect(statusCode).toBe(201);
  });

  it('should return user object with correct fields', async () => {
    const response = await request(ctx.server).post(url).send(dto);
    expect(response.body).toEqual({
      message: 'Access Token i Refresh Token встановлені в кукі',
      user: {
        id: expect.any(String),
        username: dto.username,
        email: dto.email,
      },
    });
  });

  it('should return 400 if body is empty', async () => {
    const { statusCode } = await request(ctx.server).post(url).send({});
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is missing', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidUsername.missing);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is not a string', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidUsername.notString);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is short', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidUsername.tooShort);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if username is long', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidUsername.tooLong);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is missing', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidEmail.missing);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if email is invalid', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidEmail.invalid);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is missing', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidPassword.missing);
    expect(statusCode).toBe(400);
  });

  it('should return 400 if password is invalid', async () => {
    const { statusCode } = await request(ctx.server)
      .post(url)
      .send(invalidPassword.invalid);
    expect(statusCode).toBe(400);
  });

  it('should return 409 if user with same email exists', async () => {
    await request(ctx.server).post(url).send(dto);
    const { statusCode } = await request(ctx.server).post(url).send(dto);
    expect(statusCode).toBe(409);
  });

  it('should have valid payload in accessToken', async () => {
    const response = await request(ctx.server).post(url).send(dto);
    const cookiesArray: string[] = getCookies(response);
    const accessToken = getToken(cookiesArray, TokenType.ACCESS);
    const payload = tokenService.decode(accessToken, TokenType.ACCESS);
    expect(payload).toHaveProperty('id');
  });

  it('should have valid payload in refreshToken', async () => {
    const response = await request(ctx.server).post(url).send(dto);
    const cookiesArray: string[] = getCookies(response);
    const refreshToken = getToken(cookiesArray, TokenType.REFRESH);
    const payload = tokenService.decode(refreshToken, TokenType.REFRESH);
    expect(payload).toHaveProperty('id');
  });

  it('should set accessToken and refreshToken cookies', async () => {
    const response = await request(ctx.server).post(url).send(dto);
    const cookiesArray: string[] = getCookies(response);
    expect(cookiesArray.some((c: string) => c.startsWith('accessToken'))).toBe(
      true,
    );
    expect(cookiesArray.some((c: string) => c.startsWith('refreshToken'))).toBe(
      true,
    );
  });

  it('should set cookies with security attributes', async () => {
    const response = await request(ctx.server).post(url).send(dto);
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const cookiesArray: string[] = Array.isArray(cookies) ? cookies : [cookies];
    expect(cookiesArray.some((c) => c.includes('HttpOnly'))).toBe(true);
    if (configService.getOrThrow('NODE_ENV') === 'production') {
      expect(cookiesArray.some((c) => c.includes('Secure'))).toBe(true);
      expect(cookiesArray.some((c) => c.includes('SameSite=None'))).toBe(true);
    } else {
      expect(cookiesArray.some((c) => c.includes('Secure'))).toBe(false);
      expect(cookiesArray.some((c) => c.includes('SameSite=Lax'))).toBe(true);
    }
  });
});
