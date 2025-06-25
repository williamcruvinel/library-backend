import { Role } from '@prisma/client';
import { Reservation } from 'src/reservations/entities/reservation.entity';

export class ResponseFindOneUserDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  reservations: Reservation[];
}

export class ResponseCreateUserDto {
  id: number;
  name: string;
  email: string;
}
export class ResponseUpdateUserDto {
  id: number;
  name: string;
  email: string;
  role: Role | null;
}
