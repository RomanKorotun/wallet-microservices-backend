import { ApiProperty } from '@nestjs/swagger';

export class RefreshSuccessResponseDto {
  @ApiProperty({
    description: 'Повідомлення про успішну видачу нових токенів',
    example: 'Access Token i Refresh Token встановлені в cookies',
  })
  message: string;
}
