import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from './context/ThemeContext';

const TOOL_SECTIONS = [
  {
    title: '✏️ সম্পাদনা ও সাজানো (Edit & Organize)',
    data: [
      { id: 'merge', name: 'Merge PDF', icon: '🔗', route: '/screens/merge', desc: 'একাধিক PDF একত্রিত করুন' },
      { id: 'split', name: 'Split PDF', icon: '✂️', route: '/screens/split', desc: 'PDF ভাগ করুন' },
      { id: 'split-by-line', name: 'Split by Line', icon: '📐', route: '/screens/split-by-line', desc: 'লাইন টেনে পেজ কাটুন' },
      { id: 'rotate', name: 'Rotate', icon: '🔄', route: '/screens/rotate', desc: 'পেজ ঘোরান' },
      { id: 'compress', name: 'Compress', icon: '📦', route: '/screens/compress', desc: 'ফাইল সাইজ কমান' },
      { id: 'organize', name: 'Organize', icon: '📋', route: '/screens/organize', desc: 'পেজ সাজান' },
      { id: 'remove-pages', name: 'Remove Pages', icon: '🗑️', route: '/screens/remove-pages', desc: 'পেজ মুছুন' },
    ],
  },
  {
    title: '🔄 রূপান্তর (Convert)',
    data: [
      { id: 'image-to-pdf', name: 'Image → PDF', icon: '🖼️', route: '/screens/image-to-pdf', desc: 'ছবি থেকে PDF' },
      { id: 'pdf-to-image', name: 'PDF → Image', icon: '📸', route: '/screens/pdf-to-image', desc: 'PDF থেকে ছবি' },
    ],
  },
  {
    title: '🎨 বিশেষ ইফেক্ট (Special Effects)',
    data: [
      { id: 'invert', name: 'Invert Colors', icon: '🌗', route: '/screens/invert', desc: 'রঙ উল্টান' },
      { id: 'whitener', name: 'Whitener', icon: '🧹', route: '/screens/whitener', desc: 'ব্যাকগ্রাউন্ড সাদা করুন' },
      { id: 'enhance-contrast', name: 'Contrast', icon: '🔲', route: '/screens/enhance-contrast', desc: 'কন্ট্রাস্ট বাড়ান' },
      { id: 'grayscale', name: 'Grayscale', icon: '🖤', route: '/screens/grayscale', desc: 'সাদাকালো করুন' },
    ],
  },
  {
    title: '📝 টেক্সট ও OCR',
    data: [
      { id: 'ocr', name: 'AI OCR', icon: '🤖', route: '/screens/ocr', desc: 'টেক্সট এক্সট্রাক্ট করুন' },
    ],
  },
  {
    title: '📐 উন্নত লেআউট (Advanced Layout)',
    data: [
      { id: 'nup', name: 'N-Up', icon: '🔢', route: '/screens/nup', desc: 'এক পেজে বহু পেজ' },
      { id: 'booklet', name: 'Booklet', icon: '📖', route: '/screens/booklet', desc: 'বুকলেট তৈরি' },
      { id: 'four-up-booklet', name: '4-Up Booklet', icon: '📓', route: '/screens/four-up-booklet', desc: 'পকেট বুকলেট' },
      { id: 'resize', name: 'Resize', icon: '📏', route: '/screens/resize', desc: 'পেজ সাইজ পরিবর্তন' },
      { id: 'repair', name: 'Repair', icon: '🔧', route: '/screens/repair', desc: 'ক্ষতিগ্রস্ত PDF মেরামত' },
      { id: 'auto-process', name: 'Auto Process', icon: '⚡', route: '/screens/auto-process', desc: 'পাইপলাইন অটোমেশন' },
    ],
  },
];

export default function ToolsScreen() {
  const router = useRouter();
  const { isDark } = useAppTheme();

  const bg = isDark ? '#121212' : '#f5f5f5';
  const cardBg = isDark ? '#1e1e1e' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const subtextColor = isDark ? '#999999' : '#666666';
  const sectionColor = isDark ? '#bbbbbb' : '#444444';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <SectionList
        sections={TOOL_SECTIONS}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionTitle, { color: sectionColor }]}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: textColor }]}>{item.name}</Text>
              <Text style={[styles.cardDesc, { color: subtextColor }]}>{item.desc}</Text>
            </View>
            <Text style={[styles.arrow, { color: subtextColor }]}>›</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 8,
    paddingLeft: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  icon: {
    fontSize: 28,
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
  },
});
