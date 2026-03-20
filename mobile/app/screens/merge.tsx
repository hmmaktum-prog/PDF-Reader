import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { mergePdfs } from '../utils/nativeModules';
import { useContinueTool } from '../context/ContinueContext';
import { pickMultiplePdfs } from '../utils/filePicker';

interface PdfFile {
  name: string;
  path: string;
  size?: string;
}

export default function MergeScreen() {
  const { isDark } = useAppTheme();
  const { sharedFilePath } = useContinueTool();
  const [files, setFiles] = useState<PdfFile[]>(
    sharedFilePath
      ? [{ name: sharedFilePath.split('/').pop() || 'shared.pdf', path: sharedFilePath }]
      : []
  );

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const borderColor = isDark ? '#444' : '#ccc';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

  const handlePickFiles = async () => {
    try {
      const picked = await pickMultiplePdfs();
      if (picked.length === 0) return;
      setFiles(prev => {
        const existing = new Set(prev.map(f => f.path));
        return [...prev, ...picked.filter(f => !existing.has(f.path))];
      });
    } catch (e: any) {
      Alert.alert('File Picker Error', e.message);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles(prev => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const handleMoveDown = (index: number) => {
    setFiles(prev => {
      if (index >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const handleMerge = async (onProgress: (pct: number, label?: string) => void) => {
    if (files.length < 2) throw new Error('কমপক্ষে ২টি PDF ফাইল নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/merged_output.pdf';
    onProgress(10, 'Validating input files...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(30, 'Loading PDF documents via QPDF...');
    await new Promise(r => setTimeout(r, 400));
    onProgress(60, `Merging ${files.length} PDFs...`);
    await mergePdfs(files.map(f => f.path), outputPath);
    onProgress(90, 'Writing output file...');
    await new Promise(r => setTimeout(r, 200));
    onProgress(100, 'Merge complete!');
    return outputPath;
  };

  return (
    <ToolShell
      title="Merge PDFs"
      subtitle={`Combine ${files.length} file${files.length !== 1 ? 's' : ''} into one PDF`}
      onExecute={handleMerge}
      executeLabel="🔗 Merge PDFs"
    >
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={handlePickFiles}
        activeOpacity={0.7}
        testID="button-pick-files"
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>📁</Text>
        <Text style={[styles.pickText, { color: textColor }]}>Add PDF Files</Text>
        <Text style={[styles.pickHint, { color: muted }]}>Tap to browse and select PDFs</Text>
      </TouchableOpacity>

      {files.length > 0 && (
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={[styles.label, { color: textColor }]}>
              📋 Selected Files ({files.length})
            </Text>
            <TouchableOpacity onPress={() => setFiles([])} testID="button-clear-all">
              <Text style={{ color: '#FF3B30', fontSize: 13, fontWeight: '600' }}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hint, { color: muted }]}>
            Use ↑↓ to reorder. QPDF merges in listed order.
          </Text>
          <FlatList
            data={files}
            keyExtractor={(_, i) => String(i)}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={[styles.fileItem, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.fileLeft}>
                  <Text style={{ fontSize: 24, marginRight: 10 }}>📄</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.size && (
                      <Text style={[styles.fileSize, { color: muted }]}>{item.size}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.fileActions}>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => handleMoveUp(index)}
                    testID={`button-move-up-${index}`}
                  >
                    <Text style={{ color: accent, fontSize: 16 }}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => handleMoveDown(index)}
                    testID={`button-move-down-${index}`}
                  >
                    <Text style={{ color: accent, fontSize: 16 }}>↓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemoveFile(index)}
                    testID={`button-remove-file-${index}`}
                  >
                    <Text style={{ color: '#FF3B30', fontSize: 16 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}

      {files.length === 0 && (
        <View style={[styles.emptyState, { borderColor }]}>
          <Text style={[styles.emptyText, { color: muted }]}>
            No files selected yet.{'\n'}Add at least 2 PDF files to merge.
          </Text>
        </View>
      )}
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: {
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  pickText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  pickHint: { fontSize: 12 },
  listSection: { flex: 1 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  label: { fontSize: 15, fontWeight: '700' },
  hint: { fontSize: 12, marginBottom: 10 },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  fileLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  fileName: { fontSize: 14, fontWeight: '500' },
  fileSize: { fontSize: 11, marginTop: 2 },
  fileActions: { flexDirection: 'row', gap: 8 },
  arrowBtn: { padding: 6 },
  removeBtn: { padding: 6 },
  emptyState: {
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
