import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAuthorDto: CreateAuthorDto,
    tokenPayload: PayloadTokenDto,
  ) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const newAuthor = await this.prisma.author.create({
        data: {
          name: createAuthorDto.name,
          bio: createAuthorDto.bio ? createAuthorDto.bio : '',
        },
      });

      return newAuthor;
    } catch (error) {
      throw new HttpException(
        'Falha ao cadastrar autor',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll() {
    try {
      const authorsList = await this.prisma.author.findMany();

      if (authorsList.length <= 0) {
        throw new HttpException(
          'Falha ao buscar autores',
          HttpStatus.NOT_FOUND,
        );
      }

      return authorsList;
    } catch (error) {
      throw new HttpException(
        'Falha ao buscar autores',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number) {
    try {
      const author = await this.prisma.author.findFirst({
        where: { id: id },
        select: {
          id: true,
          name: true,
          bio: true,
          books: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!author) {
        throw new HttpException('Falha ao buscar autor', HttpStatus.NOT_FOUND);
      }

      return author;
    } catch (error) {
      throw new HttpException('Falha ao buscar autor', HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    id: number,
    updateAuthorDto: UpdateAuthorDto,
    tokenPayload: PayloadTokenDto,
  ) {
    const author = await this.prisma.author.findFirst({
      where: { id: id },
    });

    if (!author) {
      throw new HttpException('Autor não foi encontrado', HttpStatus.NOT_FOUND);
    }

    try {
      if (author.bio === null) {
        author.bio = '';
      }

      const updateAutor = await this.prisma.author.update({
        where: { id: author.id },
        data: {
          name: updateAuthorDto.name ? updateAuthorDto.name : author.name,
          bio: updateAuthorDto.bio ? updateAuthorDto.bio : author.bio,
        },
      });

      return updateAutor;
    } catch (error) {
      throw new HttpException(
        `falha ao atualizar o autor ${author.name.toUpperCase()}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number, tokenPayload: PayloadTokenDto) {
    const author = await this.prisma.author.findFirst({
      where: { id: id },
    });

    if (!author) {
      throw new HttpException('Autor não foi encontrado', HttpStatus.NOT_FOUND);
    }

    try {
      await this.prisma.author.delete({
        where: { id: author.id },
      });

      return `Autor ${author.name.toUpperCase()} deletado com sucesso`;
    } catch (error) {
      throw new HttpException(
        `falha ao deletar o autor ${author.name.toUpperCase()}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
