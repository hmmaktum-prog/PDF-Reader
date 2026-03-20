import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { resizePdf } from '../utils/nativeModules';

const PAGE_SIZES = [
  { id: 'A4', label: 'A4', w: 595, h: 842, desc: '210×297 mm' },
  { id: 'A3', label: 'A3', w: 842, h: 1191, desc: '297×420 mm' },
  { id: 'Letter', label: 'Letter', w: 612, h: 792, desc: '8.5×11 in' },
  { id: 'Legal', label: 'Legal', w: 612, h: 1008, desc: '8.5×14 in' },
  { id: 'Custom', label: 'Custom', w: 0, h: 0, desc: 'Enter dimensions' },
];

export default function ResizeScreen() {
  const { isDark } = useAppTheme();
  const [targetSize, setTargetSize] = useState(PAGE_SIZES[0]);
  const [customW, setCustomW] = useState('595');
  const [customH, setCustomH] = useState('842');
  const [selectedFile, setSelectedFile] = useState('');

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const inputBg = isDark ? '#2a2a2a' : '#fff';
  const borderColor = isDark ? '#444' : '#ccc';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/resized_output.pdf';
    const w = targetSize.id === 'Custom' ? parseInt(customW) : targetSize.w;
    const h = targetSize.id === 'Custom' ? parseInt(customH) : targetSize.h;
    onProgress(20, 'Loading PDF with QPDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(55, 'Resizing page dimensions...');
    await resizePdf(selectedFile, outputPath, w, h);
    onProgress(85, 'Writing output...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="Resize PDF" subtitle="Change page dimensions" onExecute={handleAction} executeLabel="📐 Resize Pages">
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={() => setSelectedFile('/mock/document.pdf')}
        testID="button-pick-file"
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>📁</Text>
        <Text style={[styles.pickText, { color: textColor }]}>
          {selectedFile ? selectedFile.split('/').pop() : 'Select PDF File'}
        </Text>
        <Text style={{ color: muted, fontSize: 12 }}>Tap to browse</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>📐 Target Page Size</Text>
      <View style={styles.sizeGrid}>
        {PAGE_SIZES.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.sizeCard, { backgroundColor: cardBg, borderColor: targetSize.id === s.id ? accent : isDark ? '#444' : '#ccc' }, targetSize.id === s.id && { backgroundColor: accent + '22' }]}
            onPress={() => setTargetSize(s)}
          >
            <Text style={{ color: targetSize.id === s.id ? accent : textColor, fontWeight: '700' }}>{s.label}</Text>
            <Text style={{ color: muted, fontSize: 11, marginTop: 2 }}>{s.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {targetSize.id === 'Custom' && (
        <View style={[styles.customBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>Custom Dimensions (pts)</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: muted, fontSize: 12, marginBottom: 4 }}>Width</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={customW}
                onChangeText={setCustomW}
                keyboardType="number-pad"
                placeholder="595"
                placeholderTextColor={muted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: muted, fontSize: 12, marginBottom: 4 }}>Height</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
                value={customH}
                onChangeText={setCustomH}
                keyboardType="number-pad"
                placeholder="842"
                placeholderTextColor={muted}
              />
            </View>
          </View>
          <Text style={{ color: muted, fontSize: 11, marginTop: 8 }}>1 pt = 1/72 inch. A4 = 595×842 pts</Text>
        </View>
      )}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  sizeCard: { width: '47%', padding: 12, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  customBox: { padding: 16, borderRadius: 14, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16, textAlign: 'center' },
});
