cmake_minimum_required(VERSION 3.13)

# Project name MUST be "appmodules" — CMake creates lib<name>.so, and React
# Native New Architecture requires libappmodules.so to register TurboModules
# (including PlatformConstants, DevSettings, etc.).
project(appmodules)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# ── Locate ReactAndroid cmake utilities ──────────────────────────────────────
# REACT_ANDROID_DIR is injected by Gradle via cmake arguments (see withPdfNdk.js).
# The fallback handles local IDE / non-EAS environments where the variable may
# not be passed.  pnpm stores packages behind a content-addressed symlink, so
# using CMAKE_CURRENT_SOURCE_DIR (= native/) and going up one level to the
# workspace root, then into node_modules/react-native, is reliable in both
# environments because pnpm always creates a symlink at that location.
if(NOT DEFINED REACT_ANDROID_DIR OR REACT_ANDROID_DIR STREQUAL "")
  set(REACT_ANDROID_DIR
      "${CMAKE_CURRENT_SOURCE_DIR}/../node_modules/react-native/ReactAndroid")
endif()

message(STATUS "REACT_ANDROID_DIR = ${REACT_ANDROID_DIR}")
message(STATUS "PROJECT_BUILD_DIR  = ${PROJECT_BUILD_DIR}")

# ── Build libappmodules.so (New Architecture requirement) ────────────────────
# ReactNative-application.cmake sets up the appmodules target, links all
# autolinked TurboModules, and registers core platform constants.
include("${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake")

# ── Custom PDF native bridge (stub — QPDF/MuPDF linked in Phase 3) ──────────
add_library(
    pdfpowertools_native
    SHARED
    "${CMAKE_CURRENT_SOURCE_DIR}/src/qpdf_bridge.cpp"
    "${CMAKE_CURRENT_SOURCE_DIR}/src/mupdf_bridge.cpp"
)

find_library(log-lib  log)
find_library(android-lib android)

target_include_directories(pdfpowertools_native PRIVATE
    "${CMAKE_CURRENT_SOURCE_DIR}/src"
)

target_link_libraries(
    pdfpowertools_native
    ${log-lib}
    ${android-lib}
    # qpdf   # Phase 3 — add prebuilt .so
    # mupdf  # Phase 3 — add prebuilt .so
)
