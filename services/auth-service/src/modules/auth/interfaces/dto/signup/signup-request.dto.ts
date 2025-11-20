import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEX } from '../../../../../common/constants/regex.constants';
import { ApiProperty } from '@nestjs/swagger';

export class SignupRequestDto {
  @ApiProperty({
    description: "Ім'я користувача",
    minLength: 2,
    maxLength: 50,
    example: 'Roman',
  })
  @IsNotEmpty({ message: 'Поле username не може бути пустим' })
  @IsString({ message: 'Поле username повинно бути рядком' })
  @MinLength(2, {
    message: 'Поле username повинно бути не менше 2 символів',
  })
  @MaxLength(50, {
    message: 'Поле username повинно бути не більше 50 символів',
  })
  username: string;

  @ApiProperty({
    description: 'Email користувача',
    example: 'roman.korotun@ukr.net',
  })
  @IsNotEmpty({ message: 'Поле email не може бути пустим' })
  @IsString({ message: 'Поле email повинно бути рядком' })
  @IsEmail({}, { message: 'Поле email містить не вірний формат' })
  email: string;

  @ApiProperty({
    description: 'Пароль Користувача',
    example: 'R1234567',
  })
  @IsNotEmpty({ message: 'Поле password не може бути пустим' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Поле password повинно містити мінімум 6 символів, принаймні одну цифру та одну велику літеру',
  })
  password: string;
}
