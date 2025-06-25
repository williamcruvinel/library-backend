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
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload-param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @UseGuards(AuthTokenGuard)
  createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.authorsService.create(createAuthorDto, tokenPayload);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  findAllAuthor() {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard)
  findOneAuthor(@Param('id') id: string) {
    return this.authorsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  updateAuthor(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.authorsService.update(+id, updateAuthorDto, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  removeAuthor(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.authorsService.remove(+id, tokenPayload);
  }
}
