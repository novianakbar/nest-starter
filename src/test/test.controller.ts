import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator/role.decorator';
import { JwtGuard, RolesGuard } from 'src/auth/guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('test')
export class TestController {
  @Roles('TEST:read')
  @Get('')
  async getAll() {
    return {
      status: 200,
      message: 'success',
    };
  }
}
