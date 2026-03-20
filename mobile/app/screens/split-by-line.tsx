import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { splitPdf } from '../utils/nativeModules';
import { pickSinglePdf } from '../utils/filePicker';

const SPLIT_MODES = [
  { id: 'line', label: '📏 By Line Count', desc: 'Split when line count is reached' },
  { id: 'paragraph', label: '¶ By Paragraph', desc: 'Split at blank-line separators' },
  { id: 'chapter', label: '📖 By Chapter', desc: 'Split at heading markers' },
];

export default function SplitByLineScreen() {
  const { isDark } = useAppTheme();
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [mode, setMode] = useState('line');
  const [lineCount, setLineCount] = useState('50');
  const [chapterMarker, setChapterMarker] = useState('Chapter');

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const inputBg = isDark ? '#2a2a2a' : '#fff';
  const borderColor = isDark ? '#444' : '#ccc';
  const accent = '#FF9500';
  const muted = isDark ? '#888' : '#999';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputDir = '/storage/emulated/0/Download/PDFPowerTools/split_by_line';
    onProgress(15, 'Extracting text content...');
    await new Promise(r => setTimeout(r, 500));
    onProgress(40, 'Analyzing split points...');
    await new Promise(r => setTimeout(r, 400));
    onProgress(65, 'Splitting with QPDF...');
    const rangeStr = mode === 'line' ? 'line:' + lineCount : mode === 'paragraph' ? 'paragraph' : 'chapter:' + chapterMarker;
    await splitPdf(selectedFile, outputDir, rangeStr);
    onProgress(85, 'Writing split files...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Done!');
    return outputDir;
  };

  return (
    <ToolShell title="Split by Content" subtitle="Split PDF by lines, paragraphs, or chapters" onExecute={handleAction} executeLabel="✂️ Split by Content">
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

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>✂️ Split Method</Text>
      {SPLIT_MODES.map(m => (
        <TouchableOpacity
          key={m.id}
          style={[styles.modeCard, { backgroundColor: cardBg, borderColor: mode === m.id ? accent : isDark ? '#333' : '#ddd' }, mode === m.id && { backgroundColor: accent + '15' }]}
          onPress={() => setMode(m.id)}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: mode === m.id ? accent : textColor, fontWeight: '600' }}>{m.label}</Text>
            <Text style={{ color: muted, fontSize: 12 }}>{m.desc}</Text>
          </View>
          {mode === m.id && <Text style={{ color: accent, fontSize: 18 }}>✓</Text>}
        </TouchableOpacity>
      ))}

      {mode === 'line' && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: textColor, fontWeight: '600', marginBottom: 4 }}>Lines per section</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            value={lineCount}
            onChangeText={setLineCount}
            keyboardType="number-pad"
            placeholder="50"
            placeholderTextColor={muted}
          />
        </View>
      )}
      {mode === 'chapter' && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: textColor, fontWeight: '600', marginBottom: 4 }}>Chapter heading keyword</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBg, color: textColor, borderColor }]}
            value={chapterMarker}
            onChangeText={setChapterMarker}
            placeholder="Chapter"
            placeholderTextColor={muted}
          />
        </View>
      )}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  modeCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16 },
});
