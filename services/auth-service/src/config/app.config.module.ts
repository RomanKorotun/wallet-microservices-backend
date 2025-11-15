import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string(),
        JWT_ACCESS_TOKEN_TIME: Joi.number(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string(),
        JWT_REFRESH_TOKEN_TIME: Joi.number(),
      }),
    }),
  ],
})
export class AppConfigModule {}
