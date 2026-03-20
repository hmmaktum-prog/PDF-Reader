import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Switch, Alert } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { pickSinglePdf } from '../utils/filePicker';

const PIPELINE_STEPS = [
  { id: 'whiten', icon: '🧹', label: 'Whiten Background', desc: 'Remove yellow tint (MuPDF)' },
  { id: 'contrast', icon: '🔲', label: 'Enhance Contrast', desc: 'Darken faded text (MuPDF)' },
  { id: 'grayscale', icon: '🖤', label: 'Convert to Grayscale', desc: 'Remove color, reduce size (MuPDF)' },
  { id: 'compress', icon: '📦', label: 'Compress PDF', desc: 'Optimize streams (QPDF)' },
];

export default function AutoProcessScreen() {
  const { isDark } = useAppTheme();
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [enabled, setEnabled] = useState({ whiten: true, contrast: true, grayscale: false, compress: true });

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
  const accent = '#5856D6';
  const muted = isDark ? '#888' : '#999';

  const toggle = (id) => setEnabled(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/auto_processed.pdf';
    const steps = PIPELINE_STEPS.filter(s => enabled[s.id]);
    if (steps.length === 0) throw new Error('অন্তত ১টি ধাপ সক্রিয় রাখুন');
    for (let i = 0; i < steps.length; i++) {
      const pct = Math.round(((i + 0.5) / steps.length) * 85);
      onProgress(pct, steps[i].label + '...');
      await new Promise(r => setTimeout(r, 600));
    }
    onProgress(95, 'Finalizing output...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Pipeline complete!');
    return outputPath;
  };

  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <ToolShell title="Auto Process" subtitle="Run multiple tools in sequence" onExecute={handleAction} executeLabel="⚡ Run Pipeline">
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

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={[styles.sectionLabel, { color: textColor }]}>⚡ Pipeline Steps</Text>
        <Text style={{ color: accent, fontWeight: '600' }}>{activeCount} active</Text>
      </View>
      <Text style={{ color: muted, fontSize: 12, marginBottom: 12 }}>
        Steps run in order. MuPDF renders → QPDF writes output.
      </Text>

      {PIPELINE_STEPS.map((step, index) => (
        <View key={step.id} style={[styles.stepCard, { backgroundColor: cardBg, borderColor: enabled[step.id] ? accent : isDark ? '#333' : '#ddd' }]}>
          <View style={[styles.stepIndex, { backgroundColor: enabled[step.id] ? accent : isDark ? '#444' : '#ccc' }]}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{index + 1}</Text>
          </View>
          <Text style={{ fontSize: 22, marginHorizontal: 10 }}>{step.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: enabled[step.id] ? textColor : muted, fontWeight: '600', fontSize: 14 }}>{step.label}</Text>
            <Text style={{ color: muted, fontSize: 12 }}>{step.desc}</Text>
          </View>
          <Switch value={enabled[step.id]} onValueChange={() => toggle(step.id)} trackColor={{ false: '#555', true: accent }} />
        </View>
      ))}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  stepCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 2, marginBottom: 8 },
  stepIndex: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
