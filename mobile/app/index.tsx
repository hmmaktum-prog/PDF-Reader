import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from './context/ThemeContext';
import { useContinueTool } from './context/ContinueContext';

const QUICK_TOOLS = [
  { id: 'merge', name: 'Merge', icon: '🔗', route: '/screens/merge', color: '#007AFF' },
  { id: 'split', name: 'Split', icon: '✂️', route: '/screens/split', color: '#FF9500' },
  { id: 'compress', name: 'Compress', icon: '📦', route: '/screens/compress', color: '#34C759' },
  { id: 'ocr', name: 'AI OCR', icon: '🤖', route: '/screens/ocr', color: '#AF52DE' },
  { id: 'image-to-pdf', name: 'Img→PDF', icon: '🖼️', route: '/screens/image-to-pdf', color: '#FF2D55' },
  { id: 'rotate', name: 'Rotate', icon: '🔄', route: '/screens/rotate', color: '#5AC8FA' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { isDark, theme, setTheme } = useAppTheme();
  const { sharedFilePath, clearState } = useContinueTool();

  const bg = isDark ? '#0d0d0d' : '#f2f2f7';
  const cardBg = isDark ? '#1c1c1e' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const muted = isDark ? '#8e8e93' : '#6c6c70';
  const accent = '#007AFF';

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌗';

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={bg}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <View style={[styles.heroCard, { backgroundColor: accent }]}>
          <TouchableOpacity style={styles.themeToggle} onPress={cycleTheme} testID="button-theme-toggle">
            <Text style={styles.themeIcon}>{themeIcon}</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>PDF Power Tools</Text>
          <Text style={styles.heroSub}>Offline QPDF + MuPDF NDK Engine</Text>
          <View style={styles.heroTags}>
            <View style={styles.tag}><Text style={styles.tagText}>⚡ Ultra Fast</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>📴 Offline First</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>🔒 Privacy Safe</Text></View>
          </View>
        </View>

        {/* Shared File Banner */}
        {sharedFilePath && (
          <View style={[styles.continueBanner, { backgroundColor: '#FF950020', borderColor: '#FF9500' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FF9500', fontWeight: '700', fontSize: 13 }}>
                ➡️ Continuing from previous tool
              </Text>
              <Text style={{ color: muted, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                {sharedFilePath}
              </Text>
            </View>
            <TouchableOpacity onPress={clearState} testID="button-clear-continue">
              <Text style={{ color: '#FF3B30', fontWeight: '600', fontSize: 13 }}>✕ Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PDF Viewer Placeholder */}
        <View style={[styles.viewerCard, { backgroundColor: cardBg }]}>
          <View style={styles.viewerHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>📄 PDF Viewer</Text>
            <TouchableOpacity
              style={[styles.uploadBtn, { backgroundColor: accent }]}
              testID="button-upload-pdf"
            >
              <Text style={styles.uploadBtnText}>+ Open PDF</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.viewerArea, { backgroundColor: isDark ? '#2c2c2e' : '#f0f0f5' }]}>
            <Text style={{ fontSize: 48 }}>📑</Text>
            <Text style={[styles.viewerHint, { color: muted }]}>
              MuPDF C++ Renderer
            </Text>
            <Text style={[styles.viewerSub, { color: isDark ? '#555' : '#bbb' }]}>
              Tap "Open PDF" to preview instantly offline.{'\n'}
              High-res rendering at 300 DPI.
            </Text>
          </View>
        </View>

        {/* Quick Access Tools */}
        <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 12, paddingHorizontal: 4 }]}>
          ⚡ Quick Access
        </Text>
        <View style={styles.quickGrid}>
          {QUICK_TOOLS.map(tool => (
            <TouchableOpacity
              key={tool.id}
              style={[styles.quickCard, { backgroundColor: cardBg }]}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.75}
              testID={`button-quick-${tool.id}`}
            >
              <View style={[styles.quickIconBg, { backgroundColor: tool.color + '22' }]}>
                <Text style={styles.quickIcon}>{tool.icon}</Text>
              </View>
              <Text style={[styles.quickLabel, { color: textColor }]}>{tool.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { num: '20+', label: 'Tools', icon: '🛠️' },
            { num: 'NDK', label: 'Engine', icon: '⚡' },
            { num: 'AI', label: 'OCR', icon: '🤖' },
            { num: '100%', label: 'Offline', icon: '📴' },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statNum, { color: accent }]}>{s.num}</Text>
              <Text style={[styles.statLabel, { color: muted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* View All Tools Button */}
        <TouchableOpacity
          style={[styles.allToolsBtn, { backgroundColor: accent }]}
          onPress={() => router.push('/tools')}
          activeOpacity={0.85}
          testID="button-view-all-tools"
        >
          <Text style={styles.allToolsBtnText}>View All 20+ Tools →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 32 },
  heroCard: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    paddingBottom: 20,
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  themeToggle: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#ffffff30',
  },
  themeIcon: { fontSize: 18 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 13, color: '#ffffffcc', marginBottom: 14 },
  heroTags: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: '#ffffff25', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  continueBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewerCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewerArea: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerHint: { fontSize: 14, fontWeight: '600', marginTop: 10 },
  viewerSub: { fontSize: 12, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  uploadBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
    gap: 8,
  },
  quickCard: {
    width: '30%',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  quickIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickIcon: { fontSize: 22 },
  quickLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statNum: { fontSize: 15, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 2 },
  allToolsBtn: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  allToolsBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
