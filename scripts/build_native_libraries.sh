#!/usr/bin/env bash
set -euo pipefail

# build_native_libraries.sh
# Builds libqpdf.so and libmupdf.so for Android (arm64-v8a, x86_64)
# Dependencies built in order: libjpeg-turbo → QPDF → MuPDF

WORKSPACE="$(pwd)"
NDK_VERSION="25.2.9519653"
ANDROID_NDK_ROOT="${ANDROID_NDK_ROOT:-$HOME/Android/Sdk/ndk/$NDK_VERSION}"
ANDROID_API=24
ABIS=(arm64-v8a x86_64)
TOOLCHAIN="$ANDROID_NDK_ROOT/build/cmake/android.toolchain.cmake"

echo "Workspace = $WORKSPACE"
echo "NDK = $ANDROID_NDK_ROOT"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "ERROR: This script is designed for Linux." >&2
  exit 1
fi

mkdir -p "$HOME/Android/Sdk/ndk"

if [[ ! -d "$ANDROID_NDK_ROOT" ]]; then
  echo "Downloading Android NDK r25b..."
  curl -L -o /tmp/ndk.zip "https://dl.google.com/android/repository/android-ndk-r25b-linux.zip"
  unzip -q /tmp/ndk.zip -d "$HOME/Android/Sdk/ndk"
  mv "$HOME/Android/Sdk/ndk/android-ndk-r25b" "$ANDROID_NDK_ROOT"
  rm -f /tmp/ndk.zip
  echo "NDK ready."
fi

THIRD_PARTY="$WORKSPACE/mobile/native/third_party"
mkdir -p "$THIRD_PARTY/qpdf/libs" "$THIRD_PARTY/mupdf/libs"
SRC_ROOT="$WORKSPACE/.native_src"
mkdir -p "$SRC_ROOT"

# ── Clone sources ────────────────────────────────────────────────────────────

echo ""
echo "── Cloning sources ──"

LIBJPEG_SRC="$SRC_ROOT/libjpeg-turbo"
if [[ ! -d "$LIBJPEG_SRC/.git" ]]; then
  git clone --depth 1 https://github.com/libjpeg-turbo/libjpeg-turbo.git "$LIBJPEG_SRC"
fi

QPDF_SRC="$SRC_ROOT/qpdf"
if [[ ! -d "$QPDF_SRC/.git" ]]; then
  git clone --depth 1 --branch v11.9.1 https://github.com/qpdf/qpdf.git "$QPDF_SRC"
fi

MUPDF_SRC="$SRC_ROOT/mupdf"
if [[ ! -d "$MUPDF_SRC/.git" ]]; then
  git clone --depth 1 https://github.com/ArtifexSoftware/mupdf.git "$MUPDF_SRC"
fi

# ── Per-ABI builds ───────────────────────────────────────────────────────────

