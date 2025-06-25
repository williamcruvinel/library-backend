import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateCopyDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  bookId: number;
}
