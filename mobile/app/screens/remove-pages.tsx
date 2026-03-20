import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { removePages } from '../utils/nativeModules';
import { pickSinglePdf } from '../utils/filePicker';

export default function RemovePagesScreen() {
  const { isDark } = useAppTheme();
  const [pages] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#FF3B30'; // Red for removal

  const togglePage = (p: number) => {
    const newSet = new Set(selected);
    if (newSet.has(p)) newSet.delete(p);
    else newSet.add(p);
    setSelected(newSet);
  };

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

  const handleAction = async (onProgress: (pct: number, label?: string) => void) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    if (selected.size === 0) throw new Error('ডিলিট করার জন্য অন্তত ১টি পেজ সিলেক্ট করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/removed_pages_output.pdf';
    onProgress(20, 'Loading PDF with QPDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(55, `Removing ${selected.size} pages...`);
    await removePages(selectedFile, outputPath, Array.from(selected));
    onProgress(85, 'Writing output...');
    await new Promise(r => setTimeout(r, 200));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="Remove Pages" subtitle="Select pages to delete" onExecute={handleAction} executeLabel="🗑️ Remove Selected Pages">
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

      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: textColor }]}>🗑️ Select Pages to Remove</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => setSelected(new Set(pages))} testID="button-select-all">
            <Text style={{ color: accent, fontSize: 13, fontWeight: '600' }}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelected(new Set())} testID="button-clear-selection">
            <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: '600' }}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={{ color: muted, fontSize: 12, marginBottom: 12 }}>
        {selected.size > 0
          ? `${selected.size} page${selected.size > 1 ? 's' : ''} selected for removal`
          : 'Tap pages to mark them for removal'}
      </Text>

      <FlatList
        data={pages}
        numColumns={3}
        keyExtractor={item => String(item)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.pageBox,
              { backgroundColor: cardBg, borderColor: selected.has(item) ? accent : isDark ? '#333' : '#ddd' },
              selected.has(item) && { backgroundColor: accent + '22' }
            ]}
            onPress={() => togglePage(item)}
            testID={`button-page-${item}`}
          >
            <Text style={{ fontSize: 18 }}>📄</Text>
            <Text style={{ color: selected.has(item) ? accent : textColor, fontSize: 14, fontWeight: 'bold' }}>{item}</Text>
            {selected.has(item) && <Text style={styles.crossIcon}>✕</Text>}
          </TouchableOpacity>
        )}
      />
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  section: { flex: 1 },
  pickBtn: { padding: 20, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#007AFF', borderStyle: 'dashed' },
  pickText: { fontSize: 16, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 },
  label: { fontSize: 15, fontWeight: '700' },
  pageBox: { flex: 1, aspectRatio: 0.7, margin: 6, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  crossIcon: { position: 'absolute', top: 4, right: 6, color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },
});
