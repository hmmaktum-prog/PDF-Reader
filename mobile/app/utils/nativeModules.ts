/**
 * nativeModules.ts
 * TypeScript wrapper for C++ JNI bridge calls (QPDFBridge & MuPDFBridge).
 * These functions call into native Android code via NativeModules.
 * Until the native .so libraries are built, these will throw or return stubs.
 */
import { NativeModules, Platform } from 'react-native';

const QPDFBridge: any = NativeModules.QPDFBridge ?? {
  mergePdfs: () => '',
  splitPdf: () => false,
  compressPdf: () => false,
  rotatePdf: () => false,
  repairPdf: () => false,
  decryptPdf: () => false,
  reorderPages: () => false,
  removePages: () => false,
  resizePdf: () => false,
  nupLayout: () => false,
  createBooklet: () => false,
  fourUpBooklet: () => false,
  imagesToPdf: () => false,
};

const MuPDFBridge: any = NativeModules.MuPDFBridge ?? {
  getPageCount: () => 0,
  renderPdfToImage: () => false,
  batchRenderPages: () => false,
  getPageDimensions: () => [595, 842],
  grayscalePdf: () => false,
  whiteningPdf: () => false,
  enhanceContrastPdf: () => false,
  invertColorsPdf: () => false,
  geminiAiWhitening: () => false,
};

function ensureAndroid(name: string): void {
  if (Platform.OS !== 'android') {
    throw new Error(`${name} is only available on Android (NDK)`);
  }
}

function assertNativeSuccess(operation: string, ok: boolean): void {
  if (!ok) {
    throw new Error(`${operation} failed in native layer`);
  }
}

// ──────────────────────────────────────────────
// QPDF Operations
// ──────────────────────────────────────────────

export async function mergePdfs(
  inputPaths: string[],
  outputPath: string,
  invertColors: boolean = false
): Promise<string> {
  ensureAndroid('mergePdfs');
  const result = await QPDFBridge.mergePdfs(inputPaths.join(','), outputPath, invertColors);
  if (!result || result.includes('Stub - Pending')) {
    throw new Error('mergePdfs is not implemented in native layer yet');
  }
  return result;
}

export async function splitPdf(inputPath: string, outputDir: string, ranges: string): Promise<boolean> {
  ensureAndroid('splitPdf');
  const ok = await QPDFBridge.splitPdf(inputPath, outputDir, ranges);
  assertNativeSuccess('splitPdf', ok);
  return ok;
}

export async function compressPdf(
  inputPath: string,
  outputPath: string,
  level: string = 'Balanced',
  imgQuality: number = 70,
  resScale: number = 100,
  grayscale: boolean = false
): Promise<boolean> {
  ensureAndroid('compressPdf');
  const ok = await QPDFBridge.compressPdf(inputPath, outputPath, level, imgQuality, resScale, grayscale);
  assertNativeSuccess('compressPdf', ok);
  return ok;
}

export async function rotatePdf(
  inputPath: string,
  outputPath: string,
  angle: 90 | 180 | 270,
  pages?: string // e.g. "1-3,5" or undefined for all
): Promise<boolean> {
  ensureAndroid('rotatePdf');
  const ok = await QPDFBridge.rotatePdf(inputPath, outputPath, angle, pages || 'all');
  assertNativeSuccess('rotatePdf', ok);
  return ok;
}

export async function repairPdf(inputPath: string, outputPath: string, password: string = ''): Promise<boolean> {
  ensureAndroid('repairPdf');
  const ok = await QPDFBridge.repairPdf(inputPath, outputPath, password);
  assertNativeSuccess('repairPdf', ok);
  return ok;
}

export async function decryptPdf(inputPath: string, outputPath: string, password: string): Promise<boolean> {
  ensureAndroid('decryptPdf');
  const ok = await QPDFBridge.decryptPdf(inputPath, outputPath, password);
  assertNativeSuccess('decryptPdf', ok);
  return ok;
}

export async function reorderPages(inputPath: string, outputPath: string, newOrder: number[]): Promise<boolean> {
  ensureAndroid('reorderPages');
  const ok = await QPDFBridge.reorderPages(inputPath, outputPath, newOrder.join(','));
  assertNativeSuccess('reorderPages', ok);
  return ok;
}

export async function removePages(inputPath: string, outputPath: string, pagesToRemove: number[]): Promise<boolean> {
  ensureAndroid('removePages');
  const ok = await QPDFBridge.removePages(inputPath, outputPath, pagesToRemove.join(','));
  assertNativeSuccess('removePages', ok);
  return ok;
}

