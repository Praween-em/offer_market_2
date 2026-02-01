import { Injectable, BadRequestException } from '@nestjs/common';
import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import * as zlib from 'zlib';
import * as crypto from 'crypto';

@Injectable()
export class AadhaarService {
    // UIDAI Public Key (Placeholder - needs the actual PEM content)
    private readonly UIDAI_PUBLIC_KEY = `-----BEGIN CERTIFICATE-----
MIIHbjCCBlagAwIBAgIEU2dtwjANBgkqhkiG9w0BAQsFADCB/DELMAkGA1UEBhMC
SU4xQTA/BgNVBAoTOEd1amFyYXQgTmFybWFkYSBWYWxsZXkgRmVydGlsaXplcnMg
YW5kIENoZW1pY2FscyBMaW1pdGVkMR0wGwYDVQQLExRDZXJ0aWZ5aW5nIEF1dGhv
cml0eTEPMA0GA1UEERMGMzgwMDU0MRAwDgYDVQQIEwdHdWphcmF0MSYwJAYDVQQJ
Ex1Cb2Rha2RldiwgUyBHIFJvYWQsIEFobWVkYWJhZDEcMBoGA1UEMxMTMzAxLCBH
TkZDIEluZm90b3dlcjEiMCAGA1UEAxMZKG4pQ29kZSBTb2x1dGlvbnMgQ0EgMjAx
NDAeFw0xNzA0MjcwNTMzMDFaFw0xOTA0MDkyMTE5MDVaMIHoMQswCQYDVQQGEwJJ
TjExMC8GA1UEChMoVU5JUVVFIElERU5USUZJQ0FUSU9OIEFVVEhPUklUWSBPRiBJ
TkRJQTEPMA0GA1UEERMGMTEwMDAxMQ4wDAYDVQQIEwVERUxISTEZMBcGA1UECRMQ
Q09OTkFVR0hUIENJUkNVUzExMC8GA1UEMxMoOVRIIEZMT09SIFRPV0VSIDEgSkVF
VkFOIEJIQVJUSSBCVUlMRElORzE3MDUGA1UEAxMuRFMgVU5JUVVFIElERU5USUZJ
Q0FUSU9OIEFVVEhPUklUWSBPRiBJTkRJQSAwMzCCASIwDQYJKoZIhvcNAQEBBQAD
ggEPADCCAQoCggEBAL1VPb8KX4uUMP+ym6hXkFiLvpqK2v5shgdna77WIPmFlOxn
6V4U2HngL2l5XxYq9Yz6CEC14FCGd0OghzxF2wHXU9/5Bd7RyGegNUaxWa9k/tFS
aZOkAI/JGMMjsFMGc70Bayk1eV7x/Alixogsu37DAaMKjaaDfpQVQ9Zr5zXJDhEN
lrXFjJ+ZMUVhqgAj0UJm4qGROhTyadGWsTvOMQN5eUz+fdKl4/Rtn/6sWjZrlJuP
z/Evk+oMYWZVnwVXh/WpdjEe+1XnThckZuPgGD1Mx6GO51WyQHSMThgOxztMHBw8
jDnilgLArsS3BNVgkhJy3g4mvydtUAlqyggZ1x8CAwEAAaOCAwgwggMEMA4GA1Ud
DwEB/wQEAwIGwDCCAQIGA1UdIASB+jCB9zCBhgYGYIJkZAICMHwwegYIKwYBBQUH
AgIwbgxsQ2xhc3MgMiBjZXJ0aWZpY2F0ZXMgYXJlIHVzZWQgZm9yIGZvcm0gc2ln
bmluZywgZm9ybSBhdXRoZW50aWNhdGlvbiBhbmQgc2lnbmluZyBvdGhlciBsb3cg
cmlzayB0cmFuc2FjdGlvbnMuMGwGBmCCZGQKATBiMGAGCCsGAQUFBwICMFQMUlRo
aXMgY2VydGlmaWNhdGUgcHJvdmlkZXMgaGlnaGVyIGxldmVsIG9mIGFzc3VyYW5j
ZSBmb3IgZG9jdW1lbnQgc2lnbmluZyBmdW5jdGlvbi4wggFuBgNVHR8EggFlMIIB
YTCCAR6gggEaoIIBFqSCARIwggEOMQswCQYDVQQGEwJJTjFBMD8GA1UEChM4R3Vq
YXJhdCBOYXJtYWRhIFZhbGxleSBGZXJ0aWxpemVycyBhbmQgQ2hlbWljYWxzIExp
bWl0ZWQxHTAbBgNVBAsTFENlcnRpZnlpbmcgQXV0aG9yaXR5MQ8wDQYDVQQREwYz
ODAwNTQxEDAOBgNVBAgTB0d1amFyYXQxJjAkBgNVBAkTHUJvZGFrZGV2LCBTIEcg
Um9hZCwgQWhtZWRhYmFkMRwwGgYDVQQzExMzMDEsIEdORkMgSW5mb3Rvd2VyMSIw
IAYDVQQDExkobilDb2RlIFNvbHV0aW9ucyBDQSAyMDE0MRAwDgYDVQQDEwdDUkwz
NTYxMD2gO6A5hjdodHRwczovL3d3dy5uY29kZXNvbHV0aW9ucy5jb20vcmVwb3Np
dG9yeS9uY29kZWNhMTQuY3JsMCsGA1UdEAQkMCKADzIwMTcwNDI3MDUzMzAxWoEP
MjAxOTA0MDkyMTE5MDVaMBMGA1UdIwQMMAqACE0HvvGenfu9MB0GA1UdDgQWBBSZ
N5Cc6fcvvOnkX6CWzOgsdUIY2jAZBgkqhkiG9n0HQQAEDDAKGwRWOC4xAwIDKDAN
BgkqhkiG9w0BAQsFAAOCAQEAAkGD0GQmTnjiSxHIvdpgw9OYiRtT5eZ/vf4EY3U8
pWDUTeWdBMUWozbY4ic1Z+KV8KlzKy7AJvDwrAX7a3tpCovnI7T83YEiOUxiYd5t
gS353EpEhA8BFG/IFRaTkUgs2AaU0L9G3+q4FEZFCmGM1EzsU0DgGnFUNKvCr0C7
fdMY/S9zNny2L84+Km807Nbk1voRc7uv/j1kprYSpSV7Bru++2v5iL+aOYq/hkGQ
Mr+7aekDj/As2OJW793WNdJ6Xx4hPQt5TYsS1UvL9Q6ykuIXd9njj/KjMsw1RvJ5
prvugdPqNOMpRf63zec3hTCKWm5YI7NBirwrBd1K14DVBQ==
-----END CERTIFICATE-----
`;

    async verifyAadhaarQR(fileBuffer: Buffer): Promise<any> {
        // Detect PDF and provide clear error
        if (fileBuffer.slice(0, 4).toString() === '%PDF') {
            throw new BadRequestException('Aadhaar PDF upload is not supported. Please upload an image (JPG/PNG).');
        }

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

        // Try 1: Original Image
        let code = this.scanQR(image);
        if (code) return code;

        // Try 2: Greyscale
        const greyscale = image.clone().greyscale();
        code = this.scanQR(greyscale);
        if (code) return code;

        // Try 3: High Contrast
        const highContrast = greyscale.clone().contrast(0.5);
        code = this.scanQR(highContrast);
        if (code) return code;

        // Try 4: Resized (Upscaled if small)
        if (image.bitmap.width < 1000) {
            const resized = image.clone().resize({ w: 1000 });
            code = this.scanQR(resized);
            if (code) return code;
        }

        return null;
    }

    private scanQR(image: any): string | null {
        try {
            const { data, width, height } = image.bitmap;
            const code = jsQR(new Uint8ClampedArray(data), width, height, {
                inversionAttempts: 'attemptBoth',
            });
            return code ? code.data : null;
        } catch (e) {
            return null;
        }
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
