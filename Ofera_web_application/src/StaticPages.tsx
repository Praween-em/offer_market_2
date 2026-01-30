import React from 'react';
import { Mail, MapPin, Phone, Shield, FileText, Cookie } from 'lucide-react';

const PageLayout = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
    <div className="container" style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            {Icon && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--surface)', borderRadius: '50%' }}>
                    <Icon size={40} color="var(--primary)" />
                </div>
            </div>}
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>{title}</h1>
            <div style={{ width: '60px', height: '4px', background: 'var(--primary)', margin: '0 auto', borderRadius: '2px' }}></div>
        </div>
        <div style={{ lineHeight: '1.8', color: 'var(--text)', fontSize: '16px' }}>
            {children}
        </div>
    </div>
);

export const AboutPage = () => (
    <PageLayout title="About Us" icon={Shield}>
        <p style={{ marginBottom: '16px' }}>
            Welcome to <strong>Ofera</strong>, your ultimate destination for discovering the best local offers, deals, and discounts.
            We are passionate about connecting smart shoppers with their favorite local businesses, creating a win-win ecosystem for everyone.
        </p>
        <p style={{ marginBottom: '16px' }}>
            Our mission is simple: to make shopping more rewarding. Whether you're looking for the hottest fashion trends,
            delicious dining experiences, or essential services, Ofera brings the best deals right to your fingertips.
        </p>
        <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '24px 0 12px' }}>Why Choose Ofera?</h3>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', marginBottom: '24px' }}>
            <li><strong>Local Focus:</strong> We prioritize neighborhood gems and local favorites.</li>
            <li><strong>Verified Deals:</strong> All offers are verified to ensure you get exactly what you see.</li>
            <li><strong>Simplicity:</strong> A clean, easy-to-use interface designed for seamless discovery.</li>
        </ul>
    </PageLayout>
);

export const CareersPage = () => (
    <PageLayout title="Careers" icon={FileText}>
        <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '32px' }}>
            Join us in revolutionizing the local commerce experience!
        </p>
        <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>We are hiring!</h3>
            <p style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>
                We are always looking for talented individuals to join our team.
                If you are passionate about technology, design, or marketing, we'd love to hear from you.
            </p>
            <button style={{
                padding: '12px 24px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
            }}>
                View Open Positions
            </button>
        </div>
    </PageLayout>
);

export const ContactPage = () => (
    <PageLayout title="Contact Us" icon={Mail}>
        <p style={{ textAlign: 'center', marginBottom: '40px' }}>
            Have questions, feedback, or just want to say hello? We'd love to hear from you.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                <Mail size={32} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Email Us</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 600 }}>support@ofera.com</p>
            </div>

            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                <Phone size={32} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Call Us</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 600 }}>+91 123 456 7890</p>
            </div>

            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                <MapPin size={32} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
                <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Visit Us</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    123 Tech Park, Innovation Street<br />
                    Bangalore, India 560001
                </p>
            </div>
        </div>
    </PageLayout>
);

export const PrivacyPolicyPage = () => (
    <PageLayout title="Privacy Policy" icon={Shield}>
        <p style={{ fontStyle: 'italic', marginBottom: '24px', color: 'var(--text-muted)' }}>Last updated: January 2026</p>
        <p style={{ marginBottom: '16px' }}>
            At Ofera, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>1. Information We Collect</h3>
        <p style={{ marginBottom: '16px' }}>
            We collect information you provide directly to us, such as when you create an account, update your profile, or claim an offer.
            This may include your name, email address, phone number, and location data.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>2. How We Use Your Information</h3>
        <p style={{ marginBottom: '16px' }}>
            We use your information to provide, maintain, and improve our services. This includes personalizing offers based on your location
            and preferences, communicating with you about updates, and detecting fraud.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>3. Data Security</h3>
        <p style={{ marginBottom: '16px' }}>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access,
            alteration, disclosure, or destruction.
        </p>
    </PageLayout>
);

export const TermsPage = () => (
    <PageLayout title="Terms of Service" icon={FileText}>
        <p style={{ fontStyle: 'italic', marginBottom: '24px', color: 'var(--text-muted)' }}>Last updated: January 2026</p>
        <p style={{ marginBottom: '16px' }}>
            Please read these Terms of Service carefully before using the Ofera platform. By accessing or using our services,
            you agree to be bound by these terms.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>1. Acceptance of Terms</h3>
        <p style={{ marginBottom: '16px' }}>
            By accessing or using Ofera, you agree to be legally bound by these Terms and all terms, policies, and guidelines incorporated by reference.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>2. Use of Services</h3>
        <p style={{ marginBottom: '16px' }}>
            You are responsible for your use of the services and for any content you provide. You must use the services in compliance
            with all applicable local, state, national, and international laws, rules, and regulations.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>3. Offer Redemption</h3>
        <p style={{ marginBottom: '16px' }}>
            Offers are subject to availability and the specific terms set by the merchant. Ofera is not responsible for the redemption
            process or the quality of goods/services provided by the merchant.
        </p>
    </PageLayout>
);

export const CookiePolicyPage = () => (
    <PageLayout title="Cookie Policy" icon={Cookie}>
        <p style={{ marginBottom: '16px' }}>
            Ofera uses cookies and similar technologies to help provide, protect, and improve the Ofera Platform.
            This policy explains how and why we use these technologies and the choices you have.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>What are cookies?</h3>
        <p style={{ marginBottom: '16px' }}>
            Cookies are small text files that are stored on your browser or device by websites, apps, online media, and advertisements.
            There are different types of cookies, such as session cookies (which expire when you close your browser) and persistent cookies.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '24px 0 12px' }}>How we use cookies</h3>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', marginBottom: '24px' }}>
            <li><strong>Authentication:</strong> To tell us when you are logged in.</li>
            <li><strong>Security:</strong> To keep your account, data, and the Ofera Platform safe and secure.</li>
            <li><strong>Preferences:</strong> To remember your settings and preferences.</li>
            <li><strong>Analytics:</strong> To understand how people use our services.</li>
        </ul>
    </PageLayout>
);
