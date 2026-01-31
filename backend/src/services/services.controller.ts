import { Controller, Get, Param, Query, Post, Body, Patch, Delete, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get('categories')
    findAllCategories() {
        return this.servicesService.findAllCategories();
    }

    @Get('providers')
    findAllProviders(
        @Query('categoryId') categoryId?: string,
        @Query('search') search?: string
    ) {
        return this.servicesService.findAllProviders(categoryId, search);
    }

    @Get('providers/:id')
    findOneProvider(@Param('id') id: string) {
        return this.servicesService.findOneProvider(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-profile')
    async getMyProviderProfile(@Req() req) {
        // First find the provider record for this user
        const provider = await this.servicesService.findProviderByUserId(req.user.userId);
        if (!provider) {
            throw new BadRequestException('Provider profile not found');
        }
        return provider;
    }

    @UseGuards(JwtAuthGuard)
    @Post('manage')
    async createService(@Req() req, @Body() data: any) {
        const provider = await this.servicesService.findProviderByUserId(req.user.userId);
        if (!provider) throw new BadRequestException('Provider profile not found');
        return this.servicesService.createService(provider.id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('manage/:id')
    async updateService(@Param('id') id: string, @Body() data: any) {
        // Add ownership check in production
        return this.servicesService.updateService(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('manage/:id')
    async deleteService(@Param('id') id: string) {
        // Add ownership check in production
        return this.servicesService.deleteService(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('portfolio')
    async addPortfolioItem(@Req() req, @Body() data: any) {
        const provider = await this.servicesService.findProviderByUserId(req.user.userId);
        if (!provider) throw new BadRequestException('Provider profile not found');
        return this.servicesService.addPortfolioItem(provider.id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('portfolio/:id')
    async deletePortfolioItem(@Param('id') id: string) {
        // Add ownership check in production
        return this.servicesService.deletePortfolioItem(id);
    }
}

