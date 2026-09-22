import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Env } from '../config/env.schema.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthTokens, AuthUser } from './types/auth-user.type.js';
import type { AccessTokenPayload, RefreshTokenPayload } from './types/jwt-payload.type.js';

// Placeholder only — a real project replaces this with actual OTP/email/SMS
// verification. It exists so `/auth/verify` demonstrates the same
// request/response contract the dashboard template's verify page expects.
const DEMO_VERIFICATION_CODE = '123456';
const DEMO_VERIFICATION_EMAIL = 'demo@example.com';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roles: string[];
  permissions: string[];
};

function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    permissions: user.permissions,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException({
        message: 'Invalid email or password.',
        code: 'INVALID_CREDENTIALS',
        errors: null,
      });
    }

    return this.issueTokens(user);
  }

  async register(name: string, email: string, password: string): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictException({
        message: 'An account with this email already exists.',
        code: 'EMAIL_TAKEN',
        errors: null,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email, passwordHash, roles: ['user'], permissions: [] },
    });

    return this.issueTokens(user);
  }

  async verify(code: string): Promise<AuthTokens> {
    if (code !== DEMO_VERIFICATION_CODE) {
      throw new UnauthorizedException({
        message: 'Invalid verification code.',
        code: 'INVALID_CODE',
        errors: null,
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { email: DEMO_VERIFICATION_EMAIL },
    });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid verification code.',
        code: 'INVALID_CODE',
        errors: null,
      });
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException({
        message: 'Session expired. Please sign in again.',
        code: 'INVALID_REFRESH_TOKEN',
        errors: null,
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException({
        message: 'Session expired. Please sign in again.',
        code: 'INVALID_REFRESH_TOKEN',
        errors: null,
      });
    }

    return this.issueTokens(user);
  }

  async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return toAuthUser(user);
  }

  private async issueTokens(user: UserRecord): Promise<AuthTokens> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: user.permissions,
    };
    const refreshPayload: RefreshTokenPayload = { sub: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', { infer: true }),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', { infer: true }),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
