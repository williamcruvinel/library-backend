import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config/dist/types/config.type';
import { REQUST_TOKEN_PAYLOAD_USER } from '../common/auth.constants';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new HttpException('Token não encontrado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request[REQUST_TOKEN_PAYLOAD_USER] = payload;
    } catch (error) {
      throw new HttpException(
        'Acesso não autorizado!',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }

  extractToken(request: Request) {
    if (request.cookies?.token) {
      return request.cookies.token;
    }

    const authorization = request.headers?.authorization;
    if (authorization && typeof authorization === 'string') {
      return authorization.split(' ')[1];
    }

    return undefined;
  }
}
