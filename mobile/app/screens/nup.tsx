import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { nupLayout } from '../utils/nativeModules';

const LAYOUTS = [
  { id: '2x1', label: '2-Up', emoji: '📖', desc: '2 pages side by side', cols: 2, rows: 1 },
  { id: '2x2', label: '4-Up', emoji: '🪟', desc: '4 pages in a 2×2 grid', cols: 2, rows: 2 },
  { id: '3x2', label: '6-Up', emoji: '🗃️', desc: '6 pages in a 3×2 grid', cols: 3, rows: 2 },
  { id: '4x2', label: '8-Up', emoji: '📋', desc: '8 pages in a 4×2 grid', cols: 4, rows: 2 },
];

export default function NupScreen() {
  const { isDark } = useAppTheme();
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [selectedFile, setSelectedFile] = useState('');

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/nup_output.pdf';
    onProgress(20, 'Loading PDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(55, 'Arranging pages with QPDF...');
    await nupLayout(selectedFile, outputPath, layout.cols, layout.rows);
    onProgress(85, 'Writing output...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="N-Up Layout" subtitle="Multiple pages per printed sheet" onExecute={handleAction} executeLabel="🪟 Apply N-Up Layout">
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

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>🪟 Layout</Text>
      <View style={styles.layoutGrid}>
        {LAYOUTS.map(l => (
          <TouchableOpacity
            key={l.id}
            style={[styles.layoutCard, { backgroundColor: cardBg, borderColor: layout.id === l.id ? accent : isDark ? '#444' : '#ccc' }, layout.id === l.id && { backgroundColor: accent + '22' }]}
            onPress={() => setLayout(l)}
          >
            <Text style={{ fontSize: 26, marginBottom: 4 }}>{l.emoji}</Text>
            <Text style={{ color: layout.id === l.id ? accent : textColor, fontWeight: '700', fontSize: 15 }}>{l.label}</Text>
            <Text style={{ color: muted, fontSize: 11, textAlign: 'center', marginTop: 2 }}>{l.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.previewBox, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>👁 Preview</Text>
        <View style={styles.previewGrid}>
          {Array.from({ length: layout.cols * layout.rows }).map((_, i) => (
            <View
              key={i}
              style={[styles.miniPage, { borderColor: isDark ? '#555' : '#ccc', width: (80 / layout.cols), height: (80 / layout.cols * 1.4) }]}
            >
              <Text style={{ color: muted, fontSize: 8 }}>{i + 1}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: muted, fontSize: 12, marginTop: 8 }}>
          {layout.cols * layout.rows} pages per sheet • Saves {Math.round((1 - 1/(layout.cols * layout.rows)) * 100)}% paper
        </Text>
      </View>
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  layoutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  layoutCard: { width: '47%', padding: 14, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  previewBox: { padding: 16, borderRadius: 14, alignItems: 'center' },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  miniPage: { borderWidth: 1, borderRadius: 2, justifyContent: 'center', alignItems: 'center' },
});
