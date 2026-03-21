#!/usr/bin/env bash
set -euo pipefail

# build_native_libraries.sh
# Builds libqpdf.so + libmupdf.so for Android ARM64 and x86_64
# Build order: libjpeg-turbo → QPDF → MuPDF

WORKSPACE="$(pwd)"
NDK_VERSION="25.2.9519653"
ANDROID_NDK_ROOT="${ANDROID_NDK_ROOT:-$HOME/Android/Sdk/ndk/$NDK_VERSION}"
ANDROID_API=24
ABIS=(arm64-v8a x86_64)
TOOLCHAIN="$ANDROID_NDK_ROOT/build/cmake/android.toolchain.cmake"
SRC_ROOT="$WORKSPACE/.native_src"
THIRD_PARTY="$WORKSPACE/mobile/native/third_party"

echo "=== PDF Power Tools Native Library Builder ==="
echo "NDK:       $ANDROID_NDK_ROOT"
echo "Workspace: $WORKSPACE"

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "ERROR: Linux required." >&2; exit 1
fi

# ── NDK Setup ────────────────────────────────────────────────────────────────
if [[ ! -d "$ANDROID_NDK_ROOT" ]]; then
  echo "Downloading NDK r25b..."
  mkdir -p "$HOME/Android/Sdk/ndk"
  curl -L -o /tmp/ndk.zip "https://dl.google.com/android/repository/android-ndk-r25b-linux.zip"
  unzip -q /tmp/ndk.zip -d "$HOME/Android/Sdk/ndk"
  mv "$HOME/Android/Sdk/ndk/android-ndk-r25b" "$ANDROID_NDK_ROOT"
  rm -f /tmp/ndk.zip
  echo "NDK ready."
fi

mkdir -p "$SRC_ROOT" "$THIRD_PARTY/qpdf/libs" "$THIRD_PARTY/mupdf/libs"

# ── Clone sources ─────────────────────────────────────────────────────────────
echo ""
echo "── Cloning sources ──"
[[ ! -d "$SRC_ROOT/libjpeg-turbo/.git" ]] && \
  git clone --depth 1 https://github.com/libjpeg-turbo/libjpeg-turbo.git "$SRC_ROOT/libjpeg-turbo"

[[ ! -d "$SRC_ROOT/qpdf/.git" ]] && \
  git clone --depth 1 --branch v11.9.1 https://github.com/qpdf/qpdf.git "$SRC_ROOT/qpdf"

[[ ! -d "$SRC_ROOT/mupdf/.git" ]] && \
  git clone --depth 1 https://github.com/ArtifexSoftware/mupdf.git "$SRC_ROOT/mupdf"

# ── Per-ABI builds ─────────────────────────────────────────────────────────────
for ABI in "${ABIS[@]}"; do
  echo ""
  echo "══ ABI: $ABI ══════════════════════════════════════"

  # Android triple used in NDK sysroot paths
  case "$ABI" in
    arm64-v8a) TRIPLE="aarch64-linux-android" ;;
    x86_64)    TRIPLE="x86_64-linux-android" ;;
    armeabi-v7a) TRIPLE="arm-linux-androideabi" ;;
  esac

  NDK_SYSROOT="$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/linux-x86_64/sysroot"

  COMMON_CMAKE=(
    -DCMAKE_TOOLCHAIN_FILE="$TOOLCHAIN"
    -DANDROID_ABI="$ABI"
    -DANDROID_PLATFORM="android-$ANDROID_API"
    -DANDROID_STL=c++_shared
    -DCMAKE_BUILD_TYPE=Release
  )

  # ── 1. libjpeg-turbo ──────────────────────────────────────────────────────────
  LIBJPEG_INSTALL="$SRC_ROOT/libjpeg-install-$ABI"

  if [[ ! -f "$LIBJPEG_INSTALL/lib/libjpeg.so" ]]; then
    echo "Building libjpeg-turbo..."
    mkdir -p "$SRC_ROOT/libjpeg-build-$ABI" "$LIBJPEG_INSTALL"
    pushd "$SRC_ROOT/libjpeg-build-$ABI" > /dev/null
    cmake "${COMMON_CMAKE[@]}" \
          -DENABLE_SHARED=ON -DENABLE_STATIC=OFF \
          -DWITH_JPEG8=ON \
          -DCMAKE_INSTALL_PREFIX="$LIBJPEG_INSTALL" \
          "$SRC_ROOT/libjpeg-turbo"
    cmake --build . -j"$(nproc)"
    cmake --install .
    popd > /dev/null
    echo "libjpeg-turbo ✓"
  else
    echo "libjpeg-turbo already built (skip)"
  fi

  # Create pkg-config .pc file so QPDF's pkg_check_modules can find libjpeg
  PKGCONFIG_DIR="$LIBJPEG_INSTALL/lib/pkgconfig"
  mkdir -p "$PKGCONFIG_DIR"
  cat > "$PKGCONFIG_DIR/libjpeg.pc" << PC
