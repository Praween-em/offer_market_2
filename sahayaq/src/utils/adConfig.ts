import { TestIds } from 'react-native-google-mobile-ads';

/**
 * ADMOB CONFIGURATION
 * 
 * To move to production:
 * 1. Set IS_PRODUCTION to true.
 * 2. Replace the placeholder IDs below with your actual IDs from AdMob Console.
 */
const IS_PRODUCTION = true;

export const AD_IDS = {
    // Found in AdMob Console under "App Settings"
    APP_ID: 'ca-app-pub-5362340568713961~7865588398',

    // Unit IDs for different screens
    BANNER_HOME: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/2611361906' // YOUR PRODUCTION BANNER ID
        : TestIds.BANNER,

    BANNER_MY_REQUESTS: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/6802722508' // YOUR PRODUCTION BANNER ID
        : TestIds.BANNER,

    INTERSTITIAL: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/9477954908' // PLACEHOLDER
        : TestIds.INTERSTITIAL,

    REWARDED: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/6530425611' // PLACEHOLDER
        : TestIds.REWARDED,

    REWARDED_INTERSTITIAL: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/9477954908' // PLACEHOLDER
        : TestIds.REWARDED_INTERSTITIAL,

    NATIVE: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/4496256818' // PLACEHOLDER
        : TestIds.ADAPTIVE_BANNER,
};
