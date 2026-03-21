/**
 * withPdfNdk.js — Expo Config Plugin
 *
 * Configures the Android Gradle project to build our custom native library
 * (libappmodules.so + libpdfpowertools_native.so) via CMake.
 *
 * React Native 0.76+ (New Architecture) requires libappmodules.so to be built
 * by a CMakeLists.txt whose project() name is "appmodules".  Expo's prebuild
 * template already emits an externalNativeBuild block pointing to the
 * generated `src/main/jni/CMakeLists.txt`.  This plugin REPLACES that path
 * with our own CMakeLists.txt (native/CMakeLists.txt) which:
 *   1. includes ReactNative-application.cmake → builds libappmodules.so
 *   2. adds our pdfpowertools_native shared library
 *
 * Key cmake arguments injected:
 *   REACT_ANDROID_DIR    — absolute path to ReactAndroid/ inside node_modules
 *                          (avoids pnpm symlink fragility inside CMake)
 *   PROJECT_BUILD_DIR    — where Gradle writes generated autolinking/codegen
 *                          files that ReactNative-application.cmake reads
 *   ANDROID_STL          — must be c++_shared for React Native
 */

const { withAppBuildGradle, createRunOncePlugin } = require('@expo/config-plugins');
const pkg = require('../package.json');

const CMAKE_PATH = '../../native/CMakeLists.txt';
const CMAKE_VERSION = '3.18.1+';

const withCustomNativeBuild = (config) => {
  config = withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;
    const isKts = cfg.modResults.language === 'kotlin';

    // -----------------------------------------------------------------
    // Guard: skip if our path is already present (idempotent)
    // -----------------------------------------------------------------
    if (contents.includes(CMAKE_PATH)) {
      return cfg;
    }

    // cmake argument block — injected into defaultConfig { externalNativeBuild { cmake { ... } } }
    const cmakeArgs = isKts
      ? `cppFlags += "-std=c++20"
                abiFilters += listOf("arm64-v8a", "x86_64")
                arguments += listOf(
                    "-DANDROID_STL=c++_shared",
                    "-DPROJECT_BUILD_DIR=\${projectDir}/build",
                    "-DREACT_ANDROID_DIR=\${rootProject.projectDir}/../node_modules/react-native/ReactAndroid",
                    "-DREACT_ANDROID_BUILD_DIR=\${rootProject.projectDir}/../node_modules/react-native/ReactAndroid/build"
                )`
      : `cppFlags "-std=c++20"
                abiFilters "arm64-v8a", "x86_64"
                arguments "-DANDROID_STL=c++_shared",
                          "-DPROJECT_BUILD_DIR=\${projectDir}/build",
                          "-DREACT_ANDROID_DIR=\${rootProject.projectDir}/../node_modules/react-native/ReactAndroid",
                          "-DREACT_ANDROID_BUILD_DIR=\${rootProject.projectDir}/../node_modules/react-native/ReactAndroid/build"`;

    // -----------------------------------------------------------------
    // Case A: externalNativeBuild already present (RN 0.76 template)
    //   → replace only the cmake path; inject cmake args into defaultConfig
    // -----------------------------------------------------------------
    if (contents.includes('externalNativeBuild')) {
      // Replace the cmake path inside the top-level externalNativeBuild block
      // Matches both groovy and kotlin syntax variants
      contents = contents.replace(
        /(externalNativeBuild\s*\{[^}]*cmake\s*\{[^}]*)path\s*[=]?\s*["']?([^"'\s}]+)["']?/,
        `$1path ${isKts ? '= ' : ''}"${CMAKE_PATH}"\n            version ${isKts ? '= ' : ''}"${CMAKE_VERSION}"`
      );

      // Inject cmake args into defaultConfig.externalNativeBuild.cmake if not present
      if (!contents.includes('REACT_ANDROID_DIR')) {
        if (isKts) {
          contents = contents.replace(
            /defaultConfig\s*\{/,
            `defaultConfig {
        externalNativeBuild {
            cmake {
                ${cmakeArgs}
            }
        }`
          );
        } else {
          contents = contents.replace(
            /defaultConfig\s*\{/,
            `defaultConfig {
        externalNativeBuild {
            cmake {
                ${cmakeArgs}
            }
        }`
          );
        }
      }

      cfg.modResults.contents = contents;
      return cfg;
    }

    // -----------------------------------------------------------------
    // Case B: no externalNativeBuild yet — insert full block
    // -----------------------------------------------------------------
    if (isKts) {
      contents = contents.replace(
        /android\s*\{/,
        `android {
    externalNativeBuild {
        cmake {
            path = "${CMAKE_PATH}"
            version = "${CMAKE_VERSION}"
        }
    }
    defaultConfig {
        externalNativeBuild {
            cmake {
                ${cmakeArgs}
            }
        }
    }`
      );
    } else {
      contents = contents.replace(
        /android\s*\{/,
        `android {
    externalNativeBuild {
        cmake {
            path "${CMAKE_PATH}"
            version "${CMAKE_VERSION}"
        }
    }
    defaultConfig {
        externalNativeBuild {
            cmake {
                ${cmakeArgs}
            }
        }
    }`
      );
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
};

module.exports = createRunOncePlugin(withCustomNativeBuild, pkg.name, pkg.version);
