import { Copy } from 'src/copies/entities/copy.entity';

type StatusReservation = 'ACTIVE' | 'COMPLETED' | 'EXPIRED';

export class Reservation {
  id: number;
  userId: number;
  user: string;
  copies: Copy[];
  reservedAt: Date;
  dueDate: Date;
  devolutionAt?: Date;
  status?: StatusReservation;
  createdAt: Date;
  updatedAt: Date;
}
