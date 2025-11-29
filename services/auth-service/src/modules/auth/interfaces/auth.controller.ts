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
import { CurrentSuccessResponseDto } from './dto/current/current-success-response.dto';
import { CurrentSwagger } from './swagger/current.swagger';
import { SignoutUseCase } from '../application/use-cases/signout/signout-use-case';
import { SignoutSuccessResponseDto } from './dto/signout/signout-success-response.dto';
import { SignoutSwagger } from './swagger/signout.swagger';
import { RefreshUseCase } from '../application/use-cases/refresh/refresh-use-case';
import { RefreshSwagger } from './swagger/refresh.swagger';
import { RefreshSuccessResponseDto } from './dto/refresh/refresh-success-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly signinUseCase: SigninUseCase,
    private readonly refreshUseCase: RefreshUseCase,
    private readonly signoutUseCase: SignoutUseCase,
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

  @RefreshSwagger()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: DomainUser,
  ): RefreshSuccessResponseDto {
    return this.refreshUseCase.execute(res, user.id);
  }

  @SignoutSwagger()
  @UseGuards(AuthGuard('jwt-access'))
  @HttpCode(HttpStatus.OK)
  @Post('signout')
  signout(
    @Res({ passthrough: true }) res: Response,
  ): SignoutSuccessResponseDto {
    return this.signoutUseCase.execute(res);
  }
}
