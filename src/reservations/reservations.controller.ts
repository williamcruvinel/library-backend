import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AuthTokenGuard } from 'src/auth/guard/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/param/token-payload-param';
import { PayloadTokenDto } from 'src/auth/dto/payload-token.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(AuthTokenGuard)
  create(
    @Body() createReservationDto: CreateReservationDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.reservationsService.create(createReservationDto, tokenPayload);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  findAllReservations(@TokenPayloadParam() tokenPayload: PayloadTokenDto) {
    return this.reservationsService.findAll(tokenPayload);
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard)
  findOneReservations(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.reservationsService.findOne(+id, tokenPayload);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  updateReservations(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.reservationsService.update(
      +id,
      updateReservationDto,
      tokenPayload,
    );
  }

  @Patch(':id/return')
  @UseGuards(AuthTokenGuard)
  returnOneReservation(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.reservationsService.returnReservation(+id, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  removeReservations(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: PayloadTokenDto,
  ) {
    return this.reservationsService.remove(+id, tokenPayload);
  }
}
