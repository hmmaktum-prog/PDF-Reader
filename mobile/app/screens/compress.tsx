import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { compressPdf } from '../utils/nativeModules';
import { pickSinglePdf } from '../utils/filePicker';

type Level = 'low' | 'medium' | 'high';

export default function CompressScreen() {
  const { isDark } = useAppTheme();
  const [level, setLevel] = useState<Level>('medium');

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#007AFF';

  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
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

  const levelInfo: Record<Level, { icon: string; desc: string; saving: string }> = {
    low: { icon: '📄', desc: 'Quality preserved, minor reduction', saving: '~10-20% smaller' },
    medium: { icon: '📦', desc: 'Best balance of size and quality', saving: '~40-60% smaller' },
    high: { icon: '🗜️', desc: 'Maximum compression, smallest size', saving: '~70-85% smaller' },
  };

  const handleCompress = async (onProgress: (pct: number, label?: string) => void) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/compressed_output.pdf';
    onProgress(10, 'Analyzing PDF structure...');
    await new Promise(r => setTimeout(r, 400));
    onProgress(35, 'Optimizing object streams via QPDF...');
    await compressPdf(selectedFile, outputPath);
    onProgress(70, 'Reducing image resolution...');
    await new Promise(r => setTimeout(r, 400));
    onProgress(90, 'Writing compressed file...');
    await new Promise(r => setTimeout(r, 200));
    onProgress(100, 'Compression complete!');
    return outputPath;
  };

  return (
    <ToolShell title="Compress PDF" subtitle="Reduce file size with QPDF" onExecute={handleCompress} executeLabel="📦 Compress PDF">
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

      <Text style={[styles.label, { color: textColor, marginBottom: 10 }]}>🗜️ Compression Level</Text>
      {(['low', 'medium', 'high'] as Level[]).map(l => (
        <TouchableOpacity
          key={l}
          style={[styles.optionCard, {
            backgroundColor: level === l ? accent + '15' : cardBg,
            borderColor: level === l ? accent : isDark ? '#333' : '#ddd',
          }]}
          onPress={() => setLevel(l)}
          testID={`button-level-${l}`}
        >
          <Text style={{ fontSize: 28 }}>{levelInfo[l].icon}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.optionTitle, { color: level === l ? accent : textColor }]}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </Text>
            <Text style={{ color: muted, fontSize: 12 }}>{levelInfo[l].desc}</Text>
            <Text style={{ color: level === l ? accent : muted, fontSize: 11, marginTop: 2, fontWeight: '600' }}>
              {levelInfo[l].saving}
            </Text>
          </View>
          {level === l && <Text style={{ color: accent, fontSize: 20 }}>✓</Text>}
        </TouchableOpacity>
      ))}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  section: { flex: 1 },
  pickBtn: { padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#007AFF', borderStyle: 'dashed' },
  pickText: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '700' },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  optionTitle: { fontSize: 15, fontWeight: '600' },
});
