import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseCreateBookDto } from './dto/response.book.dto';
import { CopiesService } from 'src/copies/copies.service';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly copies: CopiesService,
  ) {}

  async create(
    createBookDto: CreateBookDto,
    tokenPayload: PayloadTokenDto,
  ): Promise<ResponseCreateBookDto> {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const newBook = await this.prisma.book.create({
        data: {
          title: createBookDto.title,
          authorId: createBookDto.authorId,
          categories: [...createBookDto.categories],
        },
        select: {
          id: true,
          title: true,
          authorId: true,
          categories: true,
        },
      });

      const unicCategories = Array.from(new Set(newBook.categories));
      newBook.categories = unicCategories;

      return newBook;
    } catch (error) {
      throw new HttpException(
        'Falha ao cadastrar livro!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      const booksList = await this.prisma.book.findMany({
        select: {
          id: true,
          title: true,
          author: {
            select: {
              name: true,
              bio: true,
            },
          },
          _count: true,
        },
      });
      if (booksList.length <= 0) {
        throw new HttpException('Falha ao buscar Livros', HttpStatus.NOT_FOUND);
      }

      return booksList;
    } catch (error) {
      throw new HttpException('Falha ao buscar Livros', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    try {
      const book = await this.prisma.book.findFirst({
        where: { id: id },
        select: {
          id: true,
          title: true,
          author: {
            select: {
              name: true,
              bio: true,
            },
          },
          copies: {
            select: {
              status: true,
            },
          },
          _count: true,
          categories: true,
        },
      });
      if (!book)
        throw new HttpException('Livro não encontrado', HttpStatus.NOT_FOUND);

      return book;
    } catch (error) {
      throw new HttpException('Livro não encontrado', HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    id: number,
    updateBookDto: UpdateBookDto,
    tokenPayload: PayloadTokenDto,
  ) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    const book = await this.prisma.book.findFirst({ where: { id: id } });

    if (!book) {
      throw new HttpException('Livro não encontrado!', HttpStatus.NOT_FOUND);
    }

    try {
      const updateBook = await this.prisma.book.update({
        where: {
          id: book.id,
        },
        data: {
          title: updateBookDto.title ? updateBookDto.title : book.title,
          authorId: updateBookDto.authorId
            ? updateBookDto.authorId
            : book.authorId,
          categories: updateBookDto.categories
            ? [...book.categories, ...updateBookDto.categories]
            : [...book.categories],
        },
      });

      const unicCategories = Array.from(new Set(updateBook.categories));
      updateBook.categories = unicCategories;

      return updateBook;
    } catch (error) {
      throw new HttpException(
        `Falha ao atualizar o livro ${book.title.toUpperCase()}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    const book = await this.prisma.book.findFirst({
      where: { id: id },
      select: {
        id: true,
        title: true,
        copies: true,
      },
    });

    if (!book) {
      throw new HttpException('Livro não encontrado', HttpStatus.NOT_FOUND);
    }

    try {
      book.copies.map(
        async (copy) => await this.copies.remove(copy.id, tokenPayload),
      );

      await this.prisma.book.delete({
        where: {
          id: book.id,
        },
      });

      return `Livro ${book.title} deletado com sucesso!`;
    } catch (error) {
      throw new HttpException(
        `Falha ao deletado o livro ${book.title.toUpperCase()}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
