import { ApiProperty } from '@nestjs/swagger';
import { UserInfoResponseDto } from './user-info-response.dto';

export class SignupSuccessResponseDto {
  @ApiProperty({
    description: 'Повідомлення про успішну реєстрацію',
    example: 'Access Token i Refresh Token встановлені в кукі',
  })
  message: string;

  @ApiProperty({ type: UserInfoResponseDto })
  user: UserInfoResponseDto;
}
