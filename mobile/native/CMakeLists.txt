cmake_minimum_required(VERSION 3.13)

# Project name MUST be "appmodules" — CMake creates lib<name>.so, so this
# produces libappmodules.so which React Native New Architecture requires to
# register TurboModules (including PlatformConstants, etc.).
project(appmodules)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Path to ReactAndroid: one level up from native/ brings us to the mobile/
# workspace root, then into node_modules.
set(REACT_ANDROID_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../node_modules/react-native/ReactAndroid)

# Include React Native's application CMake. This:
#   - Builds libappmodules.so (required for TurboModules / New Architecture)
#   - Links in JSI, Fabric, fbjni, and all autolinked 3rd-party native modules
#   - Globs *.cpp in CMAKE_CURRENT_SOURCE_DIR — bridge files live in src/ to
#     avoid being picked up here.
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

# ── Custom PDF native bridge ─────────────────────────────────────────────────
# Separate shared library loaded by the Java layer via System.loadLibrary().
# QPDF and MuPDF prebuilt .so files will be linked here in Phase 3.
add_library(
        pdfpowertools_native
        SHARED
        src/qpdf_bridge.cpp
        src/mupdf_bridge.cpp
)

find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(
        pdfpowertools_native
        ${log-lib}
        ${android-lib}
        # qpdf   # Phase 3
        # mupdf  # Phase 3
)
