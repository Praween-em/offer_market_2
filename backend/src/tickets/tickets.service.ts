import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto, AddMessageDto, TicketFilterDto } from './tickets.dto';

@Injectable()
export class TicketsService {
    constructor(private prisma: PrismaService) { }

    async createTicket(providerId: string, createTicketDto: CreateTicketDto) {
        // Generate unique ticket number
        const ticketCount = await this.prisma.provider_tickets.count();
        const ticketNumber = `TKT-${new Date().getFullYear()}-${String(ticketCount + 1).padStart(5, '0')}`;

        const ticket = await this.prisma.provider_tickets.create({
            data: {
                provider_id: providerId,
                ticket_number: ticketNumber,
                category: createTicketDto.category,
                subject: createTicketDto.subject,
                description: createTicketDto.description,
                priority: createTicketDto.priority || 'medium',
                status: 'open',
            },
            include: {
                users_provider: {
                    select: {
                        id: true,
                        display_name: true,
                        phone: true,
                    },
                },
            },
        });

        return ticket;
    }

    async getProviderTickets(providerId: string, filters?: TicketFilterDto) {
        const where: any = { provider_id: providerId };

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        const tickets = await this.prisma.provider_tickets.findMany({
            where,
            include: {
                users_provider: {
                    select: {
                        id: true,
                        display_name: true,
                    },
                },
                _count: {
                    select: {
                        ticket_messages: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return tickets;
    }

    async getTicketById(ticketId: string, providerId: string) {
        const ticket = await this.prisma.provider_tickets.findUnique({
            where: { id: ticketId },
            include: {
                users_provider: {
                    select: {
                        id: true,
                        display_name: true,
                        phone: true,
                    },
                },
                users_assigned: {
                    select: {
                        id: true,
                        display_name: true,
                    },
                },
                ticket_messages: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                display_name: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: {
                        created_at: 'asc',
                    },
                },
                ticket_attachments: {
                    include: {
                        users: {
                            select: {
                                id: true,
                                display_name: true,
                            },
                        },
                    },
                    orderBy: {
                        created_at: 'asc',
                    },
                },
            },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        // Ensure the ticket belongs to the provider
        if (ticket.provider_id !== providerId) {
            throw new ForbiddenException('You do not have access to this ticket');
        }

        return ticket;
    }

    async updateTicket(ticketId: string, providerId: string, updateTicketDto: UpdateTicketDto) {
        // First verify ownership
        await this.getTicketById(ticketId, providerId);

        const ticket = await this.prisma.provider_tickets.update({
            where: { id: ticketId },
            data: {
                ...updateTicketDto,
                updated_at: new Date(),
                ...(updateTicketDto.status === 'resolved' && { resolved_at: new Date() }),
                ...(updateTicketDto.status === 'closed' && { closed_at: new Date() }),
            },
            include: {
                users_provider: {
                    select: {
                        id: true,
                        display_name: true,
                    },
                },
            },
        });

        return ticket;
    }

    async addMessage(ticketId: string, senderId: string, addMessageDto: AddMessageDto) {
        // Verify ticket exists
        const ticket = await this.prisma.provider_tickets.findUnique({
            where: { id: ticketId },
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        const message = await this.prisma.ticket_messages.create({
            data: {
                ticket_id: ticketId,
                sender_id: senderId,
                message: addMessageDto.message,
                is_internal: false,
            },
            include: {
                users: {
                    select: {
                        id: true,
                        display_name: true,
                        role: true,
                    },
                },
            },
        });

        // Update ticket's updated_at timestamp
        await this.prisma.provider_tickets.update({
            where: { id: ticketId },
            data: { updated_at: new Date() },
        });

        return message;
    }

    async addAttachment(ticketId: string, uploadedBy: string, fileUrl: string, fileName: string, fileType: string) {
        const attachment = await this.prisma.ticket_attachments.create({
            data: {
                ticket_id: ticketId,
                file_url: fileUrl,
                file_name: fileName,
                file_type: fileType,
                uploaded_by: uploadedBy,
            },
            include: {
                users: {
                    select: {
                        id: true,
                        display_name: true,
                    },
                },
            },
        });

        return attachment;
    }

    async closeTicket(ticketId: string, providerId: string) {
        // First verify ownership
        await this.getTicketById(ticketId, providerId);

        const ticket = await this.prisma.provider_tickets.update({
            where: { id: ticketId },
            data: {
                status: 'closed',
                closed_at: new Date(),
                updated_at: new Date(),
            },
        });

        return ticket;
    }
}
