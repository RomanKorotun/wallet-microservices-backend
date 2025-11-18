import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SignupUseCase } from '../application/use-cases/signup.use-case';
import { SignupRequestDto } from './dto/signup-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly signupService: SignupUseCase) {}

  @Post('signup')
  signup(
    @Body() dto: SignupRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signupService.execute(res, dto);
  }
}
