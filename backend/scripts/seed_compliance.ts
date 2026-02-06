
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding initial consent notices...');

    const notices = [
        {
            type: 'ONBOARDING',
            version: '1.0',
            content: 'I agree to the Terms of Service and Privacy Policy, and I understand my data will be processed according to the 2026 Data Protection regulations.'
        },
        {
            type: 'LEAD_REVEAL',
            version: '1.0',
            content: 'I consent to revealing my contact information to this service provider. I understand they may contact me regarding my request.'
        },
        {
            type: 'OKYC_VERIFY',
            version: '1.0',
            content: 'I authorize the use of my Aadhaar metadata for identity verification purposes only as per DPDP 2026 guidelines.'
        }
    ];

    for (const notice of notices) {
        await prisma.consent_notices.upsert({
            where: {
                type_version: {
                    type: notice.type,
                    version: notice.version
                }
            },
            update: {
                content: notice.content,
                is_active: true
            },
            create: {
                type: notice.type,
                version: notice.version,
                content: notice.content,
                is_active: true
            }
        });
        console.log(`Notice ${notice.type} v${notice.version} upserted.`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
