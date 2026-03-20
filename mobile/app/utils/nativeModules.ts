/**
 * nativeModules.ts
 * TypeScript wrapper for C++ JNI bridge calls (QPDFBridge & MuPDFBridge).
 * These functions call into native Android code via NativeModules.
 * Until the native .so libraries are built, these will throw or return stubs.
 */
import { NativeModules, Platform } from 'react-native';

const QPDFBridge = NativeModules.QPDFBridge;
const MuPDFBridge = NativeModules.MuPDFBridge;

function ensureAndroid(name: string): void {
  if (Platform.OS !== 'android') {
    throw new Error(`${name} is only available on Android (NDK)`);
  }
}

// ──────────────────────────────────────────────
// QPDF Operations
// ──────────────────────────────────────────────

export async function mergePdfs(inputPaths: string[], outputPath: string): Promise<string> {
  ensureAndroid('mergePdfs');
  return await QPDFBridge.mergePdfs(inputPaths.join(','), outputPath);
}

export async function splitPdf(inputPath: string, outputDir: string, ranges: string): Promise<boolean> {
  ensureAndroid('splitPdf');
  return await QPDFBridge.splitPdf(inputPath, outputDir, ranges);
}

export async function compressPdf(inputPath: string, outputPath: string): Promise<boolean> {
  ensureAndroid('compressPdf');
  return await QPDFBridge.compressPdf(inputPath, outputPath);
}

export async function rotatePdf(
  inputPath: string,
  outputPath: string,
  angle: 90 | 180 | 270,
  pages?: string // e.g. "1-3,5" or undefined for all
): Promise<boolean> {
  ensureAndroid('rotatePdf');
  return await QPDFBridge.rotatePdf(inputPath, outputPath, angle, pages || 'all');
}

export async function repairPdf(inputPath: string, outputPath: string): Promise<boolean> {
  ensureAndroid('repairPdf');
  return await QPDFBridge.repairPdf(inputPath, outputPath);
}

export async function decryptPdf(inputPath: string, outputPath: string, password: string): Promise<boolean> {
  ensureAndroid('decryptPdf');
  return await QPDFBridge.decryptPdf(inputPath, outputPath, password);
}

export async function reorderPages(inputPath: string, outputPath: string, newOrder: number[]): Promise<boolean> {
  ensureAndroid('reorderPages');
  return await QPDFBridge.reorderPages(inputPath, outputPath, newOrder.join(','));
}

export async function removePages(inputPath: string, outputPath: string, pagesToRemove: number[]): Promise<boolean> {
  ensureAndroid('removePages');
  return await QPDFBridge.removePages(inputPath, outputPath, pagesToRemove.join(','));
}

export async function resizePdf(
  inputPath: string,
  outputPath: string,
  widthPts: number,
  heightPts: number
): Promise<boolean> {
  ensureAndroid('resizePdf');
  return await QPDFBridge.resizePdf(inputPath, outputPath, widthPts, heightPts);
}

export async function nupLayout(
  inputPath: string,
  outputPath: string,
  cols: number,
  rows: number
): Promise<boolean> {
  ensureAndroid('nupLayout');
  return await QPDFBridge.nupLayout(inputPath, outputPath, cols, rows);
}

export async function createBooklet(
  inputPath: string,
  outputPath: string,
  binding: string
): Promise<boolean> {
  ensureAndroid('createBooklet');
  return await QPDFBridge.createBooklet(inputPath, outputPath, binding);
}

export async function fourUpBooklet(
  inputPath: string,
  outputPath: string,
  orientation: string
): Promise<boolean> {
  ensureAndroid('fourUpBooklet');
  return await QPDFBridge.fourUpBooklet(inputPath, outputPath, orientation);
}

export async function imagesToPdf(
  imagePaths: string[],
  outputPath: string,
  pageSize: string,
  addMargin: boolean
): Promise<boolean> {
  ensureAndroid('imagesToPdf');
  return await QPDFBridge.imagesToPdf(imagePaths.join(','), outputPath, pageSize, addMargin);
}

// ──────────────────────────────────────────────
// MuPDF Operations (Rendering / Image Processing)
// ──────────────────────────────────────────────

export async function grayscalePdf(inputPath: string, outputPath: string): Promise<boolean> {
  ensureAndroid('grayscalePdf');
  return await MuPDFBridge.grayscalePdf(inputPath, outputPath);
}

export async function whiteningPdf(
  inputPath: string,
  outputPath: string,
  strength: number
): Promise<boolean> {
  ensureAndroid('whiteningPdf');
  return await MuPDFBridge.whiteningPdf(inputPath, outputPath, strength);
}

export async function enhanceContrastPdf(
  inputPath: string,
  outputPath: string,
  level: number
): Promise<boolean> {
  ensureAndroid('enhanceContrastPdf');
  return await MuPDFBridge.enhanceContrastPdf(inputPath, outputPath, level);
}

// ──────────────────────────────────────────────
// MuPDF Operations (Rendering)
// ──────────────────────────────────────────────

export async function getPageCount(inputPath: string, password?: string): Promise<number> {
  ensureAndroid('getPageCount');
  return await MuPDFBridge.getPageCount(inputPath, password || '');
}

export async function renderPageToImage(
  inputPath: string,
  pageNumber: number,
  outputPath: string,
  highRes: boolean = true
): Promise<boolean> {
  ensureAndroid('renderPageToImage');
  return await MuPDFBridge.renderPdfToImage(inputPath, pageNumber, outputPath, highRes);
}

export async function batchRenderPages(
  inputPath: string,
  outputDir: string,
  format: 'jpeg' | 'png',
  quality: number,
  onProgress?: (page: number, total: number) => void
): Promise<string[]> {
  ensureAndroid('batchRenderPages');
  const totalPages = await getPageCount(inputPath);
  const results: string[] = [];
  const ext = format === 'png' ? '.png' : '.jpg';

  for (let i = 0; i < totalPages; i++) {
    const outPath = `${outputDir}/page_${i + 1}${ext}`;
    await renderPageToImage(inputPath, i, outPath, quality > 70);
    results.push(outPath);
    onProgress?.(i + 1, totalPages);
  }

  return results;
}
