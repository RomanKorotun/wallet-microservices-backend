import { ApiProperty } from '@nestjs/swagger';
import { UserInfoResponseDto } from '../signup/user-info-response.dto';

export class SigninSuccessResponseDto {
  @ApiProperty({
    description: 'Повідомлення про успішну аутентифікацію',
    example: 'Access Token i Refresh Token встановлені в кукі',
  })
  message: string;

  @ApiProperty({ type: UserInfoResponseDto })
  user: UserInfoResponseDto;
}
