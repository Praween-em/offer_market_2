
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get('categories')
    findAllCategories() {
        return this.servicesService.findAllCategories();
    }

    @Get('providers')
    findAllProviders(@Query('categoryId') categoryId?: string) {
        return this.servicesService.findAllProviders(categoryId);
    }

    @Get('providers/:id')
    findOneProvider(@Param('id') id: string) {
        return this.servicesService.findOneProvider(id);
    }
}
