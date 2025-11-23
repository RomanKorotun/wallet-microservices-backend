import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RefreshSuccessResponseDto } from '../dto/refresh/refresh-success-response.dto';
import { RefreshUnauthorizedResponseDto } from '../dto/refresh/refresh-unauthorized-response.dto';

export const RefreshSwagger = () => {
  return applyDecorators(
    ApiCookieAuth('refreshToken'),
    ApiOperation({
      summary: 'Видає нові access та refresh токени',
      description:
        'Використовується для перевірки валідності refresh токена. Якщо токен валідний - то нові access та refresh токени встановлюються в cookies',
    }),
    ApiOkResponse({
      type: RefreshSuccessResponseDto,
      description:
        'Успішна відповідь, яка підтверджує оновлення токенів та їх встановлення в cookies',
    }),
    ApiUnauthorizedResponse({
      type: RefreshUnauthorizedResponseDto,
      description:
        'Користувач не аутентифікований (не передано або недійсний токен)',
    }),
  );
};
