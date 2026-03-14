declare module '@msg91comm/sendotp-react-native' {
    interface SendOTPOptions {
        [key: string]: any;
    }

    interface OTPResponse {
        [key: string]: any;
    }

    export function sendOTP(options: SendOTPOptions): Promise<OTPResponse>;
    export function verifyOTP(options: SendOTPOptions): Promise<OTPResponse>;
    export function retryOTP(options: SendOTPOptions): Promise<OTPResponse>;

    const SendOTPScreen: React.ComponentType<any>;
    export default SendOTPScreen;
}
