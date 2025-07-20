import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';
import { Response } from 'express';
import { AuthTokenGuard } from './guard/auth-token.guard';
import { REQUST_TOKEN_PAYLOAD_USER } from './common/auth.constants';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.authenticate(signInDto);

    // add token ao cookies http only
    res.cookie('token', token, {
      httpOnly: true, // evita acesso
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7000 * 60 * 60 * 24, // expira em 7 dia
    });

    return user;
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logout realizado com sucesso' };
  }

  @Get('me')
  @UseGuards(AuthTokenGuard)
  me(@Req() req: any) {
    return req[REQUST_TOKEN_PAYLOAD_USER];
  }
}
