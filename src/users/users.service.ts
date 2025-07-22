import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from 'src/auth/hash/hashing.service';
import {
  ResponseCreateUserDto,
  ResponseUpdateUserDto,
} from './dto/response-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ResponseCreateUserDto> {
    try {
      const hashedPassword = await this.hashingService.hash(
        createUserDto.password,
      );

      const newUser = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          hashedPassword: hashedPassword,
          phone: createUserDto.phone,
          document: createUserDto.document,
          role: createUserDto.role ? createUserDto.role : 'COMMON',
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return newUser;
    } catch (error) {
      throw new HttpException(
        'Falha ao cadastrar usuário!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(tokenPayload: PayloadTokenDto, page = 1, limit = 9) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const skip = (page - 1) * limit;

      const [usersList, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
          },
          orderBy: {
            id: 'asc',
          },
        }),
        this.prisma.user.count(),
      ]);

      if (usersList.length <= 0) {
        throw new HttpException(
          'Falha ao buscar Usuários!',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: usersList,
        total: totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      throw new HttpException(
        'Falha ao buscar Usuários!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN' && id !== tokenPayload.sub) {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const user = await this.prisma.user.findFirst({
        where: { id: id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          document: true,
          role: true,
          reservations: true,
        },
      });

      if (!user)
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.NOT_FOUND,
        );

      return user;
    } catch (error) {
      throw new HttpException(
        'Usuário não encontrado!',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    tokenPayload: PayloadTokenDto,
  ): Promise<ResponseUpdateUserDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: id },
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    if (user.role === null) user.role = 'COMMON';

    if (tokenPayload.role !== 'ADMIN' && user.id !== tokenPayload.sub) {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const dataUser: {
        name?: string;
        email?: string;
        hashedPassword?: string;
        phone?: string;
        document?: string;
        role?: Role;
      } = {
        name: updateUserDto.name,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        document: updateUserDto.document,
        role: updateUserDto.role ?? user.role,
      };

      if (updateUserDto?.password) {
        const hashedPassword = await this.hashingService.hash(
          updateUserDto.password,
        );
        dataUser['hashedPassword'] = hashedPassword;
      }

      const updateUser = await this.prisma.user.update({
        where: { id: id },
        data: {
          name: dataUser.name,
          email: dataUser.email,
          phone: dataUser.phone,
          document: dataUser.document,
          role: dataUser.role,
          hashedPassword: dataUser?.hashedPassword
            ? dataUser.hashedPassword
            : user.hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return updateUser;
    } catch (error) {
      throw new HttpException(
        `Falha ao atualizar o usuário ${user.name.toUpperCase()}! `,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.prisma.user.findFirst({
      where: { id: id },
    });

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    try {
      await this.prisma.user.delete({
        where: { id: user.id },
      });

      return `Usuário ${user.name.toUpperCase()} deletado com sucesso!`;
    } catch (error) {
      throw new HttpException(
        `Falha ao deletar o usuário ${user.name.toUpperCase()}!`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
