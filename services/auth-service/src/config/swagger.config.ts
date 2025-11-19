import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Auth Service API')
  .setDescription(
    'Мікросервіс для реєстрації, авторизації користувачів та управління токенами.',
  )
  .setVersion('0.0.1')
  .setContact(
    'Roman Korotun',
    'https://github.com/RomanKorotun/wallet-microservices-backend/tree/main/services/auth-service',
    'roman.korotun@ukr.net',
  )
  .build();
