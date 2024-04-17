import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import * as argon from 'argon2';
import {
  ConflictException,
  ForbiddenException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { ErrorUtilService } from 'src/error/error.util.service';
import { generateResponse } from 'src/common/response.helper';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly errorUtilService: ErrorUtilService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  private apiKeys: string[] = [
    'ca03na188ame03u1d78620de67282882a84',
    'd2e621a6646a4211768cd68e26f21228a81',
  ];

  async signin(dto: SignInDto, response: Response) {
    try {
      // find the user email
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
          isActive: true,
        },
      });
      //if user does not exist, throw error
      if (!user) throw new ForbiddenException('Email/Password is incorrect');

      // compare password
      const passwordValid = await argon.verify(user.password, dto.password);
      if (!passwordValid)
        throw new ForbiddenException('Email/Password is incorrect');
      // if password does not match, throw error
      delete user.password;
      const token = await this.signToken(user.id, user.email);
      const refreshToken = await this.signRefreshToken(user.id, user.email);
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
      });

      return generateResponse(200, 'Login Success', {
        ...user,
        token: token,
      });
    } catch (error) {
      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }

  async signup(dto: SignUpDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);

    // save user to database
    try {
      const getUser = await this.prisma.user.findUnique({
        where: {
          username: dto.username,
        },
      });

      if (getUser) throw new ConflictException('Username already exists');

      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          username: dto.username,
          email: dto.email,
          password: hash,
          role: 'ADMIN',
        },
      });

      delete user.password;
      const token = await this.signToken(user.id, user.email);
      const refreshToken = await this.signRefreshToken(user.id, user.email);

      return { user, token: token, refreshToken: refreshToken };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          error.meta.cause ||
            `Prisma Error ${error.code} ${JSON.stringify(error.meta)}`,
        );
        if (error.code === 'P2002' || error.code === 'P2003') {
          throw new ConflictException('Email already in use');
        }
      }

      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }

  async refresh(refreshToken: string) {
    try {
      if (!refreshToken) throw new ForbiddenException('Invalid refresh token');

      const payload = await this.verifyToken(refreshToken);

      if (payload === 'error')
        throw new ForbiddenException('Invalid refresh token');

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

      delete user.password;

      if (!user) throw new ForbiddenException('Invalid refresh token');

      const token = await this.signToken(user.id, user.email);

      return { data: { ...user, token: token } };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }

  async signout(refreshToken: string, response: Response) {
    try {
      if (!refreshToken) throw new ForbiddenException('Invalid refresh token');
      response.clearCookie('refreshToken');
      return { message: 'Logout Success' };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }

  async signToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      secret: secret,
      expiresIn: '15m',
    });

    return token;
  }

  async signRefreshToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWTREFRESH_SECRET');

    const token = await this.jwt.signAsync(payload, {
      secret: secret,
      expiresIn: '7d',
    });

    return token;
  }

  async verifyToken(token: string) {
    const secret = this.config.get('JWTREFRESH_SECRET');

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: secret,
      });

      return payload;
    } catch (error) {
      return 'error';
    }
  }

  validateApiKey(apiKey: string) {
    return this.apiKeys.find((apiK) => apiKey === apiK);
  }
}
