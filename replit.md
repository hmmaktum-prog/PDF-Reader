# PDF Power Tools — Mobile App

React Native (Expo) Android app for offline PDF manipulation using NDK-backed C++ libraries.

## Architecture

- **Framework**: Expo 54 / React Native 0.81.5 (New Architecture / Bridgeless mode)
- **Routing**: Expo Router (file-based)
- **Workspace**: pnpm monorepo; app lives in `mobile/`

## Native Build (NDK)

`mobile/native/` contains the C++ layer:

| File | Purpose |
|---|---|
| `CMakeLists.txt` | Single CMake entry point for the Android native build |
| `src/qpdf_bridge.cpp` | JNI bridge for QPDF (merge, split, rotate, …) |
| `src/mupdf_bridge.cpp` | JNI bridge for MuPDF (render, grayscale, contrast, …) |

### CMake design (important)

The project name in `CMakeLists.txt` is **`appmodules`**, which produces `libappmodules.so`.  
React Native New Architecture **requires** `libappmodules.so` to exist — it contains the TurboModule registry (PlatformConstants and all core modules). Without it the app crashes immediately on startup.

The CMakeLists.txt therefore:
1. Sets `project(appmodules)`
2. Includes `ReactNative-application.cmake` from `node_modules/react-native/ReactAndroid/cmake-utils/` — this builds `libappmodules.so` with autolinking and codegen wired in
3. Separately builds `libpdfpowertools_native.so` from `src/*.cpp` — loaded by the Java Bridge classes via `System.loadLibrary("pdfpowertools_native")`

The bridge `.cpp` files live in `src/` (not the root `native/`) to prevent them from being accidentally globbed into `libappmodules.so` by `ReactNative-application.cmake`.

### Expo config plugin

`mobile/plugins/withPdfNdk.js` injects into `android/app/build.gradle`:
- `externalNativeBuild.cmake.path` → `../../native/CMakeLists.txt`
- `defaultConfig.externalNativeBuild.cmake.arguments` → `PROJECT_BUILD_DIR` and `ANDROID_STL=c++_shared` (required by ReactNative-application.cmake)

## Key Directories

```
mobile/
  app/            Expo Router screens + utils
    utils/
      nativeModules.ts   TypeScript wrappers for JNI bridge calls
  native/
    CMakeLists.txt
    src/
      qpdf_bridge.cpp
      mupdf_bridge.cpp
  plugins/
    withPdfNdk.js  Expo config plugin — injects NDK cmake config
```

## Build

```bash
cd mobile
pnpm expo prebuild          # regenerates android/
pnpm expo run:android       # builds + installs on device/emulator
# or via EAS:
eas build --platform android --profile development
```

## Phase 3 (not yet implemented)

Link prebuilt QPDF and MuPDF `.so` libraries by uncommenting the stubs in `CMakeLists.txt` and `qpdf_bridge.cpp` / `mupdf_bridge.cpp`.
