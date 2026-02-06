
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CashfreeService {
    private readonly baseUrl = 'https://api.cashfree.com/verification';
    private readonly clientId: string;
    private readonly clientSecret: string;

    constructor(private configService: ConfigService) {
        this.clientId = this.configService.get<string>('CASHFREE_CLIENT_ID') || '';
        this.clientSecret = this.configService.get<string>('CASHFREE_CLIENT_SECRET') || '';

        // Use sandbox by default if no production keys are found
    }

    private getHeaders() {
        return {
            'x-client-id': this.clientId,
            'x-client-secret': this.clientSecret,
            'Content-Type': 'application/json',
        };
    }

    async initiateAadhaarOtp(aadhaarNumber: string) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/offline-aadhaar/otp`,
                { aadhaar_number: aadhaarNumber },
                { headers: this.getHeaders() }
            );

            if (response.data.status !== 'SUCCESS') {
                throw new BadRequestException(response.data.message || 'Failed to initiate Aadhaar OTP');
            }

            return {
                client_id: response.data.ref_id, // Cashfree calls it ref_id
                message: 'OTP sent successfully to registered mobile number'
            };
        } catch (error: any) {
            console.error('Cashfree Aadhaar OTP Error:', error.response?.data || error.message);
            throw new BadRequestException(error.response?.data?.message || 'Cashfree API Error');
        }
    }

    async verifyAadhaarOtp(otp: string, refId: string) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/offline-aadhaar/verify`,
                { otp, ref_id: refId },
                { headers: this.getHeaders() }
            );

            if (response.data.status !== 'SUCCESS') {
                throw new BadRequestException(response.data.message || 'Aadhaar Verification Failed');
            }

            // Cashfree returns structured demographic data
            return response.data;
        } catch (error: any) {
            console.error('Cashfree Aadhaar Verify Error:', error.response?.data || error.message);
            throw new BadRequestException(error.response?.data?.message || 'Cashfree API Error');
        }
    }
}
