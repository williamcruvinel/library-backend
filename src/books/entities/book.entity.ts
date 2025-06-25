import { Author } from 'src/authors/entities/author.entity';
import { Copy } from 'src/copies/entities/copy.entity';

export class Book {
  id: number;
  title: string;
  authorId: number;
  author: Author;
  categories: string[];
  copies: Copy[];
  createdAt: Date;
  updatedAt: Date;
}
