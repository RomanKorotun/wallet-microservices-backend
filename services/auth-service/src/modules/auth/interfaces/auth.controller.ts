import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { SignupUseCase } from '../application/use-cases/signup/signup-use-case';
import { SignupRequestDto } from './dto/signup/signup-request.dto';
import { SignupSwagger } from './swagger/signup.swagger';
import { SigninRequestDto } from './dto/signin/signin-request.dto';
import { SigninUseCase } from '../application/use-cases/signin/signin-use-case';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly signinUseCase: SigninUseCase,
  ) {}

  @SignupSwagger()
  @Post('signup')
  async signup(
    @Body() dto: SignupRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.signupUseCase.execute(res, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: SigninRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.signinUseCase.execute(res, dto);
  }
}
