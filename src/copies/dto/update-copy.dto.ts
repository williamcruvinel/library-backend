import { PartialType } from '@nestjs/mapped-types';
import { CreateCopyDto } from './create-copy.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { StatusCopy } from '@prisma/client';

export class UpdateCopyDto extends PartialType(CreateCopyDto) {
  @IsPositive()
  @IsNotEmpty()
  readonly reservationId?: number | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(StatusCopy, { message: 'Status deve ser: AVAILABLE or RESERVED' })
  readonly status?: StatusCopy = StatusCopy.AVAILABLE;
}
