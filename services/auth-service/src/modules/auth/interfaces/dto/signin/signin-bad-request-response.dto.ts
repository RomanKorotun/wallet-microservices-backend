import { ApiProperty } from '@nestjs/swagger';

export class SigninBadRequestResponseDto {
  @ApiProperty({ description: 'Статус відповіді', example: 400 })
  status: number;

  @ApiProperty({
    description: 'Текст помилки',
    example: [
      'Поле password повинно містити мінімум 6 символів, принаймні одну цифру та одну велику літеру',
      'Поле password не може бути пустим',
    ],
  })
  message: string | string[];

  @ApiProperty({
    description: 'URL на який був зроблений запит',
    example: '/api/auth/signin',
  })
  url: string;

  @ApiProperty({
    description: 'Час виникнення помилки',
    example: '2025-07-04T13:06:18.729Z',
  })
  timestamp: string;
}
