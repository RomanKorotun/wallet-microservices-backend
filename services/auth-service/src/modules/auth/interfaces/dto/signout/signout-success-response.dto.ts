import { ApiProperty } from '@nestjs/swagger';

export class SignoutSuccessResponseDto {
  @ApiProperty({
    description: 'Повідомлення про успішний вихід користувача із системи',
    example: 'Ви успішно вийшли з системи',
  })
  message: string;
}
