import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Switch } from 'react-native';
import ToolShell from '../components/ToolShell';
import { useAppTheme } from '../context/ThemeContext';
import { imagesToPdf } from '../utils/nativeModules';

type PageSize = 'A4' | 'Letter' | 'Fit';

export default function ImageToPdfScreen() {
  const { isDark } = useAppTheme();
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('A4');
  const [autoMargin, setAutoMargin] = useState(true);

  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1e1e1e' : '#f0f0f0';
  const accent = '#007AFF';
  const muted = isDark ? '#888' : '#999';

  const PAGE_SIZES = [
    { id: 'A4', label: 'A4', sub: '210×297mm' },
    { id: 'Letter', label: 'Letter', sub: '8.5×11in' },
    { id: 'Fit', label: 'Fit Image', sub: 'Auto-size' },
  ];

  const handlePickImages = () => {
    setImages([
      { id: '1', uri: 'photo_1.jpg' },
      { id: '2', uri: 'photo_2.jpg' },
      { id: '3', uri: 'screenshot.png' },
    ]);
  };

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id));

  const handleAction = async (onProgress) => {
    if (images.length === 0) throw new Error('অন্তত ১টি ছবি নির্বাচন করুন');
    const outputPath = '/storage/emulated/0/Download/PDFPowerTools/images_output.pdf';
    onProgress(10, 'Preparing images...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(40, `Adding ${images.length} image${images.length > 1 ? 's' : ''} to PDF...`);
    await imagesToPdf(images.map(i => i.uri), outputPath, pageSize, autoMargin);
    onProgress(80, 'Writing PDF...');
    await new Promise(r => setTimeout(r, 300));
    onProgress(100, 'Done!');
    return outputPath;
  };

  return (
    <ToolShell title="Image to PDF" subtitle="Convert photos to PDF document" onExecute={handleAction} executeLabel="🖼️ Create PDF">
      <TouchableOpacity
        style={[styles.pickBtn, { backgroundColor: cardBg, borderColor: accent }]}
        onPress={handlePickImages}
        testID="button-pick-images"
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 30, marginBottom: 6 }}>🖼️</Text>
        <Text style={[styles.pickText, { color: textColor }]}>Select Images from Gallery</Text>
        <Text style={{ color: muted, fontSize: 12 }}>JPG, PNG, WEBP supported</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={[styles.sectionLabel, { color: textColor }]}>{images.length} image{images.length > 1 ? 's' : ''} selected</Text>
            <TouchableOpacity onPress={() => setImages([])} testID="button-clear-images">
              <Text style={{ color: '#FF3B30', fontSize: 13 }}>Clear all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={images}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <View style={[styles.imgCard, { backgroundColor: cardBg }]}>
                <Text style={{ fontSize: 28, marginBottom: 4 }}>📸</Text>
                <Text style={{ color: muted, fontSize: 10 }} numberOfLines={1}>{item.uri}</Text>
                <TouchableOpacity onPress={() => removeImage(item.id)} style={styles.removeBtn}>
                  <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <Text style={[styles.sectionLabel, { color: textColor, marginBottom: 10 }]}>📄 Page Size</Text>
      <View style={styles.sizeRow}>
        {PAGE_SIZES.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.sizeCard, { backgroundColor: cardBg, borderColor: pageSize === s.id ? accent : isDark ? '#444' : '#ccc' }, pageSize === s.id && { backgroundColor: accent + '22' }]}
            onPress={() => setPageSize(s.id)}
          >
            <Text style={{ color: pageSize === s.id ? accent : textColor, fontWeight: '600' }}>{s.label}</Text>
            <Text style={{ color: muted, fontSize: 11 }}>{s.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.toggleRow, { backgroundColor: cardBg }]}
        onPress={() => setAutoMargin(!autoMargin)}
        testID="button-toggle-margin"
      >
        <View>
          <Text style={{ color: textColor, fontWeight: '600' }}>Add White Margins</Text>
          <Text style={{ color: muted, fontSize: 12 }}>Add padding around each image</Text>
        </View>
        <View style={[styles.toggleOuter, { backgroundColor: autoMargin ? accent : isDark ? '#555' : '#ccc' }]}>
          <View style={[styles.toggleThumb, { marginLeft: autoMargin ? 22 : 2 }]} />
        </View>
      </TouchableOpacity>
    </ToolShell>
  );
}

const styles = StyleSheet.create({
  pickBtn: { padding: 24, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', marginBottom: 16 },
  pickText: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  imgCard: { width: 90, height: 110, borderRadius: 10, marginRight: 10, alignItems: 'center', justifyContent: 'center', position: 'relative', borderWidth: 1, borderColor: '#ccc' },
  removeBtn: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: '#00000033', justifyContent: 'center', alignItems: 'center' },
  sizeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  sizeCard: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12 },
  toggleOuter: { width: 46, height: 26, borderRadius: 13, justifyContent: 'center' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
});
