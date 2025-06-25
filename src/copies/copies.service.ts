import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Injectable()
export class CopiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCopyDto: CreateCopyDto, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const newCopy = await this.prisma.copy.create({
        data: {
          bookId: createCopyDto.bookId,
          status: 'AVAILABLE',
        },
        select: {
          id: true,
          bookId: true,
          book: {
            select: {
              title: true,
            },
          },
        },
      });

      return newCopy;
    } catch (error) {
      throw new HttpException(
        'Falha ao cadastrar cópia!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const copiesList = await this.prisma.copy.findMany({
        select: {
          id: true,
          book: {
            select: {
              title: true,
            },
          },
          status: true,
        },
      });

      if (copiesList.length <= 0) {
        throw new HttpException(
          'Falha ao buscar cópias!',
          HttpStatus.NOT_FOUND,
        );
      }

      return copiesList;
    } catch (error) {
      throw new HttpException(
        'Falha ao buscar cópias!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const copy = await this.prisma.copy.findFirst({
        where: { id: id },
        select: {
          id: true,
          book: true,
          status: true,
        },
      });

      if (!copy) {
        throw new HttpException('Copia não encontrada!', HttpStatus.NOT_FOUND);
      }

      return copy;
    } catch (error) {
      throw new HttpException('Copia não encontrada!', HttpStatus.NOT_FOUND);
    }
  }

  async update(
    id: number,
    updateCopyDto: UpdateCopyDto,
    tokenPayload: PayloadTokenDto,
  ) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    const copy = await this.prisma.copy.findFirst({
      where: { id: id },
    });

    if (!copy) {
      throw new HttpException('Copia não encontrada', HttpStatus.NOT_FOUND);
    }

    let reservationId = updateCopyDto.reservationId;

    if (updateCopyDto.reservationId === null) {
      reservationId = null;
    } else {
      reservationId = updateCopyDto.reservationId ?? copy.reservationId;
    }

    try {
      const updateCopy = await this.prisma.copy.update({
        where: { id: copy.id },
        data: {
          bookId: updateCopyDto.bookId ?? copy.bookId,
          reservationId: reservationId,
          status: updateCopyDto.status ?? copy.status,
        },
        select: {
          id: true,
          bookId: true,
          book: {
            select: {
              title: true,
            },
          },
          status: true,
        },
      });

      return updateCopy;
    } catch (error) {
      throw new HttpException(
        `Falha ao atualizar cópia`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    const copy = await this.prisma.copy.findFirst({
      where: { id: id },
      select: {
        id: true,
        book: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!copy) {
      throw new HttpException('Copia não encontrada', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.prisma.copy.delete({ where: { id: copy.id } });

      return `Copia do livro ${copy.book.title.toUpperCase()} deletada com sucesso!`;
    } catch (error) {
      throw new HttpException('Falha ao deletar cópia', HttpStatus.BAD_REQUEST);
    }
  }
}
