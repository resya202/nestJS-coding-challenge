import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLE_KEY } from './role.decorator';
  import { UserRole } from '../users/user.entity';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRole = this.reflector.getAllAndOverride<UserRole>(ROLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (!requiredRole) return true;
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user || user.role !== requiredRole) {
        throw new ForbiddenException('Insufficient permissions');
      }
  
      return true;
    }
  }
  