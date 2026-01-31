
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive services seeding...');

    // 1. Clear existing service data to avoid duplicates during preview
    // Note: Due to foreign keys, order matters.
    await prisma.service_leads.deleteMany({});
    await prisma.service_portfolios.deleteMany({});
    await prisma.services.deleteMany({});
    await prisma.service_providers.deleteMany({});
    await prisma.service_categories.deleteMany({});

    console.log('🧹 Cleaned existing service tables.');

    // 2. Create Category Hierarchy
    const categoriesData = [
        {
            name: 'Home Maintenance',
            icon: 'tools',
            description: 'Expert fixes for your home and appliances',
            sub: [
                { name: 'Electricians', icon: 'flash', description: 'Wiring, switchboards, and appliance installation' },
                { name: 'Plumbers', icon: 'water-pump', description: 'Leaking pipes, taps, and bathroom fittings' },
                { name: 'Carpenters', icon: 'hammer', description: 'Furniture repair and assembly' },
                { name: 'AC Service & Repair', icon: 'air-conditioner', description: 'Gas refill, cleaning and repairs' },
            ],
        },
        {
            name: 'Cleaning & Hygiene',
            icon: 'sparkles',
            description: 'Professional cleaning for a healthier home',
            sub: [
                { name: 'Full Home Cleaning', icon: 'home-search', description: 'Deep cleaning and sanitization' },
                { name: 'Pest Control', icon: 'bug-stop', description: 'Treatment for cockroaches, termites, etc.' },
                { name: 'Kitchen & Bathroom', icon: 'liquid-spot', description: 'Stain removal and deep scrub' },
            ],
        },
        {
            name: 'Personal Care',
            icon: 'face-woman',
            description: 'Salon and wellness services at your doorstep',
            sub: [
                { name: 'Salon for Women', icon: 'bottle-tonic-plus', description: 'Facials, waxing, and hair styling' },
                { name: 'Men\'s Grooming', icon: 'content-cut', description: 'Haircut, beard trim, and massage' },
                { name: 'Massage Therapy', icon: 'spa', description: 'Relaxing body massage' },
            ],
        },
        {
            name: 'Professional Experts',
            icon: 'briefcase',
            description: 'Consultants for your legal and financial needs',
            sub: [
                { name: 'CA & Tax Filing', icon: 'calculator', description: 'Income tax, GST, and accounting' },
                { name: 'Legal Consultant', icon: 'gavel', description: 'Property, civil, and legal advice' },
                { name: 'Digital Marketing', icon: 'bullhorn', description: 'SEO, Ads, and Social Media' },
            ],
        },
    ];

    const categoryMap: Record<string, string> = {};

    for (const root of categoriesData) {
        const createdRoot = await prisma.service_categories.create({
            data: {
                name: root.name,
                icon: root.icon,
                description: root.description,
            },
        });
        categoryMap[root.name] = createdRoot.id;

        for (const sub of root.sub) {
            const createdSub = await prisma.service_categories.create({
                data: {
                    name: sub.name,
                    icon: sub.icon,
                    description: sub.description,
                    parent_id: createdRoot.id,
                },
            });
            categoryMap[sub.name] = createdSub.id;
        }
    }

    console.log('✅ Created category hierarchy.');

    // 3. Helper to create providers
    const createProvider = async (data: {
        phone: string;
        name: string;
        category: string;
        exp: number;
        price: number;
        area: string;
        bio: string;
        portfolioUrls: string[];
        services: { title: string; price: number }[];
    }) => {
        // Create/Update User
        const user = await prisma.users.upsert({
            where: { phone: data.phone },
            update: { role: 'service_provider', display_name: data.name },
            create: {
                phone: data.phone,
                display_name: data.name,
                role: 'service_provider',
                profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
            },
        });

        // Create Provider
        const provider = await prisma.service_providers.create({
            data: {
                user_id: user.id,
                category_id: categoryMap[data.category],
                display_name: data.name,
                experience_years: data.exp,
                starting_price: data.price,
                service_area: data.area,
                bio: data.bio,
                is_verified: Math.random() > 0.3,
                whatsapp_number: data.phone,
            },
        });

        // Add Services
        for (const s of data.services) {
            await prisma.services.create({
                data: {
                    provider_id: provider.id,
                    title: s.title,
                    price: s.price,
                },
            });
        }

        // Add Portfolio
        for (let i = 0; i < data.portfolioUrls.length; i++) {
            await prisma.service_portfolios.create({
                data: {
                    provider_id: provider.id,
                    image_url: data.portfolioUrls[i],
                    display_order: i,
                },
            });
        }

        return provider;
    };

    // 4. Seed Providers Data
    const providers = [
        {
            phone: '9000012341',
            name: 'Rajesh Electricals',
            category: 'Electricians',
            exp: 15,
            price: 199,
            area: 'Malviya Nagar, Delhi',
            bio: 'Certified A-grade electrician with 15 years of experience in residential and commercial wiring.',
            portfolioUrls: ['https://placehold.co/600x400?text=Wiring+Project', 'https://placehold.co/600x400?text=Panel+Board'],
            services: [{ title: 'Switchboard Repair', price: 199 }, { title: 'Full House Wiring', price: 5000 }],
        },
        {
            phone: '9000012342',
            name: 'Pristine Cleaners',
            category: 'Full Home Cleaning',
            exp: 6,
            price: 2499,
            area: 'HSR Layout, Bangalore',
            bio: 'Eco-friendly deep cleaning experts using imported chemicals and high-tech equipment.',
            portfolioUrls: ['https://placehold.co/600x400?text=Sparkling+Kitchen', 'https://placehold.co/600x400?text=Deep+Cleaned+Sofa'],
            services: [{ title: '3BHK Deep Cleaning', price: 4999 }, { title: 'Kitchen Scrubbing', price: 1299 }],
        },
        {
            phone: '9000012343',
            name: 'Amina Bridal Studio',
            category: 'Salon for Women',
            exp: 8,
            price: 999,
            area: 'Andheri West, Mumbai',
            bio: 'Bridal specialist providing premium salon services at your home. L\'Oreal certified professional.',
            portfolioUrls: ['https://placehold.co/600x400?text=Bridal+Makeup', 'https://placehold.co/600x400?text=Hair+Styling'],
            services: [{ title: 'Hydra Facial', price: 2999 }, { title: 'Waxing & Threading', price: 999 }],
        },
        {
            phone: '9000012344',
            name: 'CA Alok & Associates',
            category: 'CA & Tax Filing',
            exp: 10,
            price: 499,
            area: 'Sector 44, Gurgaon',
            bio: 'Expert Chartered Accountants specializing in Income Tax filing and GST compliance for small businesses.',
            portfolioUrls: ['https://placehold.co/600x400?text=Tax+Consultation', 'https://placehold.co/600x400?text=GST+Audit'],
            services: [{ title: 'ITR Filing - Individual', price: 999 }, { title: 'GST Registration', price: 1999 }],
        },
        {
            phone: '9000012345',
            name: 'Perfect Plumbers',
            category: 'Plumbers',
            exp: 12,
            price: 149,
            area: 'Salt Lake, Kolkata',
            bio: 'Reliable plumbing services for all your pipe leaks, tap fixes, and tank cleanings.',
            portfolioUrls: ['https://placehold.co/600x400?text=Pipe+Fix', 'https://placehold.co/600x400?text=Tank+Cleaning'],
            services: [{ title: 'Tap Replacement', price: 149 }, { title: 'Pipeline Unclogging', price: 499 }],
        },
        {
            phone: '9000012346',
            name: 'Zen Wellness Spa',
            category: 'Massage Therapy',
            exp: 5,
            price: 1499,
            area: 'Banjara Hills, Hyderabad',
            bio: 'Rejuvenate your body and mind with our professional Swedish and Thai massage therapies at home.',
            portfolioUrls: ['https://placehold.co/600x400?text=Swedish+Massage', 'https://placehold.co/600x400?text=Aromatherapy'],
            services: [{ title: 'Swedish Massage (60 min)', price: 1599 }, { title: 'Deep Tissue Relief', price: 2199 }],
        },
    ];

    for (const p of providers) {
        await createProvider(p);
    }

    console.log('✅ Services seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
