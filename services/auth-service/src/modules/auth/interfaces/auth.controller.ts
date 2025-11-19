import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SignupUseCase } from '../application/use-cases/signup/signup-use-case';
import { SignupRequestDto } from './dto/signup/signup-request.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignupSwagger } from './swagger/signup.swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly signupService: SignupUseCase) {}

  @SignupSwagger()
  @Post('signup')
  signup(
    @Body() dto: SignupRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signupService.execute(res, dto);
  }
}
