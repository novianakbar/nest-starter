import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signin(dto, response);
  }

  @Post('register')
  signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Get('logout')
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signout(request.cookies['refreshToken'], response);
  }

  // refresh token from cookie
  @Get('refresh')
  refreshToken(@Req() request: Request) {
    return this.authService.refresh(request.cookies['refreshToken']);
  }
}
