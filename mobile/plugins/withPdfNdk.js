const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');

const pkg = require('../package.json');

/**
 * Injects the externalNativeBuild CMake configuration into android/app/build.gradle.
 *
 * The CMakeLists.txt at native/ is the single entry point for the Android native build.
 * It includes ReactNative-application.cmake (which produces libappmodules.so for the
 * New Architecture / TurboModules) AND builds our custom pdfpowertools_native library.
 *
 * Required cmake arguments passed here:
 *   PROJECT_BUILD_DIR — where Gradle writes generated autolinking/codegen files
 *   ANDROID_STL      — use the shared C++ runtime (required by React Native)
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
                arguments "-DPROJECT_BUILD_DIR=\${projectDir}/build",
                          "-DANDROID_STL=c++_shared"
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
                arguments += listOf(
                    "-DPROJECT_BUILD_DIR=\${projectDir}/build",
                    "-DANDROID_STL=c++_shared"
                )
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
