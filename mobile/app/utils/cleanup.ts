import * as FileSystem from 'expo-file-system';

/**
 * Removes temporary files used by the app, such as OCR renders and cached paths.
 */
export async function cleanupTemporaryFiles(): Promise<void> {
  try {
    const tempDir = FileSystem.cacheDirectory;
    if (tempDir) {
      const contents = await FileSystem.readDirectoryAsync(tempDir);
      for (const item of contents) {
        if (item.includes('DocumentPicker') || item.includes('ImagePicker')) {
          await FileSystem.deleteAsync(`${tempDir}${item}`, { idempotent: true });
        }
      }
    }

    // Custom output dirs mapped to QPDF / MuPDF
    const nativeCacheDirs = [
      '/storage/emulated/0/Download/PDFPowerTools/ocr_output/pages',
      '/storage/emulated/0/Download/PDFPowerTools/.temp'
    ];

    for (const dir of nativeCacheDirs) {
      const exists = await FileSystem.getInfoAsync(dir);
      if (exists.exists && exists.isDirectory) {
        await FileSystem.deleteAsync(dir, { idempotent: true });
      }
    }

    console.log('Temporary files cleanup completed successfully.');
  } catch (error) {
    console.warn('Error during temporary file cleanup:', error);
  }
}
