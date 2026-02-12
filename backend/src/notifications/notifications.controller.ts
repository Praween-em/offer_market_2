import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(@Request() req: any) {
        return this.notificationsService.getUserNotifications(req.user.userId);
    }

    @Post('register-token')
    async registerToken(@Request() req: any, @Body() body: { fcmToken: string; platform?: string; appType?: string }) {
        return this.notificationsService.registerToken(req.user.userId, body.fcmToken, body.platform, body.appType);
    }

    @Post(':id/read')
    async markRead(@Request() req: any, @Param('id') id: string) {
        return this.notificationsService.markAsRead(id, req.user.userId);
    }

    @Delete('clear')
    async clearNotifications(@Request() req: any) {
        return this.notificationsService.clearAll(req.user.userId);
    }

    @Post('send-test')
    async sendTest(@Body() body: { fcmToken: string }) {
        return this.notificationsService.sendTestNotification(body.fcmToken);
    }
}
