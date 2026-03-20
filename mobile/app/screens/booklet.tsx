import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { createBooklet } from '../utils/nativeModules';

const BINDING_TYPES = [
  { id: 'saddle', label: 'Saddle-Stitch', emoji: '📚', desc: 'Pages folded & stapled in center' },
  { id: 'perfect', label: 'Perfect Bind', emoji: '📖', desc: 'Flat spine, glue-bound' },
];

export default function BookletScreen() {
  const { isDark } = useAppTheme();
  const [binding, setBinding] = useState('saddle');
  const [selectedFile, setSelectedFile] = useState('');

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/booklet_output.pdf';
    onProgress(20, 'Analyzing page count...');
    await new Promise(r => setTimeout(r, 400));
    onProgress(50, 'Rearranging pages for booklet layout...');
    await createBooklet(selectedFile, outputPath, binding);
    onProgress(80, 'Writing output...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="Booklet Print" subtitle="Rearrange pages for booklet printing" onExecute={handleAction} executeLabel="📚 Create Booklet">
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

      <View style={[styles.howBox, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 8 }]}>ℹ️ How it works</Text>
        <Text style={{ color: muted, fontSize: 13, lineHeight: 20 }}>
          Pages are reordered so that when printed double-sided and folded in half, the result is a perfectly ordered booklet. E.g. for 8 pages: Sheet 1 prints pages 8 & 1 on front, 2 & 7 on back.
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>📎 Binding Style</Text>
      {BINDING_TYPES.map(b => (
        <TouchableOpacity
          key={b.id}
          style={[styles.bindCard, { backgroundColor: cardBg, borderColor: binding === b.id ? accent : isDark ? '#333' : '#ddd' }, binding === b.id && { backgroundColor: accent + '15' }]}
          onPress={() => setBinding(b.id)}
        >
          <Text style={{ fontSize: 28, marginRight: 14 }}>{b.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: binding === b.id ? accent : textColor, fontWeight: '600' }}>{b.label}</Text>
            <Text style={{ color: muted, fontSize: 12 }}>{b.desc}</Text>
          </View>
          {binding === b.id && <Text style={{ color: accent, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>
      ))}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  howBox: { padding: 16, borderRadius: 14, marginBottom: 16 },
  bindCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});
