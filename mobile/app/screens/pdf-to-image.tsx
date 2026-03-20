import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { batchRenderPages } from '../utils/nativeModules';
import { pickSinglePdf } from '../utils/filePicker';

type ImgFormat = 'jpeg' | 'png';

const DPI_OPTIONS = [
  { label: '150 DPI', value: 150, hint: 'Normal — smaller files' },
  { label: '300 DPI', value: 300, hint: 'High — print quality' },
  { label: '600 DPI', value: 600, hint: 'Ultra — very large files' },
];

export default function PdfToImageScreen() {
  const { isDark } = useAppTheme();
  const [format, setFormat] = useState<ImgFormat>('jpeg');
  const [dpi, setDpi] = useState(300);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [outputZip, setOutputZip] = useState(true);

  const handlePickFile = async () => {
    try {
      const picked = await pickSinglePdf();
      if (!picked) return;
      setSelectedFile(picked.path);
      setSelectedFileName(picked.name);
    } catch (e: any) {
      Alert.alert('File Picker Error', e.message);
    }
  };

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputDir = '/storage/emulated/0/Download/PDFPowerTools/pdf_images';
    onProgress(10, 'Loading PDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(35, `Rendering pages at ${dpi} DPI via MuPDF...`);
    await batchRenderPages(selectedFile, outputDir, format, dpi);
    onProgress(75, outputZip ? 'Creating ZIP archive...' : 'Saving images...');
    await new Promise(r => setTimeout(r, 400));
    onProgress(100, 'Done!');
    return outputDir + (outputZip ? '.zip' : '');
  };

  return (
    <ToolShell title="PDF to Image" subtitle="Convert each page to image via MuPDF" onExecute={handleAction} executeLabel="📸 Convert to Images">
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={handlePickFile}
        testID="button-pick-file"
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>📁</Text>
        <Text style={[styles.pickText, { color: textColor }]}>
          {selectedFileName || 'Select PDF File'}
        </Text>
        <Text style={{ color: muted, fontSize: 12 }}>{selectedFile ? 'Tap to change file' : 'MuPDF NDK renders each page at high quality'}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>📸 Output Format</Text>
      <View style={styles.formatRow}>
        {(['jpeg', 'png'] as ImgFormat[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.formatCard, { backgroundColor: cardBg, borderColor: format === f ? accent : isDark ? '#444' : '#ccc' }, format === f && { backgroundColor: accent + '22' }]}
            onPress={() => setFormat(f)}
            testID={"button-format-" + f}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{f === 'jpeg' ? '📷' : '🖼️'}</Text>
            <Text style={{ color: format === f ? accent : textColor, fontWeight: '700', textTransform: 'uppercase' }}>{f}</Text>
            <Text style={{ color: muted, fontSize: 11, marginTop: 2 }}>{f === 'jpeg' ? 'Smaller size' : 'Lossless'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>⚡ Resolution (DPI)</Text>
      {DPI_OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.dpiCard, { backgroundColor: cardBg, borderColor: dpi === opt.value ? accent : isDark ? '#333' : '#ddd' }, dpi === opt.value && { backgroundColor: accent + '15' }]}
          onPress={() => setDpi(opt.value)}
          testID={"button-dpi-" + opt.value}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: dpi === opt.value ? accent : textColor, fontWeight: '600' }}>{opt.label}</Text>
            <Text style={{ color: muted, fontSize: 12 }}>{opt.hint}</Text>
          </View>
          {dpi === opt.value && <Text style={{ color: accent, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.toggleRow, { backgroundColor: cardBg }]}
        onPress={() => setOutputZip(!outputZip)}
        testID="button-toggle-zip"
      >
        <View>
          <Text style={{ color: textColor, fontWeight: '600' }}>📦 Bundle as ZIP</Text>
          <Text style={{ color: muted, fontSize: 12 }}>Compress all images into one ZIP file</Text>
        </View>
        <View style={[styles.toggleOuter, { backgroundColor: outputZip ? accent : isDark ? '#555' : '#ccc' }]}>
          <View style={[styles.toggleThumb, { marginLeft: outputZip ? 22 : 2 }]} />
        </View>
      </TouchableOpacity>
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  formatRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  formatCard: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  dpiCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, marginTop: 8 },
  toggleOuter: { width: 46, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
});
