import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEX } from '../../../../common/constants/regex.constants';

export class SignupRequestDto {
  @IsNotEmpty({ message: 'Поле username не моде бути пустим' })
  @IsString({ message: 'Поле username повинно бути рядком' })
  @MinLength(2, {
    message: 'Поле username повинно бути не менше 2 символів',
  })
  @MaxLength(50, {
    message: 'Поле username повинно бути не більше 50 символів',
  })
  username: string;

  @IsNotEmpty({ message: 'Поле email не може бути пустим' })
  @IsString({ message: 'Поле email повинно бути рядком' })
  @IsEmail({}, { message: 'Поле email містить не вірний формат' })
  email: string;

  @IsNotEmpty({ message: 'Поле password не може бути пустим' })
  @Matches(PASSWORD_REGEX, {
    message:
      'Поле password повинно містити мінімум 6 символів, принаймні одну цифру та одну велику літеру',
  })
  password: string;
}
