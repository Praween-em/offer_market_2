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
    APP_ID: 'ca-app-pub-5362340568713961~5447095613',

    // Unit IDs for different screens
    BANNER_HOME: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/7191891314' // YOUR PRODUCTION BANNER ID
        : TestIds.BANNER,

    BANNER_MY_REQUESTS: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/7191891314' // YOUR PRODUCTION BANNER ID
        : TestIds.BANNER,

    INTERSTITIAL: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/1896281697' // PLACEHOLDER
        : TestIds.INTERSTITIAL,

    REWARDED: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/5188075314' // PLACEHOLDER
        : TestIds.REWARDED,

    REWARDED_INTERSTITIAL: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/8374779346' // PLACEHOLDER
        : TestIds.REWARDED_INTERSTITIAL,

    NATIVE: IS_PRODUCTION
        ? 'ca-app-pub-5362340568713961/6437577804' // PLACEHOLDER
        : TestIds.ADAPTIVE_BANNER,
};
