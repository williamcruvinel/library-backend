import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AuthorsModule } from 'src/authors/authors.module';
import { BooksModule } from 'src/books/books.module';
import { CopiesModule } from 'src/copies/copies.module';
import { ReservationsModule } from 'src/reservations/reservations.module';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    BooksModule,
    CopiesModule,
    ReservationsModule,
    AuthorsModule,
  ],
})
export class AppModule {}
