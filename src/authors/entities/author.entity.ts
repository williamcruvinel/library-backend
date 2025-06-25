import { Book } from 'src/books/entities/book.entity';

export class Author {
  id: number;
  name: string;
  books: Book[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
