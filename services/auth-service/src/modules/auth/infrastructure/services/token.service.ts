import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../../domain/enums/token-type.enum';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generate(userId: string, tokenType: TokenType): string {
    const accessTokenSecret = this.configService.getOrThrow(
      'JWT_ACCESS_TOKEN_SECRET',
    );
    const accessTokenTime = +this.configService.getOrThrow(
      'JWT_ACCESS_TOKEN_TIME',
    );
    const refreshTokenSecret = this.configService.getOrThrow(
      'JWT_REFRESH_TOKEN_SECRET',
    );
    const refreshTokenTime = +this.configService.getOrThrow(
      'JWT_REFRESH_TOKEN_TIME',
    );
    const payload = { id: userId };

    if (tokenType === TokenType.ACCESS) {
      return this.jwtService.sign(payload, {
        secret: accessTokenSecret,
        expiresIn: accessTokenTime,
      });
    }

    if (tokenType === TokenType.REFRESH) {
      return this.jwtService.sign(payload, {
        secret: refreshTokenSecret,
        expiresIn: refreshTokenTime,
      });
    }

    throw new InternalServerErrorException('Недопустимий тип токена');
  }
}
