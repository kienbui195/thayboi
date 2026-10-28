import { CanActivate, createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { readCookie, unauthenticated } from '../common/http.js';
import { AuthService, SESSION_COOKIE, type SessionUser } from './auth.service.js';

type WithUser = Request & { user?: SessionUser };

/** Đường cần đăng nhập: đọc cookie tb_session, không có hoặc hết hạn thì 401. */
@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<WithUser>();
    const user = await this.auth.userFromToken(readCookie(req.headers.cookie, SESSION_COOKIE));
    if (!user) throw unauthenticated();
    req.user = user;
    return true;
  }
}

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<WithUser>().user!);
