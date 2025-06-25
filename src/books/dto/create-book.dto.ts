import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  authorId: number;

  categories: string[];
}
