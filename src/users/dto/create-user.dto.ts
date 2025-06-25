import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly password: string;

  @IsString()
  readonly phone: string;

  @IsString()
  readonly document: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(Role, { message: 'Usuário deve ser: ADMIN or COMMON' })
  readonly role: Role = Role.COMMON;
}
