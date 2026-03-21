#!/usr/bin/env bash
set -euo pipefail

# build_native_libraries.sh
# 1) Download Android NDK (r25b) if not present
# 2) Clone qpdf & mupdf
# 3) Cross-compile libqpdf.so & libmupdf.so for arm64-v8a and x86_64
# 4) Copy into mobile/native/third_party

WORKSPACE="$(pwd)"
NDK_VERSION="25.2.9519653"
ANDROID_NDK_ROOT="${ANDROID_NDK_ROOT:-$HOME/Android/Sdk/ndk/$NDK_VERSION}"
ANDROID_API=24
ABIS=(arm64-v8a x86_64)

echo "Workspace = $WORKSPACE"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "ERROR: This script is designed for Linux (WSL/Ubuntu)." >&2
  exit 1
fi

mkdir -p "$HOME/Android/Sdk/ndk"

if [[ ! -d "$ANDROID_NDK_ROOT" ]]; then
  echo "Downloading Android NDK $NDK_VERSION..."
  NDK_ZIP="android-ndk-r25b-linux.zip"
  curl -LO "https://dl.google.com/android/repository/$NDK_ZIP"
  unzip -q "$NDK_ZIP" -d "$HOME/Android/Sdk/ndk"
  rm -f "$NDK_ZIP"
  if [[ ! -d "$ANDROID_NDK_ROOT" ]]; then
    echo "ERROR: NDK extraction failed." >&2
    exit 1
  fi
fi

echo "Using Android NDK: $ANDROID_NDK_ROOT"

# create third_party structure
THIRD_PARTY="$WORKSPACE/mobile/native/third_party"
mkdir -p "$THIRD_PARTY/qpdf/libs" "$THIRD_PARTY/mupdf/libs"

# clone sources
SRC_ROOT="$WORKSPACE/.native_src"
mkdir -p "$SRC_ROOT"

# QPDF
QPDF_SRC="$SRC_ROOT/qpdf"
if [[ ! -d "$QPDF_SRC" ]]; then
  git clone --depth 1 https://github.com/qpdf/qpdf.git "$QPDF_SRC"
fi

# MuPDF
MUPDF_SRC="$SRC_ROOT/mupdf"
if [[ ! -d "$MUPDF_SRC" ]]; then
  git clone --depth 1 https://github.com/ArtifexSoftware/mupdf.git "$MUPDF_SRC"
fi

for ABI in "${ABIS[@]}"; do
  echo "\n=== Building for $ABI ==="

  # qpdf
  QPDF_BUILD="$SRC_ROOT/qpdf-build-$ABI"
  mkdir -p "$QPDF_BUILD"
  pushd "$QPDF_BUILD" > /dev/null

  cmake -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK_ROOT/build/cmake/android.toolchain.cmake" \
        -DANDROID_ABI="$ABI" \
        -DANDROID_PLATFORM="android-$ANDROID_API" \
        -DANDROID_STL=c++_shared \
        -Dqpdf_build_tools=OFF \
        -Dqpdf_build_tests=OFF \
        -Dqpdf_build_examples=OFF \
        -DBUILD_SHARED_LIBS=ON \
        "$QPDF_SRC"

  cmake --build . -- -j"$(nproc)"

  if [[ ! -f "libqpdf.so" ]]; then
    echo "ERROR: libqpdf.so not found for $ABI." >&2
    exit 1
  fi
  mkdir -p "$THIRD_PARTY/qpdf/libs/$ABI"
  cp -v "libqpdf.so" "$THIRD_PARTY/qpdf/libs/$ABI/"
  popd > /dev/null

  # mupdf
  MUPDF_BUILD="$SRC_ROOT/mupdf-build-$ABI"
  mkdir -p "$MUPDF_BUILD"
  pushd "$MUPDF_BUILD" > /dev/null

  cmake -DCMAKE_TOOLCHAIN_FILE="$ANDROID_NDK_ROOT/build/cmake/android.toolchain.cmake" \
        -DANDROID_ABI="$ABI" \
        -DANDROID_NATIVE_API_LEVEL="$ANDROID_API" \
        -DANDROID_STL=c++_shared \
        -DCMAKE_BUILD_TYPE=Release \
        -DENABLE_SHARED=ON \
        -DENABLE_LIBMUPDF=ON \
        -DENABLE_FREETYPE=OFF \
        -DENABLE_OPENJPEG=OFF \
        -DENABLE_JBIG2=OFF \
        -DENABLE_PDF=ON \
        "$MUPDF_SRC"

  cmake --build . -- -j"$(nproc)"

  # This path can vary depending on MuPDF CMake rules.
  if [[ -f "platform/android/libmupdf.so" ]]; then
    MUPDF_SO="platform/android/libmupdf.so"
  elif [[ -f "libmupdf.so" ]]; then
    MUPDF_SO="libmupdf.so"
  else
    echo "WARNING: libmupdf.so not found in build folder. Search for it."
    find . -name 'libmupdf.so' -print
    exit 1
  fi

  mkdir -p "$THIRD_PARTY/mupdf/libs/$ABI"
  cp -v "$MUPDF_SO" "$THIRD_PARTY/mupdf/libs/$ABI/"
  popd > /dev/null

done

# copy headers
cp -vr "$QPDF_SRC/include" "$THIRD_PARTY/qpdf/"
cp -vr "$MUPDF_SRC/include" "$THIRD_PARTY/mupdf/"

echo "\nDONE: QPDF + MuPDF .so files generated in $THIRD_PARTY"
find "$THIRD_PARTY" -maxdepth 4 -type f -name '*.so' -print
