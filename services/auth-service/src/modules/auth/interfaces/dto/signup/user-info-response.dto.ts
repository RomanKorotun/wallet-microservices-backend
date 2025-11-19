import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResponseDto {
  @ApiProperty({
    description: 'Id користувача',
    example: 'c1d06b95-9d19-4ab0-81c7-c46e66c29900',
  })
  id: string;

  @ApiProperty({ description: 'Ім"я користувача', example: 'Roman' })
  username: string;

  @ApiProperty({
    description: 'Email користувача',
    example: 'roman.korotun@ukr.net',
  })
  email: string;
}
