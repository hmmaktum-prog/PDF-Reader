import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { whiteningPdf } from '../utils/nativeModules';

const LEVELS = [
  { val: 1, label: 'Light', desc: 'Subtle, preserves original tone' },
  { val: 2, label: 'Medium', desc: 'Best balance (recommended)' },
  { val: 3, label: 'Strong', desc: 'Pure white background' },
];

export default function WhitenerScreen() {
  const { isDark } = useAppTheme();
  const [selectedFile, setSelectedFile] = useState('');
  const [strength, setStrength] = useState(2);

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#666';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/whitened_output.pdf';
    onProgress(20, 'Rendering pages with MuPDF...');
    await new Promise(r => setTimeout(r, 500));
    onProgress(55, 'Applying background whitening...');
    await whiteningPdf(selectedFile, outputPath, strength);
    onProgress(85, 'Writing output...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="Whitener" subtitle="Remove yellow tint from scanned books" onExecute={handleAction} executeLabel="🧹 Whiten Background">
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={() => setSelectedFile('/mock/document.pdf')}
        testID="button-pick-file"
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>📁</Text>
        <Text style={[styles.pickText, { color: textColor }]}>
          {selectedFile ? selectedFile.split('/').pop() : 'Select Scanned PDF'}
        </Text>
        <Text style={{ color: muted, fontSize: 12 }}>Tap to browse</Text>
      </TouchableOpacity>

      <View style={[styles.previewRow, { backgroundColor: cardBg }]}>
        <View style={[styles.previewBox, { backgroundColor: '#f5e8c0' }]}>
          <Text style={{ color: '#5a4200', fontSize: 13, fontWeight: '600' }}>📜 Before</Text>
          <Text style={{ color: '#5a4200', fontSize: 11, marginTop: 4 }}>Yellowed scan</Text>
        </View>
        <Text style={{ fontSize: 20, color: accent }}>→</Text>
        <View style={[styles.previewBox, { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#ddd' }]}>
          <Text style={{ color: '#000', fontSize: 13, fontWeight: '600' }}>✨ After</Text>
          <Text style={{ color: '#000', fontSize: 11, marginTop: 4 }}>Pure white bg</Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>⚡ Whitening Strength</Text>
      {LEVELS.map(l => (
        <TouchableOpacity
          key={l.val}
          style={[
            styles.levelCard,
            { backgroundColor: cardBg, borderColor: strength === l.val ? accent : isDark ? '#333' : '#ddd' },
            strength === l.val && { backgroundColor: accent + '15' },
          ]}
          onPress={() => setStrength(l.val)}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: strength === l.val ? accent : textColor, fontWeight: '600' }}>{l.label}</Text>
            <Text style={{ color: muted, fontSize: 12 }}>{l.desc}</Text>
          </View>
          {strength === l.val && <Text style={{ color: accent, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>
      ))}

      <View style={[styles.tipBox, { backgroundColor: isDark ? '#1a1a2e' : '#e6f2ff' }]}>
        <Text style={{ color: textColor, fontSize: 13 }}>
          💡 Best for: Scanned textbooks, photocopied handouts, old documents
        </Text>
      </View>
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', padding: 16, borderRadius: 14, marginBottom: 14 },
  previewBox: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 8 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  levelCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  tipBox: { padding: 14, borderRadius: 12, marginTop: 8 },
});
