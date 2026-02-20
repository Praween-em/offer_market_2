-- Insert legal terms for Sahayaq User App
INSERT INTO "public"."consent_notices" ("id", "type", "version", "content", "is_active", "created_at")
VALUES (
    gen_random_uuid(),
    'SAHAYAQ_USER_TERMS',
    '1.0',
    '## 1. Liability Exemption
Sahayaq is a matchmaking platform. We are not responsible for any problems, damages, or dissatisfaction caused by service providers. Users are completely liable for their own hiring choices.

## 2. No Guarantee of Quality
We verify the basic identity of providers, but we DO NOT guarantee their experience, qualifications, or the quality/completion of their workmanship.

## 3. Safety & Accidents
Sahayaq is strictly a connection tool. We are not responsible for any accidents, injuries, property damage, or serious incidents (including death) caused in any way by a provider you hire. Users must exercise their own discretion, vigilance, and caution.

## 4. Data Handling (DPDP Act)
To connect you with a provider, your name, phone number, and service request details will be shared with up to three local service providers. Your data is collected and processed under the guidelines of the Indian DPDP Act strictly for the purpose of fulfilling your requested service.

## 5. Harassment & Disputes
Any harassment or serious issues caused by a provider after obtaining your information from the app are individual actions of the provider. The app takes no liability for off-platform interactions or disputes.',
    true,
    now()
) ON CONFLICT ("type", "version") DO NOTHING;

-- Insert legal terms for Services App (Provider)
INSERT INTO "public"."consent_notices" ("id", "type", "version", "content", "is_active", "created_at")
VALUES (
    gen_random_uuid(),
    'SAHAYAQ_PROVIDER_TERMS',
    '1.0',
    '## 1. Liability Exemption
Sahayaq acts solely as a discovery platform and connection facilitator. We assume absolutely no liability for any actions, behavior, or damages caused by users you interact with. You are completely liable for your own actions and services rendered.

## 2. No Guarantee of Work
We do not guarantee service completion, payment, or consistent leads. Your identity verification does not explicitly endorse your workmanship or guarantee you customers.

## 3. Safety & Accidents
We are not responsible for any accidents, injuries, or serious incidents (including death) that occur during or after a service connection made through this app. Providers must exercise their own situational awareness and caution.

## 4. Data Handling (Data Processor)
Under the Indian DPDP Act, as a Data Processor, you receive user contact details solely for fulfilling the requested service. You must strictly use this data only for the requested service and must not use it for marketing, harassment, or share it with any third parties.

## 5. Harassment & Disputes
Any disputes, harassment, or serious issues arising from contact initiated on this platform are the individual responsibility of the parties involved. Sahayaq takes no part and claims no liability. Any severe issues caused by users to providers, or providers to users, are complete individual actions. 

## 6. Advertising (Ad-Gates)
The platform uses third-party advertising to keep lead unlocks free. Anonymous identifiers may be used by these ad networks in compliance with relevant data laws. No sensitive tracking data is exposed.

## 7. Service Rules & Onboarding
By verifying your identity and onboarding, you agree to fulfill accepted requests professionally, never mislead users, and handle all user data securely in accordance with Indian IT and DPDP Act regulations.',
    true,
    now()
) ON CONFLICT ("type", "version") DO NOTHING;
