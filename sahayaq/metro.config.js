const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const path = require('path');
const config = {
    cacheStores: [
        new (require('metro-cache')).FileStore({
            root: path.resolve('D:/metro-cache'),
        }),
    ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
