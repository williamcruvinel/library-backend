import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CopiesService } from './copies.service';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload-param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Controller('copies')
export class CopiesController {
  constructor(private readonly copiesService: CopiesService) {}

  @Post()
  @UseGuards(AuthTokenGuard)
  createCopies(
    @Body() createCopyDto: CreateCopyDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.copiesService.create(createCopyDto, tokenPayload);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  findAllCopies(@TokenPayloadParam() tokenPayload: PayloadTokenDto) {
    return this.copiesService.findAll(tokenPayload);
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard)
  findOneCopies(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.copiesService.findOne(+id, tokenPayload);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  updateCopies(
    @Param('id') id: string,
    @Body() updateCopyDto: UpdateCopyDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.copiesService.update(+id, updateCopyDto, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  removeCopies(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.copiesService.remove(+id, tokenPayload);
  }
}
