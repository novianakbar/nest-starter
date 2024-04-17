import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { ErrorUtilService } from 'src/error/error.util.service';
import { Prisma, Role } from '@prisma/client';
import { generateResponse } from 'src/common/response.helper';
import { ResponseGetType, ResponseType } from 'src/common/types/response.types';
import { DataId, QueryDto } from 'src/common/common.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorUtilService: ErrorUtilService,
  ) {}
  private readonly logger = new Logger(RoleService.name);

  async getAllRoles({
    page,
    sizePage,
    search,
    sortBy,
    order,
  }: QueryDto): Promise<ResponseGetType<Role>> {
    try {
      const pageSize = parseInt(sizePage);
      const currentPage = parseInt(page);
      const skip = pageSize ? pageSize * (currentPage - 1) : undefined;
      const take = pageSize || undefined;
      const where: Prisma.RoleWhereInput = {};

      if (search) {
        where.OR = [{ name: { contains: search } }];
      }

      const orderBy: Prisma.RoleOrderByWithRelationInput = {};
      if (sortBy && order) {
        if (sortBy === 'name') {
          orderBy.name = order;
        } else if (sortBy === 'createdAt') {
          orderBy.createdAt = order;
        }
      }

      const totalCount = await this.prisma.role.count({ where });

      const roles = await this.prisma.role.findMany({
        where,
        orderBy,
        skip,
        take,
      });

      const totalPages = pageSize ? Math.ceil(totalCount / pageSize) : 1;

      const responseData = {
        statusCode: 200,
        totalPage: totalPages,
        pageSize: pageSize || totalCount,
        currentPage,
        totalItem: totalCount,
        data: roles,
      };

      return generateResponse(200, 'Success', responseData);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          error.meta.cause ||
            `Prisma Error ${error.code} ${JSON.stringify(error.meta)}`,
        );
        this.errorUtilService.generatePrismaErrorResponse(error);
      }
      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }

  async createRole(dto: CreateRoleDto): Promise<ResponseType<Role>> {
    try {
      const role = await this.prisma.role.create({
        data: {
          name: dto.name.toUpperCase(),
          Permission: {
            create: {
              name: 'TEST',
              create: true,
              read: true,
              update: true,
              delete: true,
            },
          },
        },
      });

      return generateResponse(200, 'Role created successfully', role);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          error.meta.cause ||
            `Prisma Error ${error.code} ${JSON.stringify(error.meta)}`,
        );
        this.errorUtilService.generatePrismaErrorResponse(error);
      }
      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }

  async updateRole(
    { id }: DataId,
    dto: UpdateRoleDto,
  ): Promise<ResponseType<Role>> {
    try {
      const role = await this.prisma.role.update({
        where: {
          id: id,
        },
        data: {
          name: dto.name.toUpperCase(),
        },
      });

      return generateResponse(200, 'Role updated successfully', role);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          error.meta.cause ||
            `Prisma Error ${error.code} ${JSON.stringify(error.meta)}`,
        );
        this.errorUtilService.generatePrismaErrorResponse(error);
      }
      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }

  async deleteRole({ id }: DataId): Promise<ResponseType<Role>> {
    try {
      const role = await this.prisma.role.delete({
        where: {
          id: id,
        },
      });

      return generateResponse(200, 'Role deleted successfully', role);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(
          error.meta.cause ||
            `Prisma Error ${error.code} ${JSON.stringify(error.meta)}`,
        );
        this.errorUtilService.generatePrismaErrorResponse(error);
      }
      this.logger.error(error.message, error.stack);
      this.errorUtilService.generateErrorResponse(error);
    }
  }
}