for ABI in "${ABIS[@]}"; do
  echo ""
  echo "══════════════════════════════════════"
  echo " Building ABI: $ABI"
  echo "══════════════════════════════════════"

  COMMON_FLAGS=(
    -DCMAKE_TOOLCHAIN_FILE="$TOOLCHAIN"
    -DANDROID_ABI="$ABI"
    -DANDROID_PLATFORM="android-$ANDROID_API"
    -DANDROID_STL=c++_shared
    -DCMAKE_BUILD_TYPE=Release
  )

  # ── 1. libjpeg-turbo ────────────────────────────────────────────────────────
  LIBJPEG_INSTALL="$SRC_ROOT/libjpeg-install-$ABI"
  if [[ ! -f "$LIBJPEG_INSTALL/lib/libjpeg.so" ]]; then
    echo "Building libjpeg-turbo for $ABI..."
    LIBJPEG_BUILD="$SRC_ROOT/libjpeg-build-$ABI"
    mkdir -p "$LIBJPEG_BUILD" "$LIBJPEG_INSTALL"
    pushd "$LIBJPEG_BUILD" > /dev/null
    cmake "${COMMON_FLAGS[@]}" \
          -DENABLE_SHARED=ON \
          -DENABLE_STATIC=OFF \
          -DWITH_JPEG8=ON \
          -DCMAKE_INSTALL_PREFIX="$LIBJPEG_INSTALL" \
          "$LIBJPEG_SRC"
    cmake --build . -- -j"$(nproc)"
    cmake --install .
    popd > /dev/null
    echo "libjpeg-turbo done for $ABI"
  else
    echo "libjpeg-turbo already built for $ABI (skip)"
  fi

  # ── 2. QPDF ─────────────────────────────────────────────────────────────────
  QPDF_BUILD="$SRC_ROOT/qpdf-build-$ABI"
  if [[ ! -f "$THIRD_PARTY/qpdf/libs/$ABI/libqpdf.so" ]]; then
    echo "Building QPDF for $ABI..."
    mkdir -p "$QPDF_BUILD"
    pushd "$QPDF_BUILD" > /dev/null
    cmake "${COMMON_FLAGS[@]}" \
          -Dqpdf_build_tools=OFF \
          -Dqpdf_build_tests=OFF \
          -Dqpdf_build_examples=OFF \
          -DBUILD_SHARED_LIBS=ON \
          -DREQUIRE_CRYPTO_OPENSSL=OFF \
          -DREQUIRE_CRYPTO_GNUTLS=OFF \
          -DUSE_INSECURE_RANDOM=ON \
          -DJPEG_LIBRARY="$LIBJPEG_INSTALL/lib/libjpeg.so" \
          -DJPEG_INCLUDE_DIR="$LIBJPEG_INSTALL/include" \
          -DZLIB_LIBRARY="$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/lib/$( [[ $ABI == arm64-v8a ]] && echo aarch64-linux-android || echo x86_64-linux-android )/libz.so" \
          -DZLIB_INCLUDE_DIR="$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/sysroot/usr/include" \
          "$QPDF_SRC"
    cmake --build . -- -j"$(nproc)"
    if [[ ! -f "libqpdf.so" ]]; then
      echo "ERROR: libqpdf.so not built for $ABI" >&2; exit 1
    fi
    mkdir -p "$THIRD_PARTY/qpdf/libs/$ABI"
    cp -v "libqpdf.so" "$THIRD_PARTY/qpdf/libs/$ABI/"
    # Also copy libjpeg (runtime dependency)
    cp -v "$LIBJPEG_INSTALL/lib/libjpeg.so" "$THIRD_PARTY/qpdf/libs/$ABI/" 2>/dev/null || true
    popd > /dev/null
    echo "QPDF done for $ABI"
  else
    echo "QPDF already built for $ABI (skip)"
  fi

  # ── 3. MuPDF ────────────────────────────────────────────────────────────────
  MUPDF_BUILD="$SRC_ROOT/mupdf-build-$ABI"
  if [[ ! -f "$THIRD_PARTY/mupdf/libs/$ABI/libmupdf.so" ]]; then
    echo "Building MuPDF for $ABI..."
    mkdir -p "$MUPDF_BUILD"
    pushd "$MUPDF_BUILD" > /dev/null
    cmake "${COMMON_FLAGS[@]}" \
          -DANDROID_NATIVE_API_LEVEL="$ANDROID_API" \
          -DENABLE_SHARED=ON \
          -DENABLE_LIBMUPDF=ON \
          -DENABLE_FREETYPE=OFF \
          -DENABLE_OPENJPEG=OFF \
          -DENABLE_JBIG2=OFF \
          -DENABLE_PDF=ON \
          -DENABLE_WERROR=OFF \
          "$MUPDF_SRC"
    cmake --build . -- -j"$(nproc)"

    MUPDF_SO=""
    for candidate in "platform/android/libmupdf.so" "libmupdf.so" "source/libmupdf.so"; do
      if [[ -f "$candidate" ]]; then MUPDF_SO="$candidate"; break; fi
    done
    if [[ -z "$MUPDF_SO" ]]; then
      echo "Searching for libmupdf.so..."
      MUPDF_SO=$(find . -name 'libmupdf.so' | head -1)
    fi
    if [[ -z "$MUPDF_SO" ]]; then
      echo "ERROR: libmupdf.so not found for $ABI" >&2; exit 1
    fi
    mkdir -p "$THIRD_PARTY/mupdf/libs/$ABI"
    cp -v "$MUPDF_SO" "$THIRD_PARTY/mupdf/libs/$ABI/"
    popd > /dev/null
    echo "MuPDF done for $ABI"
  else
    echo "MuPDF already built for $ABI (skip)"
  fi

done

# ── Copy headers ─────────────────────────────────────────────────────────────
echo ""
echo "Copying headers..."
cp -r "$QPDF_SRC/include/." "$THIRD_PARTY/qpdf/include/" 2>/dev/null || mkdir -p "$THIRD_PARTY/qpdf/include" && cp -r "$QPDF_SRC/include/." "$THIRD_PARTY/qpdf/include/"
mkdir -p "$THIRD_PARTY/mupdf/include"
cp -r "$MUPDF_SRC/include/." "$THIRD_PARTY/mupdf/include/" 2>/dev/null || true

echo ""
echo "══════════════════════════════════════════"
echo "DONE. Built .so files:"
find "$THIRD_PARTY" -name '*.so' -print
echo "══════════════════════════════════════════"