export async function resizePdf(
  inputPath: string,
  outputPath: string,
  widthPts: number,
  heightPts: number,
  scale: number = 100,
  alignH: string = 'center',
  alignV: string = 'middle'
): Promise<boolean> {
  ensureAndroid('resizePdf');
  const ok = await QPDFBridge.resizePdf(inputPath, outputPath, widthPts, heightPts, scale, alignH, alignV);
  assertNativeSuccess('resizePdf', ok);
  return ok;
}

export async function nupLayout(
  inputPath: string,
  outputPath: string,
  cols: number,
  rows: number,
  sequence: string = 'Z'
): Promise<boolean> {
  ensureAndroid('nupLayout');
  const ok = await QPDFBridge.nupLayout(inputPath, outputPath, cols, rows, sequence);
  assertNativeSuccess('nupLayout', ok);
  return ok;
}

export async function createBooklet(
  inputPath: string,
  outputPath: string,
  binding: string,
  autoPadding: boolean = true
): Promise<boolean> {
  ensureAndroid('createBooklet');
  const ok = await QPDFBridge.createBooklet(inputPath, outputPath, binding, autoPadding);
  assertNativeSuccess('createBooklet', ok);
  return ok;
}

export async function fourUpBooklet(
  inputPath: string,
  outputPath: string,
  orientation: string
): Promise<boolean> {
  ensureAndroid('fourUpBooklet');
  const ok = await QPDFBridge.fourUpBooklet(inputPath, outputPath, orientation);
  assertNativeSuccess('fourUpBooklet', ok);
  return ok;
}

export async function imagesToPdf(
  imageData: { uri: string; rotation: number }[] | string[],
  outputPath: string,
  pageSize: string,
  orientation: string = 'portrait',
  marginPts: number = 0
): Promise<boolean> {
  ensureAndroid('imagesToPdf');
  // Support both string[] and object[] formats
  const paths = imageData.map((item) => typeof item === 'string' ? item : item.uri);
  const rotations = imageData.map((item) => typeof item === 'string' ? 0 : item.rotation);
  const ok = await QPDFBridge.imagesToPdf(paths.join(','), rotations.join(','), outputPath, pageSize, orientation, marginPts);
  assertNativeSuccess('imagesToPdf', ok);
  return ok;
}

// ──────────────────────────────────────────────
// MuPDF Operations (Rendering / Image Processing)
// ──────────────────────────────────────────────

export async function grayscalePdf(inputPath: string, outputPath: string): Promise<boolean> {
  ensureAndroid('grayscalePdf');
  const ok = await MuPDFBridge.grayscalePdf(inputPath, outputPath);
  assertNativeSuccess('grayscalePdf', ok);
  return ok;
}

export async function whiteningPdf(
  inputPath: string,
  outputPath: string,
  strength: number
): Promise<boolean> {
  ensureAndroid('whiteningPdf');
  const ok = await MuPDFBridge.whiteningPdf(inputPath, outputPath, strength);
  assertNativeSuccess('whiteningPdf', ok);
  return ok;
}

export async function enhanceContrastPdf(
  inputPath: string,
  outputPath: string,
  level: number
): Promise<boolean> {
  ensureAndroid('enhanceContrastPdf');
  const ok = await MuPDFBridge.enhanceContrastPdf(inputPath, outputPath, level);
  assertNativeSuccess('enhanceContrastPdf', ok);
  return ok;
}

export async function invertColorsPdf(inputPath: string, outputPath: string): Promise<boolean> {
  ensureAndroid('invertColorsPdf');
  const ok = await MuPDFBridge.invertColorsPdf(inputPath, outputPath);
  assertNativeSuccess('invertColorsPdf', ok);
  return ok;
}

export async function geminiAiWhitening(inputPath: string, outputPath: string): Promise<boolean> {
  ensureAndroid('geminiAiWhitening');
  const ok = await MuPDFBridge.geminiAiWhitening(inputPath, outputPath);
  assertNativeSuccess('geminiAiWhitening', ok);
  return ok;
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
  onProgressOrOutputMode?: ((page: number, total: number) => void) | string
): Promise<string[]> {
  ensureAndroid('batchRenderPages');
  // Support both callback and outputMode string for flexibility
  const onProgress = typeof onProgressOrOutputMode === 'function' ? onProgressOrOutputMode : undefined;
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
