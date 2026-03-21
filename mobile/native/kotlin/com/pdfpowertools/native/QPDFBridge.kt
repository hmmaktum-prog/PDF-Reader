package com.pdfpowertools.native

/**
 * QPDFBridge.kt
 * Kotlin wrapper for QPDF C++ JNI bridge
 * These native methods are implemented in qpdf_bridge.cpp
 */
object QPDFBridge {
    init {
        System.loadLibrary("pdfpowertools_native")
    }

    // PDF Merging
    external fun mergePdfs(
        inputPaths: String,
        outputPath: String,
        invertColors: Boolean = false
    ): String

    // PDF Splitting
    external fun splitPdf(
        inputPath: String,
        outputDirectory: String,
        ranges: String
    ): Boolean

    // PDF Compression
    external fun compressPdf(
        inputPath: String,
        outputPath: String
    ): Boolean

    // PDF Rotation
    external fun rotatePdf(
        inputPath: String,
        outputPath: String,
        angle: Int,
        pages: String = "all"
    ): Boolean

    // PDF Repair/Rebuild
    external fun repairPdf(
        inputPath: String,
        outputPath: String
    ): Boolean

    // PDF Decryption
    external fun decryptPdf(
        inputPath: String,
        outputPath: String,
        password: String
    ): Boolean

    // Reorder Pages
    external fun reorderPages(
        inputPath: String,
        outputPath: String,
        newOrder: String
    ): Boolean

    // Remove Pages
    external fun removePages(
        inputPath: String,
        outputPath: String,
        pagesToRemove: String
    ): Boolean

    // Resize Pages
    external fun resizePdf(
        inputPath: String,
        outputPath: String,
        widthPts: Int,
        heightPts: Int
    ): Boolean

    // N-Up Layout
    external fun nupLayout(
        inputPath: String,
        outputPath: String,
        cols: Int,
        rows: Int
    ): Boolean

    // Create Booklet
    external fun createBooklet(
        inputPath: String,
        outputPath: String,
        binding: String
    ): Boolean

    // 4-Up Booklet
    external fun fourUpBooklet(
        inputPath: String,
        outputPath: String,
        orientation: String
    ): Boolean

    // Images to PDF
    external fun imagesToPdf(
        imagePaths: String,
        outputPath: String,
        pageSize: String,
        addMargin: Boolean
    ): Boolean
}
