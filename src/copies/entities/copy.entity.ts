import { Book } from 'src/books/entities/book.entity';
import { Reservation } from 'src/reservations/entities/reservation.entity';

type StatusCopy = 'AVAILABLE' | 'RESERVED';

export class Copy {
  id: number;
  bookId: number;
  book: Book;
  status?: StatusCopy;
  reservationId?: number;
  reservation?: Reservation;
  createdAt: Date;
  updatedAt: Date;
}