prefix=$LIBJPEG_INSTALL
exec_prefix=\${prefix}
libdir=\${exec_prefix}/lib
includedir=\${prefix}/include

Name: libjpeg
Description: Android cross-compiled libjpeg-turbo
Version: 2.1.0
Libs: -L\${libdir} -ljpeg
Cflags: -I\${includedir}
PC

  # ── 2. QPDF ──────────────────────────────────────────────────────────────────
  if [[ ! -f "$THIRD_PARTY/qpdf/libs/$ABI/libqpdf.so" ]]; then
    echo "Building QPDF..."
    mkdir -p "$SRC_ROOT/qpdf-build-$ABI"
    pushd "$SRC_ROOT/qpdf-build-$ABI" > /dev/null

    # Force pkg-config to ONLY see our Android cross-compiled libs
    PKG_CONFIG_SYSROOT_DIR="" \
    PKG_CONFIG_PATH="$PKGCONFIG_DIR" \
    PKG_CONFIG_LIBDIR="$PKGCONFIG_DIR" \
    cmake "${COMMON_CMAKE[@]}" \
          -Dqpdf_build_tools=OFF \
          -Dqpdf_build_tests=OFF \
          -Dqpdf_build_examples=OFF \
          -DBUILD_SHARED_LIBS=ON \
          -DREQUIRE_CRYPTO_OPENSSL=OFF \
          -DREQUIRE_CRYPTO_GNUTLS=OFF \
          -DUSE_INSECURE_RANDOM=ON \
          -DJPEG_LIBRARY="$LIBJPEG_INSTALL/lib/libjpeg.so" \
          -DJPEG_INCLUDE_DIR="$LIBJPEG_INSTALL/include" \
          -DZLIB_LIBRARY="$NDK_SYSROOT/usr/lib/$TRIPLE/libz.so" \
          -DZLIB_INCLUDE_DIR="$NDK_SYSROOT/usr/include" \
          "$SRC_ROOT/qpdf"

    cmake --build . -j"$(nproc)"

    QPDF_SO=$(find . -name 'libqpdf.so' 2>/dev/null | head -1 || true)
    if [[ -z "$QPDF_SO" ]]; then
      echo "ERROR: libqpdf.so not found for $ABI" >&2; exit 1
    fi
    mkdir -p "$THIRD_PARTY/qpdf/libs/$ABI"
    cp -v "$QPDF_SO" "$THIRD_PARTY/qpdf/libs/$ABI/"
    cp -v "$LIBJPEG_INSTALL/lib/libjpeg.so" "$THIRD_PARTY/qpdf/libs/$ABI/" 2>/dev/null || true
    popd > /dev/null
    echo "QPDF ✓"
  else
    echo "QPDF already built for $ABI (skip)"
  fi

  # ── 3. MuPDF ─────────────────────────────────────────────────────────────────
  if [[ ! -f "$THIRD_PARTY/mupdf/libs/$ABI/libmupdf.so" ]]; then
    echo "Building MuPDF..."
    mkdir -p "$SRC_ROOT/mupdf-build-$ABI"
    pushd "$SRC_ROOT/mupdf-build-$ABI" > /dev/null

    cmake "${COMMON_CMAKE[@]}" \
          -DANDROID_NATIVE_API_LEVEL="$ANDROID_API" \
          -DENABLE_SHARED=ON \
          -DENABLE_LIBMUPDF=ON \
          -DENABLE_FREETYPE=OFF \
          -DENABLE_OPENJPEG=OFF \
          -DENABLE_JBIG2=OFF \
          -DENABLE_PDF=ON \
          -DENABLE_WERROR=OFF \
          "$SRC_ROOT/mupdf"
    cmake --build . -j"$(nproc)"

    MUPDF_SO=$(find . -name 'libmupdf.so' 2>/dev/null | head -1 || true)
    if [[ -z "$MUPDF_SO" ]]; then
      echo "ERROR: libmupdf.so not found for $ABI" >&2; exit 1
    fi
    mkdir -p "$THIRD_PARTY/mupdf/libs/$ABI"
    cp -v "$MUPDF_SO" "$THIRD_PARTY/mupdf/libs/$ABI/"
    popd > /dev/null
    echo "MuPDF ✓"
  else
    echo "MuPDF already built for $ABI (skip)"
  fi

done

# ── Headers ───────────────────────────────────────────────────────────────────
echo ""
echo "Copying headers..."
mkdir -p "$THIRD_PARTY/qpdf/include" "$THIRD_PARTY/mupdf/include"
cp -r "$SRC_ROOT/qpdf/include/." "$THIRD_PARTY/qpdf/include/"
cp -r "$SRC_ROOT/mupdf/include/." "$THIRD_PARTY/mupdf/include/" 2>/dev/null || true

echo ""
echo "══════════════════════════════════════════════════"
echo "DONE. Generated .so files:"
find "$THIRD_PARTY" -name '*.so' -print
echo "══════════════════════════════════════════════════"
