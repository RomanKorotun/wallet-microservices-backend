import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SignupConflictResponseDto } from '../dto/signup/signup-conflict-response.dto';
import { SignupBadResponseDto } from '../dto/signup/signup-bad-response.dto';
import { SignupSuccessResponseDto } from '../dto/signup/signup-success-response.dto';

export const SignupSwagger = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Реєструє користувача в базі даних',
      description: 'Створює нового користувача в базі даних',
    }),
    ApiCreatedResponse({
      type: SignupSuccessResponseDto,
      description: 'Успішна реєстрація користувача',
    }),
    ApiConflictResponse({
      type: SignupConflictResponseDto,
      description: 'Користувач з таким email уже існує',
    }),
    ApiBadRequestResponse({
      type: SignupBadResponseDto,
      description: 'Некоректні вхідні дані. Помилка валідації полів',
    }),
  );
};
