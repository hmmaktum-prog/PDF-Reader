import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { grayscalePdf } from '../utils/nativeModules';
import { pickSinglePdf } from '../utils/filePicker';

export default function GrayscaleScreen() {
  const { isDark } = useAppTheme();
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [preserveQuality, setPreserveQuality] = useState(true);

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
  const accent = '#8E8E93';
  const muted = isDark ? '#888' : '#666';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/grayscale_output.pdf';
    onProgress(20, 'Rendering via MuPDF...');
    await new Promise(r => setTimeout(r, 500));
    onProgress(55, 'Converting to grayscale...');
    await grayscalePdf(selectedFile, outputPath);
    onProgress(85, 'Writing output PDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="Grayscale PDF" subtitle="Remove all colors from PDF" onExecute={handleAction} executeLabel="🖤 Convert to Grayscale">
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
        <Text style={{ color: muted, fontSize: 12 }}>{selectedFile ? 'Tap to change file' : 'Tap to browse'}</Text>
      </TouchableOpacity>

      <View style={[styles.previewRow, { backgroundColor: cardBg }]}>
        <View style={[styles.previewBox, { backgroundColor: '#FF3B30' }]}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>🌈 Before</Text>
          <Text style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>Full color</Text>
        </View>
        <Text style={{ fontSize: 20, color: accent }}>→</Text>
        <View style={[styles.previewBox, { backgroundColor: '#888888' }]}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>🖤 After</Text>
          <Text style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>Grayscale</Text>
        </View>
      </View>

      <View style={[styles.infoBox, { backgroundColor: cardBg }]}>
        <Text style={{ fontSize: 28, marginBottom: 8 }}>🖤</Text>
        <Text style={[styles.infoTitle, { color: textColor }]}>Grayscale Conversion</Text>
        <Text style={{ color: muted, textAlign: 'center', lineHeight: 22 }}>
          রঙিন PDF ফাইলকে সম্পূর্ণ সাদাকালো বা ধূসর রঙে রূপান্তর করুন।
          প্রিন্টিং খরচ কমাতে বিশেষভাবে কাজ করে।
        </Text>
      </View>

      <View style={[styles.featureRow, { backgroundColor: cardBg }]}>
        <View style={styles.featureItem}>
          <Text style={{ fontSize: 24 }}>🖨️</Text>
          <Text style={{ color: textColor, fontSize: 12, fontWeight: '600', marginTop: 4 }}>Save Ink</Text>
          <Text style={{ color: muted, fontSize: 11 }}>Mono print</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={{ fontSize: 24 }}>📦</Text>
          <Text style={{ color: textColor, fontSize: 12, fontWeight: '600', marginTop: 4 }}>Smaller Size</Text>
          <Text style={{ color: muted, fontSize: 11 }}>~20% reduction</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={{ fontSize: 24 }}>⚡</Text>
          <Text style={{ color: textColor, fontSize: 12, fontWeight: '600', marginTop: 4 }}>Fast Process</Text>
          <Text style={{ color: muted, fontSize: 11 }}>MuPDF engine</Text>
        </View>
      </View>
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 16, borderRadius: 14, marginBottom: 14 },
  previewBox: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 8 },
  infoBox: { padding: 24, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  featureRow: { flexDirection: 'row', borderRadius: 14, padding: 16 },
  featureItem: { flex: 1, alignItems: 'center' },
});
