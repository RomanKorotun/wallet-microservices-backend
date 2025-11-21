import { ApiProperty } from '@nestjs/swagger';

export class SigninUnauthorizedResponseDto {
  @ApiProperty({ description: 'Статус відповіді', example: 401 })
  status: number;

  @ApiProperty({
    description: 'Текст помилки',
    example: 'Email або password не вірні',
  })
  message: string;

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
