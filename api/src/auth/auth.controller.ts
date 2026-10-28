import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { apiError, conflict, readCookie, zodToHttp } from '../common/http.js';
import { AuthService, SESSION_COOKIE, type NewSession, type SessionUser } from './auth.service.js';
import { CurrentUser, UserGuard } from './user.guard.js';

const credentials = z.object({
  email: z.email('Email không hợp lệ').trim().toLowerCase(),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(200),
});

const secureCookie = () => process.env.COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production';

function setSessionCookie(res: Response, s: NewSession) {
  res.cookie(SESSION_COOKIE, s.token, { httpOnly: true, sameSite: 'lax', secure: secureCookie(), path: '/', expires: s.expiresAt });
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('dang-ky')
  async signUp(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const r = credentials.safeParse(body);
    if (!r.success) throw zodToHttp(r.error);
    const s = await this.auth.signUp(r.data.email, r.data.password);
    if (!s) throw conflict('email_taken', 'Email này đã đăng ký');
    setSessionCookie(res, s);
    return { user: s.user };
  }

  @Post('dang-nhap')
  @HttpCode(200)
  async signIn(@Body() body: { email?: unknown; password?: unknown }, @Res({ passthrough: true }) res: Response) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const r = await this.auth.signIn(email, typeof body?.password === 'string' ? body.password : '');
    if ('error' in r) {
      // Không nói sai email hay sai mật khẩu (US-01 E2)
      if (r.error === 'blocked') throw apiError(429, 'blocked', 'Bạn đã nhập sai quá 5 lần. Thử lại sau 15 phút.');
      throw apiError(401, 'wrong_credentials', 'Sai email hoặc mật khẩu');
    }
    setSessionCookie(res, r);
    return { user: r.user };
  }

  @Post('dang-xuat')
  @HttpCode(204)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = readCookie(req.headers.cookie, SESSION_COOKIE);
    if (token) await this.auth.signOut(token);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }

  @Get('toi')
  @UseGuards(UserGuard)
  me(@CurrentUser() user: SessionUser) {
    return { user };
  }
}
