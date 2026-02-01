import { Injectable, BadRequestException } from '@nestjs/common';
const Jimp = require('jimp');
import jsQR from 'jsqr';
import * as zlib from 'zlib';
import * as crypto from 'crypto';

@Injectable()
export class AadhaarService {
    // UIDAI Public Key (Placeholder - needs the actual PEM content)
    private readonly UIDAI_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvC6A6V7...
-----END PUBLIC KEY-----`;

    async verifyAadhaarQR(fileBuffer: Buffer): Promise<any> {
        try {
            // 1. Extract QR Data from Image
            const rawQRData = await this.extractQRFromImage(fileBuffer);
            if (!rawQRData) {
                throw new BadRequestException('QR code not found in image');
            }

            // 2. Decode Secure QR Logic (Base10 -> BigInt -> Byte Array -> Gzip Decompress)
            const decodedData = await this.parseSecureQR(rawQRData);

            // 3. Verify Signature
            const isSignatureValid = this.verifySignature(decodedData.signedData, decodedData.signature);
            if (!isSignatureValid) {
                throw new BadRequestException('Invalid Aadhaar digital signature');
            }

            return decodedData.data;
        } catch (error) {
            console.error('Aadhaar verification error:', error);
            throw new BadRequestException(error.message || 'Failed to verify Aadhaar');
        }
    }

    private async extractQRFromImage(fileBuffer: Buffer): Promise<string | null> {
        const image = await Jimp.read(fileBuffer);
        const { data, width, height } = image.bitmap;
        const code = jsQR(new Uint8ClampedArray(data), width, height);
        return code ? code.data : null;
    }

    private async parseSecureQR(qrData: string): Promise<any> {
        // Implementation of UIDAI Secure QR V3 Parsing
        // This involves Gzip decompression and field mapping
        // Placeholder for the actual byte-shifting logic

        // Example structure for V3:
        // [Data...] + [256 bytes signature]

        try {
            // Convert Base10 string to Buffer (V3 format)
            const bigIntData = BigInt(qrData);
            let buffer = this.bigIntToBuffer(bigIntData);

            // Decompress using Gzip
            const decompressed = zlib.gunzipSync(buffer);

            // Extract Signature (last 256 bytes)
            const signature = decompressed.slice(-256);
            const signedData = decompressed.slice(0, -256);

            // Parse Demographic Fields (V3 uses fixed delimiters or length-based)
            // This is a simplified version
            const dataFields = this.extractFields(signedData);

            return {
                data: dataFields,
                signature,
                signedData
            };
        } catch (e) {
            throw new Error('Failed to parse secure QR data');
        }
    }

    private bigIntToBuffer(bigint: bigint): Buffer {
        let hex = bigint.toString(16);
        if (hex.length % 2) hex = '0' + hex;
        return Buffer.from(hex, 'hex');
    }

    private extractFields(buffer: Buffer): any {
        // UIDAI V3 mapping logic
        // Fields are separated by delimiters (usually 255)
        // Order: VTC, Street, Landmark, House, Locality, PO, Dist, State, PC, Gender, DOB, Name, etc.

        const fields: string[] = [];
        let start = 0;
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === 255) {
                fields.push(buffer.slice(start, i).toString('utf8'));
                start = i + 1;
            }
        }

        // This is a heuristic mapping, actual V3 has a specific field count
        return {
            name: fields[fields.length - 1], // Just an example
            dob: fields[fields.length - 2],
            gender: fields[fields.length - 3],
        };
    }

    private verifySignature(data: Buffer, signature: Buffer): boolean {
        const verify = crypto.createVerify('SHA256');
        verify.update(data);
        return verify.verify(this.UIDAI_PUBLIC_KEY, signature);
    }
}
