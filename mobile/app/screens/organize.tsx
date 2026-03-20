import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { reorderPages } from '../utils/nativeModules';
import { pickSinglePdf } from '../utils/filePicker';

export default function OrganizeScreen() {
  const { isDark } = useAppTheme();
  const [pages, setPages] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

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
  const borderColor = isDark ? '#444' : '#ddd';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

  const movePage = (from: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= pages.length) return;
    const arr = [...pages];
    [arr[from], arr[to]] = [arr[to], arr[from]];
    setPages(arr);
  };

  const handleOrganize = async (onProgress: (pct: number, label?: string) => void) => {
    if (!selectedFile) throw new Error('প্রথমে একটি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/organized_output.pdf';
    onProgress(20, 'Loading PDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(55, 'Reordering pages with QPDF...');
    await reorderPages(selectedFile, outputPath, pages);
    onProgress(85, 'Writing output...');
    await new Promise(r => setTimeout(r, 200));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="Organize Pages" subtitle="Reorder pages by dragging" onExecute={handleOrganize} executeLabel="📋 Save New Order">
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

      <View style={styles.listHeader}>
        <Text style={[styles.label, { color: textColor }]}>📋 Page Order ({pages.length} pages)</Text>
        <TouchableOpacity onPress={() => setPages([...pages].sort((a,b) => a-b))} testID="button-reset-order">
          <Text style={{ color: accent, fontSize: 13, fontWeight: '600' }}>Reset</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: muted, fontSize: 12, marginBottom: 12 }}>
        Use ↑↓ buttons to reorder. QPDF will write in this order.
      </Text>

      <FlatList
        data={pages}
        keyExtractor={(_, i) => String(i)}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={[styles.pageRow, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.indexBadge, { backgroundColor: accent + '22' }]}>
              <Text style={{ color: accent, fontWeight: 'bold', fontSize: 14 }}>{index + 1}</Text>
            </View>
            <Text style={{ fontSize: 20, marginHorizontal: 12 }}>📄</Text>
            <Text style={[styles.pageName, { color: textColor }]}>Page {item}</Text>
            <View style={styles.pageActions}>
              <TouchableOpacity onPress={() => movePage(index, 'up')} style={styles.arrowBtn} testID={`button-up-${index}`}>
                <Text style={{ color: index === 0 ? (isDark ? '#444' : '#ccc') : accent, fontSize: 18 }}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => movePage(index, 'down')} style={styles.arrowBtn} testID={`button-down-${index}`}>
                <Text style={{ color: index === pages.length - 1 ? (isDark ? '#444' : '#ccc') : accent, fontSize: 18 }}>↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '700' },
  pageRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  indexBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  pageName: { flex: 1, fontSize: 14, fontWeight: '500' },
  pageActions: { flexDirection: 'row', gap: 4 },
  arrowBtn: { padding: 8 },
});
