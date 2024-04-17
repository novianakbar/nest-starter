import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { DataId, QueryDto } from 'src/common/common.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  getAll(@Query() dto: QueryDto) {
    return this.roleService.getAllRoles(dto);
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Patch(':id')
  update(@Param() id: DataId, @Body() body: UpdateRoleDto) {
    return this.roleService.updateRole(id, body);
  }

  @Delete(':id')
  delete(@Param() id: DataId) {
    return this.roleService.deleteRole(id);
  }
}
