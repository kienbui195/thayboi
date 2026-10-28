import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { hashPassword, verifyPassword } from './password.js';

export const SESSION_COOKIE = 'tb_session';
const SESSION_DAYS = 30;
export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60_000;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export type SessionUser = { id: number; email: string };
export type NewSession = { user: SessionUser; token: string; expiresAt: Date };
export type SignInResult = NewSession | { error: 'blocked' | 'wrong' };

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private async createSession(user: SessionUser): Promise<NewSession> {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
    await this.prisma.session.create({ data: { id: hashToken(token), userId: user.id, expiresAt } });
    return { user, token, expiresAt };
  }

  /** US-01, BR1: email không trùng. Trùng thì trả null. */
  async signUp(email: string, password: string): Promise<NewSession | null> {
    const passwordHash = await hashPassword(password);
    try {
      const u = await this.prisma.user.create({ data: { email, passwordHash } });
      return this.createSession({ id: u.id, email: u.email });
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') return null;
      throw e;
    }
  }

  /** AC-01.5: đã sai 5 lần trong 15 phút thì chặn, kể cả lần này nhập đúng. */
  async signIn(email: string, password: string, now = Date.now()): Promise<SignInResult> {
    const failures = await this.prisma.loginFailure.count({ where: { email, at: { gte: new Date(now - WINDOW_MS) } } });
    if (failures >= MAX_FAILURES) return { error: 'blocked' };
    const u = await this.prisma.user.findUnique({ where: { email } });
    if (!u || !(await verifyPassword(password, u.passwordHash))) {
      await this.prisma.loginFailure.create({ data: { email, at: new Date(now) } });
      return { error: 'wrong' };
    }
    await this.prisma.loginFailure.deleteMany({ where: { email } });
    return this.createSession({ id: u.id, email: u.email });
  }

  async signOut(token: string) {
    await this.prisma.session.deleteMany({ where: { id: hashToken(token) } });
  }

  async userFromToken(token: string | undefined): Promise<SessionUser | null> {
    if (!token) return null;
    const s = await this.prisma.session.findUnique({ where: { id: hashToken(token) }, include: { user: true } });
    if (!s || s.expiresAt < new Date()) return null;
    return { id: s.user.id, email: s.user.email };
  }
}
