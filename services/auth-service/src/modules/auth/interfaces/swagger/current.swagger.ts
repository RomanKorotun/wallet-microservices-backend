import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUnauthorizedResponseDto } from '../dto/current/current-unauthorized-response.dto';
import { CurrentSuccessResponseDto } from '../dto/current/current-rsuccess-response.dto';

export const CurrentSwagger = () => {
  return applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiOperation({
      summary: 'Повертає поточного користувача',
      description:
        'Повертає публічну інформацію про поточного авторизованого користувача',
    }),
    ApiOkResponse({
      type: CurrentSuccessResponseDto,
      description: 'Успішна відповідь із даними поточного користувача',
    }),
    ApiUnauthorizedResponse({
      type: CurrentUnauthorizedResponseDto,
      description:
        'Користувач не аутентифікований (не передано або недійсний токен)',
    }),
  );
};
