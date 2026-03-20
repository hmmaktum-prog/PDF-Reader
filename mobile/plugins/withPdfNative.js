const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withPdfNative(config) {
  return withAppBuildGradle(config, async (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*\{/,
        `android {
    externalNativeBuild {
        cmake {
            path "../../native/CMakeLists.txt"
        }
    }`
      );
    }
    return config;
  });
};
