import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUST_TOKEN_PAYLOAD_USER } from '../common/auth.constants';

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request: Request = context.getRequest();

    return request[REQUST_TOKEN_PAYLOAD_USER];
  },
);
