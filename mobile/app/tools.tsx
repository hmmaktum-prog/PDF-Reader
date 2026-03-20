import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from './context/ThemeContext';
import * as Haptics from 'expo-haptics';

const TOOL_SECTIONS = [
  {
    title: 'Edit & Organize',
    emoji: '✏️',
    color: '#007AFF',
    data: [
      { id: 'merge',        name: 'Merge PDF',      icon: '🔗', route: '/screens/merge',        desc: 'Combine multiple PDFs into one',       color: '#007AFF' },
      { id: 'split',        name: 'Split PDF',       icon: '✂️', route: '/screens/split',        desc: 'Split PDF into separate files',        color: '#FF9500' },
      { id: 'split-by-line',name: 'Split by Line',  icon: '📐', route: '/screens/split-by-line', desc: 'Draw a line to split pages',           color: '#FF6B35' },
      { id: 'rotate',       name: 'Rotate Pages',   icon: '🔄', route: '/screens/rotate',        desc: 'Rotate pages to any angle',           color: '#5AC8FA' },
      { id: 'compress',     name: 'Compress',        icon: '📦', route: '/screens/compress',      desc: 'Reduce file size without quality loss',color: '#34C759' },
      { id: 'organize',     name: 'Organize',        icon: '📋', route: '/screens/organize',      desc: 'Reorder pages via drag & drop',       color: '#32ADE6' },
      { id: 'remove-pages', name: 'Remove Pages',   icon: '🗑️', route: '/screens/remove-pages',  desc: 'Delete unwanted pages',               color: '#FF3B30' },
    ],
  },
  {
    title: 'Convert',
    emoji: '🔄',
    color: '#AF52DE',
    data: [
      { id: 'image-to-pdf', name: 'Image → PDF',    icon: '🖼️', route: '/screens/image-to-pdf',  desc: 'Convert images to PDF document',      color: '#FF2D55' },
      { id: 'pdf-to-image', name: 'PDF → Image',    icon: '📸', route: '/screens/pdf-to-image',  desc: 'Export pages as PNG/JPG images',      color: '#AF52DE' },
    ],
  },
  {
    title: 'Visual Effects',
    emoji: '🎨',
    color: '#FF9500',
    data: [
      { id: 'invert',          name: 'Invert Colors',    icon: '🌗', route: '/screens/invert',          desc: 'Dark mode for any PDF',              color: '#FF6B35' },
      { id: 'whitener',        name: 'Whitener',          icon: '🧹', route: '/screens/whitener',        desc: 'Remove dark backgrounds',            color: '#34C759' },
      { id: 'enhance-contrast',name: 'Enhance Contrast', icon: '🔲', route: '/screens/enhance-contrast', desc: 'Sharpen faded or scanned PDFs',     color: '#007AFF' },
      { id: 'grayscale',       name: 'Grayscale',         icon: '🖤', route: '/screens/grayscale',       desc: 'Convert to black and white',         color: '#8e8e93' },
    ],
  },
  {
    title: 'AI & Text',
    emoji: '🤖',
    color: '#34C759',
    data: [
      { id: 'ocr', name: 'AI OCR', icon: '🤖', route: '/screens/ocr', desc: 'Extract text with Gemini AI or PaddleOCR', color: '#AF52DE' },
    ],
  },
  {
    title: 'Advanced Layout',
    emoji: '📐',
    color: '#FF2D55',
    data: [
      { id: 'nup',             name: 'N-Up Layout',      icon: '🔢', route: '/screens/nup',             desc: 'Multiple pages per sheet',          color: '#007AFF' },
      { id: 'booklet',         name: 'Booklet',           icon: '📖', route: '/screens/booklet',         desc: 'Create printable booklets',         color: '#FF9500' },
      { id: 'four-up-booklet', name: '4-Up Booklet',     icon: '📓', route: '/screens/four-up-booklet', desc: 'Pocket-size 4-page booklet',        color: '#FF2D55' },
      { id: 'resize',          name: 'Resize Pages',     icon: '📏', route: '/screens/resize',          desc: 'Change page dimensions',            color: '#5AC8FA' },
      { id: 'repair',          name: 'Repair PDF',       icon: '🔧', route: '/screens/repair',          desc: 'Fix corrupted PDF files',           color: '#34C759' },
      { id: 'auto-process',    name: 'Auto Process',     icon: '⚡', route: '/screens/auto-process',    desc: 'Pipeline automation for batch tasks',color: '#FF6B35' },
    ],
  },
];

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  const bg      = isDark ? '#000000' : '#f2f2f7';
  const cardBg  = isDark ? '#1c1c1e' : '#ffffff';
  const text    = isDark ? '#ffffff' : '#000000';
  const muted   = isDark ? '#8e8e93' : '#6c6c70';
  const border  = isDark ? '#2c2c2e' : '#e5e5ea';

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />
      <SectionList
        sections={TOOL_SECTIONS}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 8, paddingHorizontal: 14 }}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}>
            <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
            <Text style={styles.sectionEmoji}>{section.emoji}</Text>
            <Text style={[styles.sectionTitle, { color: text }]}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(item.route as any);
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBg, { backgroundColor: item.color + '18' }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: text }]}>{item.name}</Text>
              <Text style={[styles.cardDesc, { color: muted }]}>{item.desc}</Text>
            </View>
            <Text style={[styles.arrow, { color: muted }]}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  sectionHead: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 22, marginBottom: 10, paddingLeft: 2,
  },
  sectionDot:   { width: 4, height: 16, borderRadius: 2, marginRight: 8 },
  sectionEmoji: { fontSize: 15, marginRight: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },

  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, marginBottom: 8, borderRadius: 14, borderWidth: 1,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  iconBg:   { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  icon:     { fontSize: 24 },
  cardBody: { flex: 1 },
  cardTitle:{ fontSize: 15, fontWeight: '600', marginBottom: 2 },
  cardDesc: { fontSize: 12, lineHeight: 16 },
  arrow:    { fontSize: 26, fontWeight: '300', marginLeft: 4 },
});
