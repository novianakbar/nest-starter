import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export enum Sort {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryDto {
  @IsOptional()
  sizePage: string;

  @IsOptional()
  page: string;

  @IsOptional()
  order: Sort;

  @IsOptional()
  sortBy: string;

  @IsOptional()
  search: string;

  @IsOptional()
  category: string;
}

export class DataId {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
