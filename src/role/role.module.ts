import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { ErrorUtilService } from 'src/error/error.util.service';

@Module({
  controllers: [RoleController],
  providers: [RoleService, ErrorUtilService],
})
export class RoleModule {}
