import { Body, Controller, Post, Get, Query, HttpCode, HttpStatus, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    async sendOtp(@Body('phone') phone: string) {
        console.log(`[AuthController] Received send-otp request for: ${phone}`);
        return this.authService.sendOtp(phone);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(
        @Body('phone') phone: string,
        @Body('otp') otp?: string,
        @Body('token') token?: string
    ) {
        if (token) {
            return this.authService.verifyTokenAndLogin(phone, token);
        }
        if (otp) {
            return this.authService.verifyAndLogin(phone, otp);
        }
        throw new BadRequestException('Missing OTP or Token');
    }

    @UseGuards(JwtAuthGuard)
    @Post('onboard')
    @HttpCode(HttpStatus.OK)
    async onboard(@Req() req, @Body() data: any) {
        return this.authService.onboard(req.user.userId, data);
    }

    @Get('legal-terms')
    @HttpCode(HttpStatus.OK)
    async getLegalTerms(@Query('type') type: string) {
        if (!type) {
            throw new BadRequestException('Legal terms type is required');
        }
        return this.authService.getLegalTerms(type);
    }
}
