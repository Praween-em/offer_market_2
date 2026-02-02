import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async addReview(@Req() req, @Body() data: { providerId: string; rating: number; comment?: string }) {
        return this.reviewsService.addReview(req.user.userId, data);
    }

    @Get('provider/:providerId')
    async getProviderReviews(@Param('providerId') providerId: string) {
        return this.reviewsService.getProviderReviews(providerId);
    }
}
