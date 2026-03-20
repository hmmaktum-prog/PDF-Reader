cmake_minimum_required(VERSION 3.18.1)
project(PdfPowerToolsNative)

# Android NDK automatically provides JNI headers — no find_package(JNI) needed.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# QPDF and MuPDF will be linked as prebuilt .so files in Phase 3.
# add_library(qpdf SHARED IMPORTED)
# set_target_properties(qpdf PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libs/${ANDROID_ABI}/libqpdf.so)
# add_library(mupdf SHARED IMPORTED)
# set_target_properties(mupdf PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/libs/${ANDROID_ABI}/libmupdf.so)

# Native bridge shared library
add_library(
        pdfpowertools_native
        SHARED
        qpdf_bridge.cpp
        mupdf_bridge.cpp
)

# Android system libraries available in NDK
find_library(log-lib log)
find_library(android-lib android)

target_link_libraries(
        pdfpowertools_native
        ${log-lib}
        ${android-lib}
        # qpdf     # Phase 3
        # mupdf    # Phase 3
)
