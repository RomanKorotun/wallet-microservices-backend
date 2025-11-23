import { ApiProperty } from '@nestjs/swagger';

export class SignoutUnauthorizedResponseDto {
  @ApiProperty({ description: 'HTTP статус відповіді', example: 401 })
  status: number;

  @ApiProperty({
    description: 'Текст помилки',
    example: 'Unauthorized',
  })
  message: string;

  @ApiProperty({
    description: 'URL, на який був зроблений запит',
    example: '/api/auth/signout',
  })
  url: string;

  @ApiProperty({
    description: 'Час виникнення помилки',
    example: '2025-07-04T13:06:18.729Z',
  })
  timestamp: string;
}
