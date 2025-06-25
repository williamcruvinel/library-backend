import { StatusCopy } from '@prisma/client';

export class ResponseCreateCopyDto {
  bookId: number;
  status: StatusCopy | null;
}
