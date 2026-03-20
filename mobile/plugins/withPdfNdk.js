const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const pkg = require('./package.json');

/**
 * Adds CMake external native build configuration to android/app/build.gradle.
 * CMake path is relative to android/app/ → ../../native/CMakeLists.txt
 */
const withCustomNativeBuild = (config) => {
  config = withAppBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('externalNativeBuild')) {
      if (cfg.modResults.language === 'groovy') {
        cfg.modResults.contents = cfg.modResults.contents.replace(
          /android\s*\{/,
          `android {
    externalNativeBuild {
        cmake {
            path "../../native/CMakeLists.txt"
            version "3.18.1+"
        }
    }
    defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags "-std=c++17"
                abiFilters "arm64-v8a", "x86_64"
            }
        }
    }`
        );
      } else {
        cfg.modResults.contents = cfg.modResults.contents.replace(
          /android\s*\{/,
          `android {
    externalNativeBuild {
        cmake {
            path = "../../native/CMakeLists.txt"
            version = "3.18.1+"
        }
    }
    defaultConfig {
        externalNativeBuild {
            cmake {
                cppFlags += "-std=c++17"
                abiFilters += listOf("arm64-v8a", "x86_64")
            }
        }
    }`
        );
      }
    }
    return cfg;
  });

  return config;
};

module.exports = createRunOncePlugin(withCustomNativeBuild, pkg.name, pkg.version);
