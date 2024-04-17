import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;
}
