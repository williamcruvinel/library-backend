import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload-param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(AuthTokenGuard)
  createBook(
    @Body() createBookDto: CreateBookDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.booksService.create(createBookDto, tokenPayload);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  findAllBooks() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard)
  findOneBook(@Param('id') id: string) {
    return this.booksService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  updateBook(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.booksService.update(+id, updateBookDto, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  removeBook(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.booksService.remove(+id, tokenPayload);
  }
}
