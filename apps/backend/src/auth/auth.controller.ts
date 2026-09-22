import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { type LoginInput, loginSchema } from './schemas/login.schema.js';
import { type VerifyInput, verifySchema } from './schemas/verify.schema.js';
import type { AuthTokens, AuthUser } from './types/auth-user.type.js';

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_PATH = '/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() body: LoginInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthTokens> {
    const tokens = await this.authService.login(body.email, body.password);
    return this.respondWithTokens(tokens, response);
  }

  @Public()
  @Post('verify')
  @UsePipes(new ZodValidationPipe(verifySchema))
  async verify(
    @Body() body: VerifyInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthTokens> {
    const tokens = await this.authService.verify(body.code);
    return this.respondWithTokens(tokens, response);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthTokens> {
    const refreshToken = request.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Session expired. Please sign in again.',
        code: 'INVALID_REFRESH_TOKEN',
        errors: null,
      });
    }

    const tokens = await this.authService.refresh(refreshToken);
    return this.respondWithTokens(tokens, response);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return this.authService.getCurrentUser(user.id);
  }

  /**
   * The refresh token never appears in the JSON body — only in an httpOnly
   * cookie the browser sends automatically. `accessToken` still travels in
   * the body, matching the dashboard template's `AuthTokens` shape exactly
   * (`refreshToken` is `null`, which its Zod schema already accepts).
   */
  private respondWithTokens(tokens: AuthTokens, response: Response): AuthTokens {
    response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
    });

    return { accessToken: tokens.accessToken, refreshToken: null };
  }
}
