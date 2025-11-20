import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../../../../../common/constants/regex.constants';

export class SigninRequestDto {
  @IsNotEmpty({ message: 'Поле email не може бути пустим' })
  @IsEmail({}, { message: 'Поле email містить не вірний формат' })
  email: string;

  @IsNotEmpty({ message: 'Поле password не може бути пустим' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Поле password повинно містити мінімум 6 символів, принаймні одну цифру та одну велику літеру',
  })
  password: string;
}
