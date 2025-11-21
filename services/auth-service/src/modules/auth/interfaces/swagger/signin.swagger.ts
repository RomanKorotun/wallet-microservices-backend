import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SigninSuccessResponseDto } from '../dto/signin/signin-success-response.dto';
import { SigninUnauthorizedResponseDto } from '../dto/signin/signin-unauthorized-response.dto';
import { SigninBadRequestResponseDto } from '../dto/signin/signin-bad-request-response.dto';

export const SigninSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Аутентифікація користувача',
      description:
        'Перевіряє email та пароль користувача. У разі успіху встановлює Access Token i Refresh Token в кукі.',
    }),
    ApiOkResponse({
      type: SigninSuccessResponseDto,
      description: 'Успішна аутентифікація користувача',
    }),
    ApiUnauthorizedResponse({
      type: SigninUnauthorizedResponseDto,
      description: 'Невірний email або пароль. Доступ заборонено.',
    }),
    ApiBadRequestResponse({
      type: SigninBadRequestResponseDto,
      description: 'Некоректні вхідні дані. Помилка валідації полів',
    }),
  );
};
