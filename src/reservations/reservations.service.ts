import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOverdueReservations() {
    const now = new Date();

    const updated = await this.prisma.reservation.updateMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: now },
        devolutionAt: null,
      },
      data: {
        status: 'EXPIRED',
      },
    });

    return `Reservas expiradas: ${updated.count}`;
  }

  async create(
    createReservationDto: CreateReservationDto,
    tokenPayload: PayloadTokenDto,
  ) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('acesso negado', HttpStatus.UNAUTHORIZED);
    }

    const availableUser = await this.prisma.user.findMany({
      where: { id: createReservationDto.userId },
      include: {
        reservations: true,
      },
    });

    availableUser.map((user) =>
      user.reservations.map((reserved) => {
        if (reserved.status === 'EXPIRED') {
          throw new HttpException(
            'Usuário bloqueado para novas reservas',
            HttpStatus.BAD_REQUEST,
          );
        }
      }),
    );

    const availableCopies = await this.prisma.copy.findMany({
      where: {
        id: { in: createReservationDto.copies },
        status: 'AVAILABLE',
      },
    });

    if (availableCopies.length !== createReservationDto.copies.length) {
      throw new HttpException(
        'Algumas cópias já reservadas.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const now = new Date();
      const dueDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

      const newReservation = await this.prisma.reservation.create({
        data: {
          userId: createReservationDto.userId,
          status: createReservationDto.status ?? 'ACTIVE',
          dueDate: dueDate,
          copies: {
            connect: createReservationDto.copies.map((id) => ({ id })),
          },
        },
        select: {
          id: true,
          dueDate: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          copies: {
            select: {
              id: true,
              book: {
                select: {
                  title: true,
                  author: true,
                },
              },
              status: true,
            },
          },
        },
      });

      await this.prisma.copy.updateMany({
        where: { id: { in: createReservationDto.copies } },
        data: {
          status: 'RESERVED',
          reservationId: newReservation.id,
        },
      });

      return newReservation;
    } catch (error) {
      throw new HttpException('Falha ao criar reserva', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('acesso negado', HttpStatus.UNAUTHORIZED);
    }

    try {
      const reservationsList = await this.prisma.reservation.findMany({
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
          reservedAt: true,
          dueDate: true,
          devolutionAt: true,
          status: true,
        },
      });

      return reservationsList;
    } catch (error) {
      throw new HttpException(
        'Falha ao buscar as reservas',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN' && id !== tokenPayload.sub) {
      throw new HttpException('Acesso negado!', HttpStatus.UNAUTHORIZED);
    }

    try {
      const reservation = await this.prisma.reservation.findFirst({
        where: { id: id },
        select: {
          copies: true,
        },
      });

      if (!reservation) {
        throw new HttpException(
          'Reserva não foi encontrada',
          HttpStatus.NOT_FOUND,
        );
      }

      return reservation;
    } catch (error) {
      throw new HttpException(
        'Falha ao buscar reserva',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: number,
    updateReservationDto: UpdateReservationDto,
    tokenPayload: PayloadTokenDto,
  ) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('acesso negado', HttpStatus.UNAUTHORIZED);
    }

    const reservation = await this.prisma.reservation.findFirst({
      where: { id: id },
    });

    if (!reservation) {
      throw new HttpException('Reserva não encontrada', HttpStatus.BAD_REQUEST);
    }

    try {
      const updateReservation = await this.prisma.reservation.update({
        where: { id: id },
        data: {
          userId: updateReservationDto.userId,
          status: updateReservationDto.status,
          devolutionAt:
            updateReservationDto.devolutionAt ?? reservation.devolutionAt,
        },
      });

      return updateReservation;
    } catch (error) {
      throw new HttpException(
        'Fala ao atualizar reserva',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async returnReservation(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('acesso negado', HttpStatus.UNAUTHORIZED);
    }

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: id },
      include: { copies: true },
    });

    if (!reservation) {
      throw new HttpException(
        'Reserva não foi encontrada',
        HttpStatus.NOT_FOUND,
      );
    }

    if (reservation.status === 'COMPLETED') {
      throw new HttpException('Reserva não ativa', HttpStatus.NOT_FOUND);
    }

    try {
      await this.prisma.copy.updateMany({
        where: { reservationId: id },
        data: {
          status: 'AVAILABLE',
          reservationId: null,
        },
      });

      const updatedReservation = await this.prisma.reservation.update({
        where: { id: id },
        data: {
          status: 'COMPLETED',
          devolutionAt: new Date(),
        },
      });

      return updatedReservation;
    } catch (error) {
      throw new HttpException(
        'Falha na devolução de reserva',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: number, tokenPayload: PayloadTokenDto) {
    if (tokenPayload.role !== 'ADMIN') {
      throw new HttpException('acesso negado', HttpStatus.UNAUTHORIZED);
    }

    try {
      const reservation = await this.prisma.reservation.findFirst({
        where: { id: id },
      });

      if (!reservation) {
        throw new HttpException(
          'Fala ao deletar reserva',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.reservation.delete({ where: { id: reservation.id } });
      return `Reserva deletada com sucesso!`;
    } catch (error) {
      throw new HttpException(
        'Fala ao deletar reserva',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
