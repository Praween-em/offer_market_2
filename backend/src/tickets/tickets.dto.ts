import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TicketCategory {
    PAYMENT_DISPUTE = 'payment_dispute',
    ACCOUNT_ISSUE = 'account_issue',
    PLATFORM_BUG = 'platform_bug',
    POLICY_QUESTION = 'policy_question',
    LEAD_QUALITY = 'lead_quality',
    VERIFICATION_ISSUE = 'verification_issue',
    OTHER = 'other',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
}

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    WAITING_PROVIDER = 'waiting_provider',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export class CreateTicketDto {
    @IsEnum(TicketCategory)
    @IsNotEmpty()
    category: TicketCategory;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    subject: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority = TicketPriority.MEDIUM;
}

export class UpdateTicketDto {
    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus;

    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;
}

export class AddMessageDto {
    @IsString()
    @IsNotEmpty()
    message: string;
}

export class TicketFilterDto {
    @IsEnum(TicketCategory)
    @IsOptional()
    category?: TicketCategory;

    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus;
}
