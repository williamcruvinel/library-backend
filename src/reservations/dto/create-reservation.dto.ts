import { StatusReservation } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  copies: number[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(StatusReservation, {
    message: 'Status deve ser: ACTIVE, COMPLETED or EXPIRED',
  })
  status: StatusReservation;

  @IsDate()
  dueDate: Date;
}
