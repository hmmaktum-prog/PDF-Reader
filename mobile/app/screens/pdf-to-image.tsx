import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { batchRenderPages } from '../utils/nativeModules';
import { pickSinglePdf } from '../utils/filePicker';

export default function PdfToImageScreen() {
  const { isDark } = useAppTheme();
  const [format, setFormat] = useState<'jpeg'|'png'>('jpeg');
  const [scale, setScale] = useState(2.0);
  const [outputMode, setOutputMode] = useState<'zip'|'pdf'>('zip');
  
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

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

  const handleAction = async (onProgress: (pct: number, label?: string) => void) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outPath = outputMode === 'zip' 
      ? '/storage/emulated/0/Download/PDFPowerTools/images.zip' 
      : '/storage/emulated/0/Download/PDFPowerTools/images_new.pdf';

    onProgress(10, 'Loading PDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(35, `Rendering pages at ${scale.toFixed(1)}x Scale via MuPDF...`);
    // Assuming native module supports scale and output mode
    await batchRenderPages(selectedFile, outPath, format, scale, outputMode);
    onProgress(75, outputMode === 'zip' ? 'Creating ZIP archive...' : 'Saving to new PDF...');
    await new Promise(r => setTimeout(r, 400));
    onProgress(100, 'Done!');
    return outPath;
  };

  return (
    <ToolShell title="PDF to Image" subtitle="Extract pages to high-res images" onExecute={handleAction} executeLabel={`📸 Convert to ${outputMode.toUpperCase()}`}>
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={handlePickFile}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>📁</Text>
        <Text style={[styles.pickText, { color: textColor }]}>
          {selectedFileName || 'Select PDF File'}
        </Text>
        <Text style={{ color: muted, fontSize: 12 }}>Tap to browse</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>📸 Output Format</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {(['jpeg', 'png'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.formatCard, { backgroundColor: cardBg, borderColor: format === f ? accent : isDark ? '#444' : '#ccc' }, format === f && { backgroundColor: accent + '15' }]}
            onPress={() => setFormat(f)}
          >
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{f === 'jpeg' ? '📷' : '🖼️'}</Text>
            <Text style={{ color: format === f ? accent : textColor, fontWeight: '700', textTransform: 'uppercase' }}>{f}</Text>
            <Text style={{ color: muted, fontSize: 11, marginTop: 2 }}>{f === 'jpeg' ? 'Smaller size' : 'Lossless'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>🔍 Resolution Multiplier</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {[1.0, 1.5, 2.0, 3.0].map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.scaleCard, { backgroundColor: scale === s ? accent : cardBg, borderColor: isDark ? '#444' : '#ccc' }]}
            onPress={() => setScale(s)}
          >
            <Text style={{ color: scale === s ? '#fff' : textColor, fontWeight: '600' }}>{s.toFixed(1)}x</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>📦 Output Destination</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <TouchableOpacity
          style={[styles.outCard, { backgroundColor: cardBg, borderColor: outputMode === 'zip' ? accent : isDark ? '#444' : '#ccc' }, outputMode === 'zip' && { backgroundColor: accent + '15' }]}
          onPress={() => setOutputMode('zip')}
        >
          <Text style={{ color: outputMode === 'zip' ? accent : textColor, fontWeight: '600', marginBottom: 2 }}>ZIP Archive</Text>
          <Text style={{ color: muted, fontSize: 11 }}>Bundle images together</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.outCard, { backgroundColor: cardBg, borderColor: outputMode === 'pdf' ? accent : isDark ? '#444' : '#ccc' }, outputMode === 'pdf' && { backgroundColor: accent + '15' }]}
          onPress={() => setOutputMode('pdf')}
        >
          <Text style={{ color: outputMode === 'pdf' ? accent : textColor, fontWeight: '600', marginBottom: 2 }}>Images to PDF</Text>
          <Text style={{ color: muted, fontSize: 11 }}>Save as new PDF</Text>
        </TouchableOpacity>
      </View>
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  formatCard: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  scaleCard: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  outCard: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
});
