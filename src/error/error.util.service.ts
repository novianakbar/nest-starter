import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

@Injectable()
export class ErrorUtilService {
  generatePrismaErrorResponse(
    error: Prisma.PrismaClientKnownRequestError,
  ): void {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002' || error.code === 'P2003') {
        throw new ConflictException(
          error.meta.cause || 'Unique or Foreign key constraint failed',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(error.meta.cause || 'Data Not Found');
      }

      throw new InternalServerErrorException(
        error.meta.cause || 'Internal server error',
      );
    }
  }

  generateErrorResponse(error: any, message?: string): void {
    if (error.hasOwnProperty('response')) throw error;
    throw new InternalServerErrorException(message || 'An error occured');
  }
}
