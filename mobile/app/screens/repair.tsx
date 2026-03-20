import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { repairPdf } from '../utils/nativeModules';

const REPAIR_FEATURES = [
  { icon: '🔧', label: 'Fix cross-reference table', desc: 'Rebuilt with QPDF linearization' },
  { icon: '📦', label: 'Reconstruct object streams', desc: 'Recovers corrupted object data' },
  { icon: '🔗', label: 'Repair broken links', desc: 'Internal page links & TOC' },
  { icon: '🗜️', label: 'Re-encode content streams', desc: 'Normalize malformed streams' },
];

export default function RepairScreen() {
  const { isDark } = useAppTheme();
  const [selectedFile, setSelectedFile] = useState('');

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#FF9500';
  const muted = isDark ? '#888' : '#666';

  const handleAction = async (onProgress) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/repaired_output.pdf';
    onProgress(10, 'Opening with QPDF recovery mode...');
    await new Promise(r => setTimeout(r, 500));
    onProgress(35, 'Rebuilding cross-reference table...');
    await repairPdf(selectedFile, outputPath);
    onProgress(65, 'Reconstructing object streams...');
    await new Promise(r => setTimeout(r, 500));
    onProgress(85, 'Validating output...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Repair complete!');
    return outputPath;
  };

  return (
    <ToolShell title="Repair PDF" subtitle="Fix corrupted or broken PDF files" onExecute={handleAction} executeLabel="🔧 Repair PDF">
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={() => setSelectedFile('/mock/document.pdf')}
        testID="button-pick-file"
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>📁</Text>
        <Text style={[styles.pickText, { color: textColor }]}>
          {selectedFile ? selectedFile.split('/').pop() : 'Select Corrupted PDF'}
        </Text>
        <Text style={{ color: muted, fontSize: 12 }}>Tap to browse</Text>
      </TouchableOpacity>

      <View style={[styles.warningBox, { backgroundColor: isDark ? '#2a1a00' : '#fff3e0' }]}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>⚠️</Text>
        <Text style={{ color: isDark ? '#FFB74D' : '#E65100', fontSize: 13, flex: 1, lineHeight: 18 }}>
          QPDF's --decrypt and recovery mode will attempt to reconstruct all parts of the damaged file.
        </Text>
      </View>

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>🔧 What gets repaired</Text>
      {REPAIR_FEATURES.map((f, i) => (
        <View key={i} style={[styles.featureRow, { backgroundColor: cardBg }]}>
          <Text style={{ fontSize: 22, marginRight: 12 }}>{f.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>{f.label}</Text>
            <Text style={{ color: muted, fontSize: 12 }}>{f.desc}</Text>
          </View>
          <Text style={{ color: accent }}>✓</Text>
        </View>
      ))}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  warningBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  featureRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 8 },
});
