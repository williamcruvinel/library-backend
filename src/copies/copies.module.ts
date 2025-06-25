import { Module } from '@nestjs/common';
import { CopiesService } from './copies.service';
import { CopiesController } from './copies.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CopiesController],
  providers: [CopiesService],
  exports: [CopiesService],
})
export class CopiesModule {}
