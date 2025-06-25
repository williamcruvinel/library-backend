import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { StatusReservation } from '@prisma/client';
import { IsDate } from 'class-validator';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @IsDate()
  devolutionAt: Date;
}
