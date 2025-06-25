import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CopiesModule } from 'src/copies/copies.module';

@Module({
  imports: [PrismaModule, CopiesModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
