import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SignupUseCase } from '../application/use-cases/signup/signup-use-case';
import { SignupRequestDto } from './dto/signup/signup-request.dto';
import { SignupSwagger } from './swagger/signup.swagger';
import { SigninRequestDto } from './dto/signin/signin-request.dto';
import { SigninUseCase } from '../application/use-cases/signin/signin-use-case';
import { SigninSwagger } from './swagger/signin.swagger';
import { CurrentUser } from './decorators/current-user.decorator';
import { DomainUser } from '../domain/entities/user';
import { SignupSuccessResponseDto } from './dto/signup/signup-success-response.dto';
import { SigninSuccessResponseDto } from './dto/signin/signin-success-response.dto';
import { CurrentSuccessResponseDto } from './dto/current/current-rsuccess-response.dto';
import { CurrentSwagger } from './swagger/current.swagger';

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
  ): Promise<SignupSuccessResponseDto> {
    return await this.signupUseCase.execute(res, dto);
  }

  @SigninSwagger()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: SigninRequestDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SigninSuccessResponseDto> {
    return await this.signinUseCase.execute(res, dto);
  }

  @CurrentSwagger()
  @UseGuards(AuthGuard('jwt-access'))
  @Get('current')
  current(@CurrentUser() user: DomainUser): CurrentSuccessResponseDto {
    return { id: user.id, username: user.username, email: user.email };
  }
}
