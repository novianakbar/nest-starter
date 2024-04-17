import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (action: string) => SetMetadata(ROLES_KEY, action);
