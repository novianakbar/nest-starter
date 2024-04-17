import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeyStrategy, JwtStrategy } from './strategy';
import { PassportModule } from '@nestjs/passport';
import { ErrorUtilService } from 'src/error/error.util.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AuthService, JwtStrategy, ApiKeyStrategy, ErrorUtilService],
  controllers: [AuthController],
})
export class AuthModule {}
