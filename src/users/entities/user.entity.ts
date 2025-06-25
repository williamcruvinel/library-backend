import { Reservation } from 'src/reservations/entities/reservation.entity';

type Role = 'ADMIN' | 'COMMON';

export interface User {
  id: number;
  name: string;
  email: string;
  hashedPassword: string;
  phone: string;
  document: string;
  role?: Role;
  reservations: Reservation[];
  createdAt: Date;
  updatedAt: Date;
}
