
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
}
