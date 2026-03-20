import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from './context/ThemeContext';
import { useContinueTool } from './context/ContinueContext';
import * as Haptics from 'expo-haptics';

const QUICK_TOOLS = [
  { id: 'merge',        name: 'Merge',      icon: '🔗', route: '/screens/merge',        color: '#007AFF' },
  { id: 'split',        name: 'Split',       icon: '✂️', route: '/screens/split',        color: '#FF9500' },
  { id: 'compress',     name: 'Compress',    icon: '📦', route: '/screens/compress',     color: '#34C759' },
  { id: 'ocr',          name: 'AI OCR',      icon: '🤖', route: '/screens/ocr',          color: '#AF52DE' },
  { id: 'image-to-pdf', name: 'Img→PDF',     icon: '🖼️', route: '/screens/image-to-pdf', color: '#FF2D55' },
  { id: 'rotate',       name: 'Rotate',      icon: '🔄', route: '/screens/rotate',       color: '#5AC8FA' },
  { id: 'invert',       name: 'Dark Mode',   icon: '🌗', route: '/screens/invert',       color: '#FF6B35' },
  { id: 'organize',     name: 'Organize',    icon: '📋', route: '/screens/organize',     color: '#32ADE6' },
];

const STATS = [
  { num: '20+', label: 'Tools',   icon: '🛠️' },
  { num: 'NDK', label: 'Engine',  icon: '⚡' },
  { num: 'AI',  label: 'OCR',     icon: '🤖' },
  { num: '0',   label: 'Upload',  icon: '📴' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, theme, setTheme } = useAppTheme();
  const { sharedFilePath, clearState } = useContinueTool();

  const bg       = isDark ? '#000000' : '#f2f2f7';
  const cardBg   = isDark ? '#1c1c1e' : '#ffffff';
  const cardBg2  = isDark ? '#2c2c2e' : '#f8f8fc';
  const text     = isDark ? '#ffffff' : '#000000';
  const muted    = isDark ? '#8e8e93' : '#6c6c70';
  const accent   = '#007AFF';
  const border   = isDark ? '#38383a' : '#e5e5ea';

  const cycleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌗';

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: accent }]}>
          <TouchableOpacity style={styles.themeBtn} onPress={cycleTheme} testID="button-theme-toggle">
            <Text style={styles.themeBtnText}>{themeIcon}</Text>
          </TouchableOpacity>

          <View style={styles.heroLogoRow}>
            <Text style={styles.heroLogo}>📑</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.heroTitle}>PDF Power Tools</Text>
              <Text style={styles.heroSub}>NDK Engine · Fully Offline</Text>
            </View>
          </View>

          <View style={styles.tagRow}>
            {['⚡ Ultra Fast', '📴 100% Offline', '🔒 No Upload'].map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Continue Banner */}
        {sharedFilePath && (
          <View style={[styles.banner, { backgroundColor: isDark ? '#FF950015' : '#FFF3E0', borderColor: '#FF9500' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>➡️ Continue from previous tool</Text>
              <Text style={[styles.bannerSub, { color: muted }]} numberOfLines={1}>{sharedFilePath}</Text>
            </View>
            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); clearState(); }} testID="button-clear-continue">
              <Text style={styles.bannerClear}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Access */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: text }]}>⚡ Quick Access</Text>
            <TouchableOpacity onPress={() => router.push('/tools')}>
              <Text style={[styles.seeAll, { color: accent }]}>See All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {QUICK_TOOLS.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.gridCard, { backgroundColor: cardBg }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(tool.route as any);
                }}
                activeOpacity={0.7}
                testID={`button-quick-${tool.id}`}
              >
                <View style={[styles.gridIconBg, { backgroundColor: tool.color + '20' }]}>
                  <Text style={styles.gridIcon}>{tool.icon}</Text>
                </View>
                <Text style={[styles.gridLabel, { color: text }]}>{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: cardBg, borderColor: border }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statNum, { color: accent }]}>{s.num}</Text>
              <Text style={[styles.statLabel, { color: muted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* PDF Viewer Card */}
        <View style={[styles.viewerCard, { backgroundColor: cardBg, borderColor: border }]}>
          <View style={styles.viewerTop}>
            <Text style={[styles.sectionTitle, { color: text }]}>📄 PDF Viewer</Text>
            <TouchableOpacity style={[styles.openBtn, { backgroundColor: accent }]} testID="button-upload-pdf">
              <Text style={styles.openBtnText}>Open PDF</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.viewerArea, { backgroundColor: isDark ? '#2c2c2e' : '#f2f2f7' }]}>
            <Text style={{ fontSize: 44 }}>📑</Text>
            <Text style={[styles.viewerHint, { color: muted }]}>MuPDF · 300 DPI Renderer</Text>
            <Text style={[styles.viewerSub, { color: isDark ? '#555' : '#aaa' }]}>
              Open a PDF to preview instantly — fully offline.
            </Text>
          </View>
        </View>

        {/* View All Button */}
        <TouchableOpacity
          style={[styles.allBtn, { backgroundColor: accent }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/tools'); }}
          activeOpacity={0.85}
          testID="button-view-all-tools"
        >
          <Text style={styles.allBtnText}>Browse All 20+ Tools  →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1 },
  scroll: { flexGrow: 1 },

  hero: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 22,
    padding: 22,
    paddingBottom: 20,
    elevation: 6,
    shadowColor: '#007AFF',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
  },
  themeBtn: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#ffffff28',
    borderRadius: 20, padding: 7,
  },
  themeBtnText: { fontSize: 17 },
  heroLogoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  heroLogo:  { fontSize: 40 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub:   { fontSize: 12, color: '#ffffffbb', marginTop: 2 },
  tagRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:       { backgroundColor: '#ffffff22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText:   { color: '#fff', fontSize: 11, fontWeight: '600' },

  banner: {
    marginHorizontal: 16, marginTop: 12,
    padding: 12, borderRadius: 12, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  bannerTitle: { color: '#FF9500', fontWeight: '700', fontSize: 13 },
  bannerSub:   { fontSize: 11, marginTop: 2 },
  bannerClear: { color: '#FF3B30', fontWeight: '700', fontSize: 18, paddingHorizontal: 6 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { fontSize: 17, fontWeight: '700' },
  seeAll:        { fontSize: 14, fontWeight: '600' },

  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCard: {
    width: '22.5%',
    paddingVertical: 14, paddingHorizontal: 4,
    borderRadius: 16, alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },
  gridIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridIcon:   { fontSize: 22 },
  gridLabel:  { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 20, gap: 10,
  },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 14, borderWidth: 1,
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4,
  },
  statIcon:  { fontSize: 18, marginBottom: 4 },
  statNum:   { fontSize: 15, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2 },

  viewerCard: {
    marginHorizontal: 16, marginTop: 20,
    borderRadius: 18, padding: 16, borderWidth: 1,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8,
  },
  viewerTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  openBtn:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  openBtnText:{ color: '#fff', fontWeight: '700', fontSize: 13 },
  viewerArea: { height: 180, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  viewerHint: { fontSize: 13, fontWeight: '600', marginTop: 10 },
  viewerSub:  { fontSize: 12, marginTop: 5, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },

  allBtn: {
    marginHorizontal: 16, marginTop: 20,
    paddingVertical: 16, borderRadius: 16, alignItems: 'center',
    elevation: 4, shadowColor: '#007AFF', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10,
  },
  allBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});
