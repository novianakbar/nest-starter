import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';

interface Rule {
  name: string;
  create: boolean;
  update: boolean;
  delete: boolean;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const string = requiredRoles;
    const parts = string.split(':');
    const permission = parts[0];
    const action = parts[1];

    const req = context.switchToHttp().getRequest();

    const permissions = req?.user?.roles?.Permission || [];

    const rule: Rule | undefined = permissions.find(
      (p) => p.name === permission,
    );

    if (rule) {
      return rule[action] || false;
    }

    return false;
  }
}
