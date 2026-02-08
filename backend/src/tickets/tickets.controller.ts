import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, AddMessageDto, TicketFilterDto } from './tickets.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    async createTicket(@Request() req, @Body() createTicketDto: CreateTicketDto) {
        const providerId = req.user.userId;
        return this.ticketsService.createTicket(providerId, createTicketDto);
    }

    @Get()
    async getProviderTickets(@Request() req, @Query() filters: TicketFilterDto) {
        const providerId = req.user.userId;
        return this.ticketsService.getProviderTickets(providerId, filters);
    }

    @Get(':id')
    async getTicketById(@Request() req, @Param('id') ticketId: string) {
        const providerId = req.user.userId;
        return this.ticketsService.getTicketById(ticketId, providerId);
    }

    @Patch(':id')
    async updateTicket(
        @Request() req,
        @Param('id') ticketId: string,
        @Body() updateTicketDto: UpdateTicketDto,
    ) {
        const providerId = req.user.userId;
        return this.ticketsService.updateTicket(ticketId, providerId, updateTicketDto);
    }

    @Post(':id/messages')
    async addMessage(
        @Request() req,
        @Param('id') ticketId: string,
        @Body() addMessageDto: AddMessageDto,
    ) {
        const senderId = req.user.userId;
        return this.ticketsService.addMessage(ticketId, senderId, addMessageDto);
    }

    @Patch(':id/close')
    async closeTicket(@Request() req, @Param('id') ticketId: string) {
        const providerId = req.user.userId;
        return this.ticketsService.closeTicket(ticketId, providerId);
    }
}
