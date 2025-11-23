import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignoutSuccessResponseDto } from '../dto/signout/signout-success-response.dto';
import { SignoutUnauthorizedResponseDto } from '../dto/signout/signout-unauthorized-response.dto';

export const SignoutSwagger = () => {
  return applyDecorators(
    ApiCookieAuth('accessToken'),
    ApiOperation({
      summary: 'Вихід користувача з системи',
      description: 'Очищує токени авторизації у кукі',
    }),
    ApiOkResponse({
      type: SignoutSuccessResponseDto,
      description: 'Успішний вихід користувача із системи',
    }),
    ApiUnauthorizedResponse({
      type: SignoutUnauthorizedResponseDto,
      description:
        'Користувач не аутентифікований (не передано або недійсний токен)',
    }),
  );
};
